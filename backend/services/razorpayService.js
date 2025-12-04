import Razorpay from "razorpay";
import crypto from "crypto";
import mongoose from "mongoose";
import Payment from "../models/paymentModel.js";
import Course from "../models/courseModel.js";
import User from "../models/userModel.js";

// Initialize Razorpay instance lazily
let razorpay = null;

const getRazorpayInstance = () => {
  if (!razorpay) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error(
        "Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env"
      );
    }
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpay;
};

/**
 * Create Razorpay order for course enrollment
 */
export const createRazorpayOrder = async (userId, courseId) => {
  try {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Check if already enrolled
    if (course.enrolledStudents.includes(userId)) {
      throw new Error("Already enrolled in this course");
    }

    // Validate course pricing
    if (course.finalPrice === undefined || course.finalPrice === null) {
      throw new Error(`Course pricing is invalid. finalPrice: ${course.finalPrice}`);
    }

    // Get the final price (after discount)
    const amount = course.finalPrice * 100; // Razorpay expects amount in paise
    
    if (amount <= 0) {
      throw new Error(`Invalid amount for payment. Amount: ${amount}`);
    }

    // Create Razorpay order
    const options = {
      amount: amount,
      currency: "INR",
      receipt: `receipt_${courseId.toString().substring(0, 12)}_${Date.now().toString().substring(5, 10)}`,
      payment_capture: 1, // Auto-capture payment
      notes: {
        courseId: courseId.toString(),
        userId: userId.toString(),
        courseTitle: course.title,
        userEmail: user.email,
      },
    };

    const razorpayInstance = getRazorpayInstance();
    
    console.log('[RazorpayService] Creating order with options:', {
      amount: options.amount,
      amountInRupees: options.amount / 100,
      currency: options.currency,
      courseId: courseId,
      userId: userId
    });
    
    let order;
    try {
      order = await razorpayInstance.orders.create(options);
      console.log('[RazorpayService] Order created successfully:', order.id);
    } catch (razorpayError) {
      console.error('[RazorpayService] Razorpay API error:', razorpayError);
      throw new Error(`Razorpay API error: ${razorpayError?.message || razorpayError?.toString()}`);
    }

    // Save payment record in database
    const payment = new Payment({
      razorpayOrderId: order.id,
      user: userId,
      course: courseId,
      amount: course.finalPrice,
      currency: "INR",
      status: "pending",
      description: `Enrollment for course: ${course.title}`,
      notes: {
        courseTitle: course.title,
        userEmail: user.email,
      },
    });

    await payment.save();
    console.log('[RazorpayService] Payment record saved:', payment._id);

    return {
      orderId: order.id,
      amount: order.amount,
      amountInRupees: order.amount / 100,
      currency: order.currency,
      paymentId: payment._id,
    };
  } catch (error) {
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    console.error('[RazorpayService] Error in createRazorpayOrder:', errorMessage);
    throw new Error(`Failed to create Razorpay order: ${errorMessage}`);
  }
};

/**
 * Verify Razorpay payment signature
 */
export const verifyPaymentSignature = (
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature
) => {
  try {
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    console.log('[RazorpayService] Verifying signature with body:', body);
    console.log('[RazorpayService] Received signature:', razorpaySignature);
    
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");
    
    console.log('[RazorpayService] Expected signature:', expectedSignature);
    const isValid = expectedSignature === razorpaySignature;
    console.log('[RazorpayService] Signature valid:', isValid);
    
    return isValid;
  } catch (error) {
    console.error('[RazorpayService] Signature verification error:', error);
    throw new Error(`Signature verification failed: ${error.message}`);
  }
};

/**
 * Complete payment and enroll user
 */
