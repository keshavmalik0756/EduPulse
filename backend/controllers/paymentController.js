import {
  createRazorpayOrder,
  completePaymentAndEnroll,
  handleFailedPayment,
  getUserPaymentHistory,
  getCoursePaymentStats,
} from "../services/razorpayService.js";
import Payment from "../models/paymentModel.js";

/**
 * @route   POST /api/payments/create-order
 * @desc    Create Razorpay order for course enrollment
 * @access  Private
 */
export const createOrder = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user._id;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    console.log(`[Payment] Creating order for user: ${userId}, course: ${courseId}`);

    const orderData = await createRazorpayOrder(userId, courseId);

    console.log(`[Payment] Order created successfully:`, orderData);

    res.status(200).json({
      success: true,
      message: "Order created successfully",
      data: orderData,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    const errorMessage = error?.message || error?.toString() || 'Unknown error occurred';
    console.error(`[Payment] Error creating order:`, errorMessage);
    console.error(`[Payment] Full error:`, error);
    res.status(400).json({
      success: false,
      message: errorMessage,
    });
  }
};

/**
 * @route   POST /api/payments/verify
 * @desc    Verify payment and complete enrollment
 * @access  Private
 */
export const verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const userId = req.user._id;
    
    console.log('[PaymentController] 🔍 Starting payment verification:', {
      userId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature: razorpaySignature?.substring(0, 20) + '...'
    });

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification details",
      });
    }

    const result = await completePaymentAndEnroll(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );
    
    console.log('[PaymentController] ✅ Payment verification successful:', {
      success: result.success,
      paymentId: result.payment?._id,
      userId: result.payment?.user,
      courseId: result.course?._id,
      courseTitle: result.course?.title,
      enrolledStudentsCount: result.course?.enrolledStudents?.length,
      totalEnrolled: result.course?.totalEnrolled
    });

    console.log('[PaymentController] 📊 Enrollment Response Summary:', {
      paymentId: result.payment?._id,
      razorpayOrderId: razorpayOrderId,
      razorpayPaymentId: razorpayPaymentId,
      userId: userId,
      courseId: result.course?._id,
      courseTitle: result.course?.title,
      isEnrolled: true,
      timestamp: new Date().toISOString()
    });

    res.status(200).json({
      success: true,
      message: "Payment verified and enrollment completed",
      data: {
        payment: result.payment,
        course: result.course,
        enrollment: {
          courseId: result.course?._id,
          userId: userId,
          isEnrolled: true
        }
      },
    });
  } catch (error) {
    console.error('[PaymentController] ❌ Payment verification error:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @route   POST /api/payments/handle-failure
 * @desc    Handle failed payment
 * @access  Private
 */
export const handlePaymentFailure = async (req, res) => {
  try {
    const { razorpayOrderId } = req.body;

    if (!razorpayOrderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    const payment = await handleFailedPayment(razorpayOrderId);

    res.status(200).json({
      success: true,
      message: "Payment failure recorded",
      data: payment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @route   GET /api/payments/history
 * @desc    Get user's payment history
 * @access  Private
 */
export const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const payments = await getUserPaymentHistory(userId);

    res.status(200).json({
      success: true,
      message: "Payment history retrieved",
      data: payments,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @route   GET /api/payments/course/:courseId/stats
 * @desc    Get course payment statistics
 * @access  Private (Educator/Admin only)
 */
export const getCourseStats = async (req, res) => {
  try {
    const { courseId } = req.params;

    const stats = await getCoursePaymentStats(courseId);

    res.status(200).json({
      success: true,
      message: "Course payment stats retrieved",
      data: stats,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @route   GET /api/payments/:paymentId
 * @desc    Get payment details
 * @access  Private
 */
export const getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user._id;

    const payment = await Payment.findById(paymentId)
      .populate("course", "title thumbnail finalPrice")
      .populate("user", "name email");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Check if user owns this payment
    if (payment.user._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment details retrieved",
      data: payment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
