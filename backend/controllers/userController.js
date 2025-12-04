import { catchAsyncErrors } from "../middleware/catchAsyncErrors.js";
import User from "../models/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import bcrypt from "bcryptjs";
import { uploadOnCloudinary, deleteFromCloudinary } from "../services/cloudinary.js";

// ==========================================
// USER MANAGEMENT CONTROLLERS
// ==========================================

// Fetch all verified users for EduPulse platform
export const getAllUsers = catchAsyncErrors(async (req, res, next) => {
    const { role, page = 1, limit = 10, search } = req.query;
    
    // Build query object
    const query = { accountVerified: true };
    
    // Filter by role if provided
    if (role && ['student', 'educator', 'admin'].includes(role)) {
        query.role = role;
    }
    
    // Add search functionality
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Fetch users with pagination
    const users = await User.find(query)
        .select('-password -verificationCode -verificationCodeExpire -resetPasswordToken -resetPasswordTokenExpire')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
    
    // Get total count for pagination
    const totalUsers = await User.countDocuments(query);
    
    res.status(200).json({
        success: true,
        users,
        pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalUsers / limit),
            totalUsers,
            hasNextPage: page * limit < totalUsers,
            hasPrevPage: page > 1
        }
    });
});

// Get user profile
export const getUserProfile = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id)
        .select('-password -verificationCode -verificationCodeExpire -resetPasswordToken -resetPasswordTokenExpire');
    
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }
    
    res.status(200).json({
        success: true,
        user
    });
});

// Get complete user profile with role-specific information
export const getUserProfileComplete = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .select('-password -verificationCode -verificationCodeExpire -resetPasswordToken -resetPasswordTokenExpire')
    .populate({
      path: 'enrolledCourses',
      select: 'title description category level price thumbnail totalEnrolled averageRating totalDurationMinutes enrollmentStatus createdAt updatedAt slug'
    });
  
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // Get role-specific statistics
  let roleStats = {};
  
  try {
    switch (user.role) {
      case 'student':
        roleStats = {
          totalCourses: user.enrolledCourses ? user.enrolledCourses.length : 0,
          completedCourses: 0, // This would come from course progress tracking
          averageGrade: 0, // This would come from grades collection
          studyStreak: 0 // This would come from activity tracking
        };
        break;
        
      case 'educator':
        // These would come from actual course and student collections
        const Course = mongoose.model("Course");
        const courses = await Course.find({ creator: user._id });
        const totalStudents = await Course.aggregate([
          { $match: { creator: user._id } },
          { $unwind: "$enrolledStudents" },
          { $group: { _id: null, count: { $sum: 1 } } }
        ]);
        
        roleStats = {
          coursesTeaching: courses.length,
          totalStudents: totalStudents.length > 0 ? totalStudents[0].count : 0,
          averageRating: courses.length > 0 ? 
            courses.reduce((sum, course) => sum + (course.averageRating || 0), 0) / courses.length : 0,
          coursesCreated: courses.length
        };
        break;
        
      case 'admin':
        // These would come from system-wide statistics
        const totalUsers = await User.countDocuments().catch(() => 0);
        const totalCourses = await mongoose.model("Course").countDocuments().catch(() => 0);
        roleStats = {
          totalUsers,
          totalCourses,
          systemUptime: '99.9%',
          pendingApprovals: 0
        };
        break;
    }
  } catch (error) {
    console.error('Error fetching role stats:', error);
    roleStats = {};
  }

  res.status(200).json({
    success: true,
    user,
    roleStats,
    profileCompleteness: {
      hasName: !!user.name,
      hasEmail: !!user.email,
      hasDescription: !!user.description,
      hasPhoto: !!(user.photoUrl || user.avatar?.url),
      percentage: Math.round(
        ([user.name, user.email, user.description, (user.photoUrl || user.avatar?.url)]
          .filter(Boolean).length / 4) * 100
      )
    }
  });
});

// ==========================================
// PROFILE UPDATE CONTROLLERS
// ==========================================