export const completePaymentAndEnroll = async (
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature
) => {
  try {
    console.log('[RazorpayService] Completing payment and enrollment:', {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    });
    
    // Verify signature
    const isSignatureValid = verifyPaymentSignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isSignatureValid) {
      throw new Error("Invalid payment signature");
    }

    // Find payment record
    const payment = await Payment.findOne({ razorpayOrderId });
    if (!payment) {
      throw new Error("Payment record not found");
    }
    
    console.log('[RazorpayService] Found payment record:', {
      paymentId: payment._id,
      userId: payment.user,
      courseId: payment.course,
      amount: payment.amount,
      status: payment.status
    });

    // Update payment status
    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    payment.status = "completed";
    payment.completedAt = new Date();
    await payment.save();
    
    console.log('[RazorpayService] Payment record updated to completed:', {
      paymentId: payment._id,
      completedAt: payment.completedAt
    });

    // Enroll user in course
    const course = await Course.findById(payment.course).populate('creator', 'name email');
    if (!course) {
      throw new Error("Course not found");
    }
    
    console.log('[RazorpayService] Found course:', {
      courseId: course._id,
      courseTitle: course.title,
      creator: course.creator?.name,
      currentEnrolledCount: course.enrolledStudents?.length || 0
    });

    // Get user details
    const user = await User.findById(payment.user);
    console.log('[RazorpayService] User details:', {
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      currentEnrolledCoursesCount: user.enrolledCourses?.length || 0
    });

    // Add student to course if not already enrolled
    if (!course.enrolledStudents.includes(payment.user)) {
      course.enrolledStudents.push(payment.user);
      course.totalEnrolled += 1;
      await course.save();
      console.log('[RazorpayService] ✅ User enrolled in course:', {
        userId: payment.user,
        courseId: course._id,
        courseTitle: course.title,
        newEnrolledCount: course.enrolledStudents.length,
        totalEnrolled: course.totalEnrolled
      });
    } else {
      console.log('[RazorpayService] ⚠️ User already enrolled in course:', {
        userId: payment.user,
        courseId: course._id,
        courseTitle: course.title
      });
    }

    // Add course to user's enrolledCourses
    const updatedUser = await User.findByIdAndUpdate(
      payment.user,
      { $addToSet: { enrolledCourses: payment.course } },
      { runValidators: true, new: true }
    );
    
    console.log('[RazorpayService] ✅ Course added to user profile:', {
      userId: updatedUser._id,
      userName: updatedUser.name,
      courseId: payment.course,
      courseTitle: course.title,
      totalEnrolledCourses: updatedUser.enrolledCourses?.length || 0,
      enrolledCoursesList: updatedUser.enrolledCourses?.map(c => c.toString()) || []
    });

    console.log('[RazorpayService] 🎉 ENROLLMENT COMPLETE - Summary:', {
      paymentId: payment._id,
      razorpayOrderId: razorpayOrderId,
      razorpayPaymentId: razorpayPaymentId,
      userId: payment.user,
      userName: user.name,
      userEmail: user.email,
      courseId: course._id,
      courseTitle: course.title,
      courseCreator: course.creator?.name,
      amount: payment.amount,
      currency: payment.currency,
      completedAt: payment.completedAt,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      message: "Payment verified and enrollment completed",
      payment,
      course,
    };
  } catch (error) {
    console.error('[RazorpayService] Payment completion error:', error);
    throw new Error(`Payment completion failed: ${error.message}`);
  }
};

/**
 * Handle failed payment
 */
export const handleFailedPayment = async (razorpayOrderId) => {
  try {
    const payment = await Payment.findOne({ razorpayOrderId });
    if (payment) {
      payment.status = "failed";
      await payment.save();
    }
    return payment;
  } catch (error) {
    throw new Error(`Failed to handle payment failure: ${error.message}`);
  }
};

/**
 * Get payment history for user
 */
export const getUserPaymentHistory = async (userId) => {
  try {
    const payments = await Payment.find({ user: userId })
      .populate("course", "title thumbnail finalPrice")
      .sort({ createdAt: -1 });
    return payments;
  } catch (error) {
    throw new Error(`Failed to fetch payment history: ${error.message}`);
  }
};

/**
 * Get course payment statistics
 */
export const getCoursePaymentStats = async (courseId) => {
  try {
    const stats = await Payment.aggregate([
      { $match: { course: mongoose.Types.ObjectId(courseId), status: "completed" } },
      {
        $group: {
          _id: "$course",
          totalRevenue: { $sum: "$amount" },
          totalPayments: { $sum: 1 },
          averageAmount: { $avg: "$amount" },
        },
      },
    ]);
    return stats[0] || { totalRevenue: 0, totalPayments: 0, averageAmount: 0 };
  } catch (error) {
    throw new Error(`Failed to fetch payment stats: ${error.message}`);
  }
};
