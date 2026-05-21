const axios = require('axios');

async function test() {
  const baseURL = 'http://localhost:5003/api/v1';
  try {
    // 1. Login
    console.log('Logging in as admin...');
    const loginRes = await axios.post(`${baseURL}/auth/login`, {
      email: 'fahimhasan683031@gmail.com',
      password: 'hello123'
    });
    
    const token = loginRes.data.data.accessToken;
    console.log('Login successful! Token:', token);
    
    // 2. Patch Sponsor
    console.log('Toggling active status of sponsor 6a0ebfd173fb95e5cd72fbf8...');
    const patchRes = await axios.patch(
      `${baseURL}/sponsor/6a0ebfd173fb95e5cd72fbf8`,
      { isActive: true },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    console.log('PATCH Response Status:', patchRes.status);
    console.log('PATCH Response Data:', JSON.stringify(patchRes.data, null, 2));
  } catch (err) {
    if (err.response) {
      console.error('Error Response Status:', err.response.status);
      console.error('Error Response Data:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('Network/Other Error:', err.message);
    }
  }
}

test();