// Update user profile with enhanced image upload and role-specific fields
export const updateUserProfile = catchAsyncErrors(async (req, res, next) => {
    const { name, email, description, photoUrl } = req.body;
    const userId = req.user.id;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    // Validate email format if provided
    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return next(new ErrorHandler("Please provide a valid email address", 400));
        }
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
        const existingUser = await User.findOne({ email, _id: { $ne: userId } });
        if (existingUser) {
            return next(new ErrorHandler("Email already exists", 400));
        }
    }

    // Validate description length based on role
    if (description !== undefined) {
        const maxDescriptionLength = {
            student: 500,
            educator: 1000,
            admin: 300
        };
        
        const maxLength = maxDescriptionLength[user.role] || 500;
        if (description.length > maxLength) {
            return next(new ErrorHandler(`Description should not exceed ${maxLength} characters for ${user.role}`, 400));
        }
    }

    // Validate photoUrl if provided
    if (photoUrl) {
        const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
        if (!urlRegex.test(photoUrl)) {
            return next(new ErrorHandler("Please provide a valid photo URL", 400));
        }
    }

    // Handle avatar upload if provided
    let avatarData = user.avatar;
    if (req.file) {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(req.file.mimetype)) {
            return next(new ErrorHandler("Please upload a valid image file (JPEG, PNG, WebP)", 400));
        }

        // Validate file size (5MB limit)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (req.file.size > maxSize) {
            return next(new ErrorHandler("Image size should be less than 5MB", 400));
        }

        try {
            // Delete old avatar from cloudinary if exists
            if (user.avatar && user.avatar.public_id) {
                await deleteFromCloudinary(user.avatar.public_id);
            }

            // Upload new avatar to role-specific folder
            const folderName = `EduPulse_${user.role.charAt(0).toUpperCase() + user.role.slice(1)}_Avatars`;
            const cloudinaryResponse = await uploadOnCloudinary(req.file.path, folderName);
            
            if (cloudinaryResponse) {
                avatarData = {
                    public_id: cloudinaryResponse.public_id,
                    url: cloudinaryResponse.secure_url
                };
            } else {
                return next(new ErrorHandler("Failed to upload avatar image", 500));
            }
        } catch (error) {
            console.error("Avatar upload error:", error);
            return next(new ErrorHandler("Failed to upload avatar image", 500));
        }
    }

    // Prepare update data
    const updateData = {
        name: name || user.name,
        email: email || user.email,
        description: description !== undefined ? description : user.description,
        photoUrl: photoUrl !== undefined ? photoUrl : user.photoUrl,
        avatar: avatarData
    };

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
    ).select('-password -verificationCode -verificationCodeExpire -resetPasswordToken -resetPasswordTokenExpire');

    res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user: updatedUser
    });
});

// Update user description (role-specific)
export const updateUserDescription = catchAsyncErrors(async (req, res, next) => {
    const { description } = req.body;
    const userId = req.user.id;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    // Validate description is provided
    if (description === undefined || description === null) {
        return next(new ErrorHandler("Description is required", 400));
    }

    // Role-specific validation and requirements
    const roleRequirements = {
        student: {
            maxLength: 500,
            suggestions: [
                "Academic interests and goals",
                "Current study focus",
                "Learning objectives",
                "Extracurricular activities"
            ]
        },
        educator: {
            maxLength: 1000,
            suggestions: [
                "Teaching experience and expertise",
                "Subject specializations",
                "Educational philosophy",
                "Professional qualifications",
                "Research interests"
            ]
        },
        admin: {
            maxLength: 300,
            suggestions: [
                "Administrative role and responsibilities",
                "Platform management experience",
                "Contact information for users"
            ]
        }
    };

    const requirements = roleRequirements[user.role];
    
    // Validate description length
    if (description.length > requirements.maxLength) {
        return next(new ErrorHandler(`Description should not exceed ${requirements.maxLength} characters for ${user.role}`, 400));
    }

    // Update user description
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { description },
        { new: true, runValidators: true }
    ).select('-password -verificationCode -verificationCodeExpire -resetPasswordToken -resetPasswordTokenExpire');

    res.status(200).json({
        success: true,
        message: "Description updated successfully",
        user: updatedUser,
        roleRequirements: requirements
    });
});

