import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import paymentService from '../../services/paymentService';

const EnrollmentModal = ({ isOpen, onClose, course, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'processing', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStatus(null);
      setMessage('');
    }
  }, [isOpen]);

  const handleEnroll = async () => {
    if (!course) return;

    try {
      setLoading(true);
      setStatus('processing');
      setMessage('Initializing payment...');

      // Load Razorpay script
      const scriptLoaded = await paymentService.loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay. Please check your internet connection.');
      }

      // Create order
      const orderResponse = await paymentService.createOrder(course._id);
      if (!orderResponse.success) {
        throw new Error(orderResponse.message);
      }

      const { orderId, amount, keyId } = orderResponse.data;

      // Prepare Razorpay options
      const userPhone = localStorage.getItem('userPhone');
      const userEmail = localStorage.getItem('userEmail');
      
      const options = {
        key: keyId,
        amount: amount,
        currency: 'INR',
        name: 'EduPulse',
        description: `Enrollment for ${course.title}`,
        order_id: orderId,
        ...(userEmail && { email: userEmail }),
        ...(userPhone && { contact: userPhone }),
        handler: async (response) => {
          try {
            setMessage('Verifying payment...');
            console.log('[EnrollmentModal] Payment successful, verifying:', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id
            });

            // Verify payment
            const verifyResponse = await paymentService.verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );

            console.log('[EnrollmentModal] Verification response:', verifyResponse);

            if (verifyResponse.success) {
              setStatus('success');
              setMessage('🎉 Enrollment successful! Redirecting...');
              setTimeout(() => {
                onSuccess?.();
                onClose();
              }, 2000);
            } else {
              throw new Error(verifyResponse.message || 'Payment verification failed');
            }
          } catch (error) {
            console.error('[EnrollmentModal] Payment verification error:', error);
            setStatus('error');
            setMessage(error.message || 'Payment verification failed');
            try {
              await paymentService.handlePaymentFailure(response.razorpay_order_id);
            } catch (failureError) {
              console.error('[EnrollmentModal] Error handling payment failure:', failureError);
            }
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: localStorage.getItem('userName') || '',
          ...(userEmail && { email: userEmail }),
          ...(userPhone && { contact: userPhone }),
        },
        theme: {
          color: '#6366F1',
        },
        modal: {
          ondismiss: async () => {
            setStatus('error');
            setMessage('Payment cancelled');
            setLoading(false);
          },
        },
      };

      // Open Razorpay modal
      try {
        await paymentService.openRazorpayModal(options);
      } catch (error) {
        console.error('[EnrollmentModal] Razorpay modal error:', error);
        // Modal errors are handled by the payment.failed callback
        // This catch is for script loading or initialization errors
        if (error.message?.includes('not loaded')) {
          setStatus('error');
          setMessage('Failed to load payment gateway. Please refresh and try again.');
          setLoading(false);
        }
      }
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'Failed to initiate payment');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Enroll Now</h2>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Course Info */}
          {course && (
            <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
              <h3 className="font-semibold text-gray-900 mb-2">{course.title}</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Course Price:</span>
                <span className="text-lg font-bold text-indigo-600">
                  ₹{course.finalPrice || course.price}
                </span>
              </div>
              {course.discount > 0 && (
                <div className="mt-2 text-sm text-emerald-600">
                  💰 {course.discount}% discount applied
                </div>
              )}
            </div>
          )}

          {/* Status Messages */}
          {status === 'processing' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200 flex items-center gap-3"
            >
              <Loader className="h-5 w-5 text-blue-600 animate-spin" />
              <div>
                <p className="font-medium text-blue-900">Processing</p>
                <p className="text-sm text-blue-700">{message}</p>
              </div>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center gap-3"
            >
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="font-medium text-emerald-900">Success</p>
                <p className="text-sm text-emerald-700">{message}</p>
              </div>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200 flex items-center gap-3"
            >
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-900">Error</p>
                <p className="text-sm text-red-700">{message}</p>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 border-2 border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleEnroll}
              disabled={loading || status === 'success'}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : status === 'success' ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Enrolled
                </>
              ) : (
                'Pay & Enroll'
              )}
            </motion.button>
          </div>

          {/* Info Text */}
          <p className="mt-4 text-xs text-gray-500 text-center">
            💳 Secure payment powered by Razorpay. Your payment information is encrypted and safe.
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EnrollmentModal;
