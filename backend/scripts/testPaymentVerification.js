import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = 'https://edupulse-ko2w.onrender.com/api';

// Test data - replace with actual values from your test
const TEST_DATA = {
  // Get these from your browser console after payment
  razorpayOrderId: 'order_RnXyotIh8WB0KJ', // Replace with actual order ID
  razorpayPaymentId: 'pay_RnXywBAN53wGw3', // Replace with actual payment ID
  razorpaySignature: '58a16a3fd292c0a10fbed209adfc9568d0bcd7387c11ddec634db847aed4d0f0', // Replace with actual signature
  token: '', // Replace with your JWT token from localStorage
};

async function testPaymentVerification() {
  try {
    console.log('🔍 Testing Payment Verification...\n');
    console.log('Test Data:', {
      razorpayOrderId: TEST_DATA.razorpayOrderId,
      razorpayPaymentId: TEST_DATA.razorpayPaymentId,
      razorpaySignature: TEST_DATA.razorpaySignature?.substring(0, 20) + '...',
      hasToken: !!TEST_DATA.token
    });

    if (!TEST_DATA.token) {
      console.error('❌ ERROR: No token provided. Get your token from localStorage in browser console.');
      console.log('Steps:');
      console.log('1. Open browser console (F12)');
      console.log('2. Run: localStorage.getItem("token")');
      console.log('3. Copy the token and paste it in TEST_DATA.token');
      return;
    }

    console.log('\n📤 Sending verification request...\n');

    const response = await axios.post(
      `${API_BASE_URL}/payments/verify`,
      {
        razorpayOrderId: TEST_DATA.razorpayOrderId,
        razorpayPaymentId: TEST_DATA.razorpayPaymentId,
        razorpaySignature: TEST_DATA.razorpaySignature,
      },
      {
        headers: {
          'Authorization': `Bearer ${TEST_DATA.token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ SUCCESS! Payment verified.\n');
    console.log('Response:', JSON.stringify(response.data, null, 2));

    if (response.data.success) {
      console.log('\n🎉 Enrollment Details:');
      console.log('- Payment ID:', response.data.data?.payment?._id);
      console.log('- User ID:', response.data.data?.payment?.user);
      console.log('- Course ID:', response.data.data?.course?._id);
      console.log('- Course Title:', response.data.data?.course?.title);
      console.log('- Is Enrolled:', response.data.data?.enrollment?.isEnrolled);
      console.log('- Total Enrolled:', response.data.data?.course?.totalEnrolled);
    }
  } catch (error) {
    console.error('❌ ERROR! Payment verification failed.\n');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the test
testPaymentVerification();