// Update user photo URL
export const updateUserPhotoUrl = catchAsyncErrors(async (req, res, next) => {
    const { photoUrl } = req.body;
    const userId = req.user.id;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    // Validate photoUrl
    if (!photoUrl) {
        return next(new ErrorHandler("Photo URL is required", 400));
    }

    // Validate URL format
    const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (!urlRegex.test(photoUrl)) {
        return next(new ErrorHandler("Please provide a valid photo URL", 400));
    }

    // Additional validation for image URLs
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    const hasImageExtension = imageExtensions.some(ext => 
        photoUrl.toLowerCase().includes(ext)
    );

    if (!hasImageExtension) {
        return next(new ErrorHandler("URL should point to an image file", 400));
    }

    // Update user photo URL
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { photoUrl },
        { new: true, runValidators: true }
    ).select('-password -verificationCode -verificationCodeExpire -resetPasswordToken -resetPasswordTokenExpire');

    res.status(200).json({
        success: true,
        message: "Photo URL updated successfully",
        user: updatedUser
    });
});

// ==========================================
// AVATAR MANAGEMENT CONTROLLERS
// ==========================================

// Update user avatar only
export const updateUserAvatar = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user.id;

    // Check if file is provided
    if (!req.file) {
        return next(new ErrorHandler("Please select an image to upload", 400));
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(req.file.mimetype)) {
        return next(new ErrorHandler("Please upload a valid image file (JPEG, PNG, WebP)", 400));
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (req.file.size > maxSize) {
        return next(new ErrorHandler("Image size should be less than 5MB", 400));
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    try {
        // Delete old avatar from cloudinary if exists
        if (user.avatar && user.avatar.public_id) {
            try {
                await deleteFromCloudinary(user.avatar.public_id);
            } catch (deleteError) {
                console.error("Error deleting old avatar from Cloudinary:", deleteError);
                // Don't fail the request if we can't delete the old avatar
            }
        }

        // Upload new avatar to role-specific folder
        const folderName = `EduPulse_${user.role.charAt(0).toUpperCase() + user.role.slice(1)}_Avatars`;
        const cloudinaryResponse = await uploadOnCloudinary(req.file.path, folderName);
        
        if (!cloudinaryResponse) {
            return next(new ErrorHandler("Failed to upload avatar image to Cloudinary", 500));
        }

        if (!cloudinaryResponse.url || !cloudinaryResponse.public_id) {
            return next(new ErrorHandler("Invalid response from Cloudinary service", 500));
        }

        // Update user avatar
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                avatar: {
                    public_id: cloudinaryResponse.public_id,
                    url: cloudinaryResponse.url
                }
            },
            { new: true, runValidators: true }
        ).select('-password -verificationCode -verificationCodeExpire -resetPasswordToken -resetPasswordTokenExpire');

        // Validate that the update was successful
        if (!updatedUser) {
            return next(new ErrorHandler("Failed to update user avatar", 500));
        }

        res.status(200).json({
            success: true,
            message: "Avatar updated successfully",
            user: updatedUser,
            avatar: {
                public_id: cloudinaryResponse.public_id,
                url: cloudinaryResponse.url
            }
        });

    } catch (error) {
        console.error("Avatar update error:", error);
        // Log detailed error information for debugging
        if (error.response) {
            console.error("Cloudinary API error response:", error.response.data);
        }
        if (error.request) {
            console.error("Cloudinary API error request:", error.request);
        }
        return next(new ErrorHandler("Failed to update avatar: " + error.message, 500));
    }
});

// Remove user avatar
export const removeUserAvatar = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user.id;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    // Check if user has an avatar
    if (!user.avatar || !user.avatar.public_id) {
        return next(new ErrorHandler("No avatar found to remove", 400));
    }

    try {
        // Delete avatar from cloudinary
        const deleteResult = await deleteFromCloudinary(user.avatar.public_id);
        
        // Check if deletion was successful
        if (!deleteResult) {
            console.warn("Failed to delete avatar from Cloudinary, but continuing with database update");
        }

        // Remove avatar from user document
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $unset: { avatar: 1 }
            },
            { new: true, runValidators: true }
        ).select('-password -verificationCode -verificationCodeExpire -resetPasswordToken -resetPasswordTokenExpire');

        // Validate that the update was successful
        if (!updatedUser) {
            return next(new ErrorHandler("Failed to remove user avatar", 500));
        }

        res.status(200).json({
            success: true,
            message: "Avatar removed successfully",
            user: updatedUser
        });

    } catch (error) {
        console.error("Avatar removal error:", error);
        return next(new ErrorHandler("Failed to remove avatar: " + error.message, 500));
    }
});

