import { catchAsyncErrors } from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import User from "../models/userModel.js";
import admin from "../config/firebaseAdmin.js";
import { getCachedUser, cacheUser } from "../middleware/cacheMiddleware.js";

const sendToken = (user, statusCode, res) => {
  const token = user.generateToken();
  const refreshToken = user.generateRefreshToken ? user.generateRefreshToken() : null;

  const options = {
    expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
    httpOnly: true,
    secure: true, // REQUIRED for SameSite=None
    sameSite: "None", // REQUIRED for cross-origin Vercel <-> Render
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
    refreshToken,
    message: "Authenticated successfully",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      description: user.description,
      firebaseUid: user.firebaseUid
    }
  });
};

/* ========================================================
   SYNC FIREBASE USER (LOGIN / REGISTER)
======================================================== */
export const syncUser = catchAsyncErrors(async (req, res, next) => {
  const { idToken, role = "student" } = req.body;

  if (!idToken) {
    return next(new ErrorHandler("Firebase ID token is required", 400));
  }

  // Ensure Firebase Admin is loaded
  if (!admin || !admin.app()) {
    return next(new ErrorHandler("Firebase Admin SDK is not configured on the server. Please add Service Account details.", 500));
  }

  let decodedToken;
  try {
    decodedToken = await admin.auth().verifyIdToken(idToken);
  } catch (error) {
    console.error("Firebase Token Error:", error);
    return next(new ErrorHandler("Invalid or expired Firebase token", 401));
  }

  const { uid, email, name, picture, email_verified } = decodedToken;

  if (!email) {
    return next(new ErrorHandler("Email not provided by authentication provider", 400));
  }

  // 1. Try to find user by firebaseUid
  let user = await User.findOne({ firebaseUid: uid });

  // 2. Try to find user by email (for migration of existing users who had passwords)
  if (!user) {
    user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      // Migrate existing user to use Firebase
      user.firebaseUid = uid;
      user.accountVerified = email_verified || user.accountVerified;
      if (picture && !user.photoUrl) user.photoUrl = picture;
      await user.save();
    }
  }

  // 3. Create new user if still not found
  if (!user) {
    // Validate role
    const validRoles = ["student", "educator"];
    const userRole = validRoles.includes(role) ? role : "student";

    try {
      user = await User.create({
        name: name || email.split("@")[0],
        email: email.toLowerCase(),
        firebaseUid: uid,
        role: userRole,
        photoUrl: picture || "",
        accountVerified: email_verified || false,
      });
    } catch (err) {
      if (err.code === 11000) {
        return next(new ErrorHandler(`A user with this email already exists.`, 400));
      }
      throw err;
    }
  } else {
    // Always update emailVerified flag from latest firebase token
    if (email_verified && !user.accountVerified) {
      user.accountVerified = true;
      await user.save();
    }
  }

  // Generate our custom backend JWT and set cookie
  sendToken(user, 200, res);
});


/* ========================================================
   LOGOUT
======================================================== */
export const logout = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: true, // REQUIRED for SameSite=None
      sameSite: "None",
    })
    .json({
      success: true,
      message: "Logged out successfully from backend server.",
    });
});

/* ========================================================
   GET USER (ME)
======================================================== */
export const getUser = catchAsyncErrors(async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "User not authenticated"
    });
  }

  const cachedUser = await getCachedUser(req.user._id);
  if (cachedUser) {
    return res.status(200).json({
      success: true,
      user: cachedUser,
    });
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    res.cookie("token", "", { expires: new Date(0), httpOnly: true });
    return next(new ErrorHandler("User no longer exists. Please register again.", 401));
  }

  await cacheUser(user);

  res.status(200).json({
    success: true,
    user: user,
  });
});
