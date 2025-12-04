import apiClient from '../utils/apiClient';

const paymentService = {
  /**
   * Create Razorpay order for course enrollment
   */
  createOrder: async (courseId) => {
    try {
      if (!courseId) {
        throw new Error('Course ID is required');
      }
      
      console.log('[PaymentService] Creating order for course:', courseId);
      
      const response = await apiClient.post('/payments/create-order', {
        courseId,
      });
      
      console.log('[PaymentService] Order created successfully:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('[PaymentService] Error creating order:', error);
      const errorData = error.response?.data || error;
      throw errorData;
    }
  },

  /**
   * Verify payment and complete enrollment
   */
  verifyPayment: async (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
    try {
      console.log('[PaymentService] 🔍 Verifying payment:', {
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature: razorpaySignature?.substring(0, 20) + '...'
      });

      const response = await apiClient.post('/payments/verify', {
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      });

      console.log('[PaymentService] ✅ Payment verification successful:', {
        success: response.data.success,
        message: response.data.message,
        paymentId: response.data.data?.payment?._id,
        userId: response.data.data?.payment?.user,
        courseId: response.data.data?.course?._id,
        courseTitle: response.data.data?.course?.title,
        isEnrolled: response.data.data?.enrollment?.isEnrolled
      });

      console.log('[PaymentService] 📊 Full Enrollment Details:', {
        razorpayOrderId: razorpayOrderId,
        razorpayPaymentId: razorpayPaymentId,
        paymentRecord: {
          id: response.data.data?.payment?._id,
          userId: response.data.data?.payment?.user,
          courseId: response.data.data?.payment?.course,
          amount: response.data.data?.payment?.amount,
          status: response.data.data?.payment?.status,
          completedAt: response.data.data?.payment?.completedAt
        },
        courseRecord: {
          id: response.data.data?.course?._id,
          title: response.data.data?.course?.title,
          totalEnrolled: response.data.data?.course?.totalEnrolled,
          enrolledStudentsCount: response.data.data?.course?.enrolledStudents?.length
        },
        enrollmentStatus: response.data.data?.enrollment
      });

      return response.data;
    } catch (error) {
      console.error('[PaymentService] ❌ Payment verification error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        errorData: error.response?.data,
        fullError: error
      });
      throw error.response?.data || error;
    }
  },

  /**
   * Handle payment failure
   */
  handlePaymentFailure: async (razorpayOrderId) => {
    try {
      const response = await apiClient.post('/payments/handle-failure', {
        razorpayOrderId,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get user's payment history
   */
  getPaymentHistory: async () => {
    try {
      const response = await apiClient.get('/payments/history');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get payment details
   */
  getPaymentDetails: async (paymentId) => {
    try {
      const response = await apiClient.get(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get course payment statistics
   */
  getCourseStats: async (courseId) => {
    try {
      const response = await apiClient.get(`/payments/course/${courseId}/stats`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Load Razorpay script
   */
  loadRazorpayScript: () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  },

  /**
   * Open Razorpay payment modal
   */
  openRazorpayModal: (options) => {
    return new Promise((resolve, reject) => {
      try {
        // Ensure Razorpay is available
        if (!window.Razorpay) {
          throw new Error('Razorpay script not loaded');
        }

        // Wrap the handler to resolve the promise
        const originalHandler = options.handler;
        options.handler = async (response) => {
          console.log('[PaymentService] 💳 Handler called with response:', response);
          try {
            console.log('[PaymentService] 🔄 Calling original handler...');
            // Call the original handler
            if (originalHandler) {
              console.log('[PaymentService] ⏳ Awaiting original handler...');
              await originalHandler(response);
              console.log('[PaymentService] ✅ Original handler completed successfully');
            } else {
              console.warn('[PaymentService] ⚠️ No original handler provided');
            }
            console.log('[PaymentService] ✅ Resolving promise...');
            resolve(response);
          } catch (error) {
            console.error('[PaymentService] ❌ Error in handler:', {
              message: error.message,
              error: error,
              stack: error.stack
            });
            reject(error);
          }
        };

        const rzp = new window.Razorpay(options);
        
        rzp.on('payment.failed', (response) => {
          console.error('[PaymentService] ❌ Payment failed event:', {
            errorCode: response.error?.code,
            errorDescription: response.error?.description,
            errorSource: response.error?.source,
            errorReason: response.error?.reason,
            fullError: response.error
          });
          reject(response.error);
        });

        rzp.open();
      } catch (error) {
        console.error('[PaymentService] Error opening Razorpay modal:', error);
        reject(error);
      }
    });
  },


};

export default paymentService;