// ==========================================
// PROFILE REQUIREMENTS CONTROLLER
// ==========================================

// Get role-specific profile requirements
export const getProfileRequirements = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    const roleRequirements = {
        student: {
            description: {
                maxLength: 500,
                placeholder: "Tell us about your academic interests, goals, and what you're currently studying...",
                suggestions: [
                    "Academic interests and goals",
                    "Current study focus and major",
                    "Learning objectives for this semester",
                    "Extracurricular activities",
                    "Career aspirations"
                ]
            },
            photoUrl: {
                description: "Optional: Add a link to your profile photo",
                placeholder: "https://example.com/your-photo.jpg"
            },
            avatar: {
                description: "Upload a profile picture (JPEG, PNG, WebP - Max 5MB)",
                folder: "EduPulse_Student_Avatars"
            }
        },
        educator: {
            description: {
                maxLength: 1000,
                placeholder: "Describe your teaching experience, expertise, and educational philosophy...",
                suggestions: [
                    "Teaching experience and years in education",
                    "Subject specializations and expertise areas",
                    "Educational philosophy and teaching methods",
                    "Professional qualifications and certifications",
                    "Research interests and publications",
                    "Notable achievements in education"
                ]
            },
            photoUrl: {
                description: "Professional photo URL for your educator profile",
                placeholder: "https://example.com/professional-photo.jpg"
            },
            avatar: {
                description: "Upload a professional profile picture (JPEG, PNG, WebP - Max 5MB)",
                folder: "EduPulse_Educator_Avatars"
            }
        },
        admin: {
            description: {
                maxLength: 300,
                placeholder: "Brief description of your administrative role and contact information...",
                suggestions: [
                    "Administrative role and responsibilities",
                    "Platform management experience",
                    "Contact information for users",
                    "Office hours and availability"
                ]
            },
            photoUrl: {
                description: "Official photo URL for admin profile",
                placeholder: "https://example.com/admin-photo.jpg"
            },
            avatar: {
                description: "Upload an official profile picture (JPEG, PNG, WebP - Max 5MB)",
                folder: "EduPulse_Admin_Avatars"
            }
        }
    };

    res.status(200).json({
        success: true,
        role: user.role,
        requirements: roleRequirements[user.role],
        currentProfile: {
            name: user.name,
            email: user.email,
            description: user.description,
            photoUrl: user.photoUrl,
            avatar: user.avatar
        }
    });
});

// ==========================================
// ADMIN CONTROLLERS
// ==========================================

// Register a new admin for EduPulse
export const registerNewAdmin = catchAsyncErrors(async (req, res, next) => {
    const { name, email, password } = req.body;

    // Check if all fields are provided
    if (!name || !email || !password) {
        return next(new ErrorHandler("Please provide all required fields", 400));
    }

    // Check if the user is already registered
    const isRegistered = await User.findOne({ email });
    if (isRegistered) {
        return next(new ErrorHandler("User with this email already exists", 400));
    }

    // Validate password strength
    if (password.length < 8 || password.length > 16) {
        return next(new ErrorHandler("Password should be between 8 to 16 characters long", 400));
    }
    
    // Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(password)) {
        return next(new ErrorHandler("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character", 400));
    }

    // Handle avatar upload
    let avatarData = null;
    if (req.file) {
        try {
            const cloudinaryResponse = await uploadOnCloudinary(req.file.path, "EduPulse_Admin_Avatars");
            if (cloudinaryResponse) {
                avatarData = {
                    public_id: cloudinaryResponse.public_id,
                    url: cloudinaryResponse.secure_url
                };
            }
        } catch (error) {
            return next(new ErrorHandler("Failed to upload avatar image", 500));
        }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the new admin user
    const admin = await User.create({
        name,
        email,
        password: hashedPassword,
        role: "admin",
        accountVerified: true,
        avatar: avatarData
    });

    // Send response with admin details (excluding sensitive data)
    res.status(201).json({
        success: true,
        message: "Admin registered successfully for EduPulse platform",
        admin: {
            _id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
            accountVerified: admin.accountVerified,
            avatar: admin.avatar,
            createdAt: admin.createdAt,
            updatedAt: admin.updatedAt,
        },
    });
});

