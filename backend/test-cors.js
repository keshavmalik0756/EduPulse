import axios from 'axios';

const testCORS = async () => {
  try {
    console.log('Testing CORS from http://localhost:5173...');
    
    const response = await axios.post(
      'https://edupulse-ko2w.onrender.com/api/auth/login',
      { email: 'test@example.com', password: 'test' },
      {
        headers: {
          'Origin': 'http://localhost:5173',
          'Content-Type': 'application/json',
        },
      }
    );
    
    console.log('✅ CORS test passed!');
    console.log('Response:', response.data);
  } catch (error) {
    console.error('❌ CORS test failed!');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
};

testCORS();