// Register a new educator
export const registerNewEducator = catchAsyncErrors(async (req, res, next) => {
    const { name, email, password, specialization, experience } = req.body;

    // Check if all required fields are provided
    if (!name || !email || !password) {
        return next(new ErrorHandler("Please provide all required fields", 400));
    }

    // Check if the user is already registered
    const isRegistered = await User.findOne({ email });
    if (isRegistered) {
        return next(new ErrorHandler("User with this email already exists", 400));
    }

    // Validate password
    if (password.length < 8 || password.length > 16) {
        return next(new ErrorHandler("Password should be between 8 to 16 characters long", 400));
    }

    // Handle avatar upload
    let avatarData = null;
    if (req.file) {
        try {
            const cloudinaryResponse = await uploadOnCloudinary(req.file.path, "EduPulse_Educator_Avatars");
            if (cloudinaryResponse) {
                avatarData = {
                    public_id: cloudinaryResponse.public_id,
                    url: cloudinaryResponse.secure_url
                };
            }
        } catch (error) {
            return next(new ErrorHandler("Failed to upload avatar image", 500));
        }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the new educator
    const educator = await User.create({
        name,
        email,
        password: hashedPassword,
        role: "educator",
        accountVerified: false, // Educators need verification
        avatar: avatarData,
        specialization: specialization || null,
        experience: experience || null
    });

    res.status(201).json({
        success: true,
        message: "Educator registration successful. Please verify your email to complete the process.",
        educator: {
            _id: educator._id,
            name: educator.name,
            email: educator.email,
            role: educator.role,
            accountVerified: educator.accountVerified,
            avatar: educator.avatar,
            specialization: educator.specialization,
            experience: educator.experience,
            createdAt: educator.createdAt
        }
    });
});

// Delete user (Admin only)
export const deleteUser = catchAsyncErrors(async (req, res, next) => {
    const { userId } = req.params;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }
    
    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.id) {
        return next(new ErrorHandler("You cannot delete your own account", 400));
    }
    
    // Delete user
    await User.findByIdAndDelete(userId);
    
    res.status(200).json({
        success: true,
        message: "User deleted successfully"
    });
});

// Get user statistics (Admin only)
export const getUserStats = catchAsyncErrors(async (req, res, next) => {
    const totalUsers = await User.countDocuments({ accountVerified: true });
    const totalStudents = await User.countDocuments({ role: 'student', accountVerified: true });
    const totalEducators = await User.countDocuments({ role: 'educator', accountVerified: true });
    const totalAdmins = await User.countDocuments({ role: 'admin', accountVerified: true });
    const pendingVerifications = await User.countDocuments({ accountVerified: false });
    
    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentRegistrations = await User.countDocuments({
        createdAt: { $gte: thirtyDaysAgo },
        accountVerified: true
    });
    
    res.status(200).json({
        success: true,
        stats: {
            totalUsers,
            totalStudents,
            totalEducators,
            totalAdmins,
            pendingVerifications,
            recentRegistrations
        }
    });
});

// Get single user by ID (Admin only)
export const getUserById = catchAsyncErrors(async (req, res, next) => {
    const { userId } = req.params;
    
    const user = await User.findById(userId)
        .select('-password -verificationCode -verificationCodeExpire -resetPasswordToken -resetPasswordTokenExpire');
    
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }
    
    res.status(200).json({
        success: true,
        user
    });
});

// Update user role (Admin only)
export const updateUserRole = catchAsyncErrors(async (req, res, next) => {
    const { userId } = req.params;
    const { role } = req.body;
    
    // Validate role
    if (!['student', 'educator', 'admin'].includes(role)) {
        return next(new ErrorHandler("Invalid role specified", 400));
    }
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }
    
    // Prevent admin from changing their own role
    if (user._id.toString() === req.user.id) {
        return next(new ErrorHandler("You cannot change your own role", 400));
    }
    
    // Update user role
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { role },
        { new: true, runValidators: true }
    ).select('-password -verificationCode -verificationCodeExpire -resetPasswordToken -resetPasswordTokenExpire');
    
    res.status(200).json({
        success: true,
        message: `User role updated to ${role} successfully`,
        user: updatedUser
    });
});

// Verify user account (Admin only)
export const verifyUserAccount = catchAsyncErrors(async (req, res, next) => {
    const { userId } = req.params;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }
    
    // Update verification status
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { accountVerified: true },
        { new: true, runValidators: true }
    ).select('-password -verificationCode -verificationCodeExpire -resetPasswordToken -resetPasswordTokenExpire');
    
    res.status(200).json({
        success: true,
        message: "User account verified successfully",
        user: updatedUser
    });
});

// Get user settings
export const getUserSettings = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    // Default settings structure
    const defaultSettings = {
        learning: {
            studyReminders: true,
            dailyGoal: 60,
            preferredStudyTime: 'morning',
            difficultyLevel: 'intermediate',
            autoPlayVideos: true,
            showSubtitles: true,
            playbackSpeed: 1.0,
            darkModeForReading: false
        },
        notifications: {
            courseDeadlines: true,
            assignmentReminders: true,
            gradeUpdates: true,
            newCourseContent: true,
            discussionReplies: true,
            weeklyProgress: true,
            achievementUnlocked: true,
            studyStreakReminders: true,
            emailDigest: 'weekly'
        },
        privacy: {
            profileVisibility: 'public',
            showProgress: true,
            showAchievements: true,
            allowStudyBuddyRequests: true,
            shareStudyStats: false,
            showOnlineStatus: true
        },
        accessibility: {
            fontSize: 'medium',
            highContrast: false,
            reducedMotion: false,
            screenReader: false,
            keyboardNavigation: false,
            colorBlindSupport: false
        },
        security: {
            twoFactorEnabled: false,
            loginAlerts: true,
            sessionTimeout: 120,
            autoLogout: false,
            deviceTrust: true
        }
    };

    // Merge user settings with defaults
    const userSettings = { ...defaultSettings, ...user.settings };

    res.status(200).json({
        success: true,
        settings: userSettings
    });
});

// Update user settings
export const updateUserSettings = catchAsyncErrors(async (req, res, next) => {
    const { section, settings } = req.body;
    
    if (!section || !settings) {
        return next(new ErrorHandler("Section and settings are required", 400));
    }

    const user = await User.findById(req.user.id);
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    // Initialize settings if not exists
    if (!user.settings) {
        user.settings = {};
    }

    // Update the specific section
    user.settings[section] = settings;
    user.markModified('settings');
    
    await user.save();

    res.status(200).json({
        success: true,
        message: "Settings updated successfully",
        settings: user.settings
    });
});

// Export user data
export const exportUserData = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id)
        .select('-password -verificationCode -verificationCodeExpire -resetPasswordToken -resetPasswordTokenExpire');
    
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    const exportData = {
        profile: {
            name: user.name,
            email: user.email,
            role: user.role,
            description: user.description,
            photoUrl: user.photoUrl,
            avatar: user.avatar,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        },
        settings: user.settings || {},
        exportDate: new Date().toISOString(),
        platform: "EduPulse Learning Platform"
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="edupulse-profile-${user.name.replace(/\s+/g, '-')}-${Date.now()}.json"`);
    
    res.status(200).json(exportData);
});

// Delete user account
export const deleteUserAccount = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    // Remove avatar from cloudinary if exists
    if (user.avatar && user.avatar.public_id) {
        try {
            await deleteFromCloudinary(user.avatar.public_id);
        } catch (error) {
            console.log("Error deleting avatar from cloudinary:", error);
        }
    }

    // Delete user account
    await User.findByIdAndDelete(req.user.id);

    res.status(200).json({
        success: true,
        message: "Account deleted successfully"
    });
});