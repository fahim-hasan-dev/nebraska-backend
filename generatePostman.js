const fs = require('fs');

const collection = {
  info: {
    name: 'Nebraska API Collection - Fixed',
    description: 'Complete, accurate API Collection for Nebraska Project based on exact validation schemas and route definitions.',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
  },
  variable: [
    {
      key: 'base_url',
      value: 'http://localhost:5000/api/v1',
      type: 'string'
    },
    {
      key: 'token',
      value: '',
      type: 'string'
    }
  ],
  item: []
};

const commonHeaders = [
  {
    key: 'Authorization',
    value: 'Bearer {{token}}',
    type: 'text'
  }
];

function createRequest(name, method, path, body = null, queryParams = null) {
  const req = {
    name,
    request: {
      method,
      header: commonHeaders,
      url: {
        raw: '{{base_url}}' + path + (queryParams ? '?' + queryParams.map(q => `${q.key}=${q.value}`).join('&') : ''),
        host: ['{{base_url}}'],
        path: path.split('/').filter(Boolean),
        query: queryParams || []
      }
    },
    response: []
  };

  if (body) {
    if (body.mode === 'formdata') {
      req.request.body = {
        mode: 'formdata',
        formdata: body.formdata
      };
    } else {
      req.request.body = {
        mode: 'raw',
        raw: JSON.stringify(body.raw, null, 2),
        options: {
          raw: {
            language: 'json'
          }
        }
      };
    }
  }

  return req;
}

const folders = {
  'Auth': [
    createRequest('Sign Up', 'POST', '/auth/signup', {
      mode: 'formdata',
      formdata: [
        { key: 'email', value: 'test@example.com', type: 'text' },
        { key: 'password', value: 'password123', type: 'text' },
        { key: 'fullName', value: 'Test User', type: 'text' },
        { key: 'phone', value: '+1234567890', type: 'text' },
        { key: 'address', value: '123 Test St', type: 'text' },
        { key: 'role', value: 'driver', type: 'text' },
        { key: 'vehicleName', value: 'Ford Mustang', type: 'text' },
        { key: 'image', type: 'file', src: [] }
      ]
    }),
    createRequest('Admin Login', 'POST', '/auth/admin-login', { raw: { email: 'admin@example.com', password: 'password123', deviceToken: 'token123' } }),
    createRequest('Login', 'POST', '/auth/login', { raw: { email: 'test@example.com', password: 'password123', deviceToken: 'token123' } }),
    createRequest('Custom Login', 'POST', '/auth/custom-login', { raw: { email: 'test@example.com', password: 'password123' } }),
    createRequest('Verify Account', 'POST', '/auth/verify-account', { raw: { email: 'test@example.com', oneTimeCode: '123456' } }),
    createRequest('Forget Password', 'POST', '/auth/forget-password', { raw: { email: 'test@example.com' } }),
    createRequest('Reset Password', 'POST', '/auth/reset-password', { raw: { newPassword: 'newPassword123', confirmPassword: 'newPassword123' } }),
    createRequest('Resend OTP', 'POST', '/auth/resend-otp', { raw: { email: 'test@example.com', authType: 'createAccount' } }),
    createRequest('Change Password', 'POST', '/auth/change-password', { raw: { currentPassword: 'password123', newPassword: 'newPassword123', confirmPassword: 'newPassword123' } }),
    createRequest('Delete Account', 'DELETE', '/auth/delete-account', { raw: { password: 'password123' } }),
    createRequest('Access Token', 'POST', '/auth/access-token'),
    createRequest('Logout', 'POST', '/auth/logout'),
  ],
  'User': [
    createRequest('Get My Profile', 'GET', '/user/me'),
    createRequest('Get All Users', 'GET', '/user', null, [{ key: 'page', value: '1' }]),
    createRequest('Update Profile', 'PATCH', '/user/profile', {
      mode: 'formdata',
      formdata: [
        { key: 'fullName', value: 'Updated Name', type: 'text' },
        { key: 'phone', value: '+1987654321', type: 'text' },
        { key: 'address', value: '456 Updated St', type: 'text' },
        { key: 'image', type: 'file', src: [] }
      ]
    }),
    createRequest('Delete My Account', 'DELETE', '/user/me'),
    createRequest('Get Single User', 'GET', '/user/{{user_id}}'),
    createRequest('Delete User by ID', 'DELETE', '/user/{{user_id}}'),
  ],
  'Event': [
    createRequest('Create Event', 'POST', '/event/create', {
      mode: 'formdata',
      formdata: [
        { key: 'data', value: JSON.stringify({ name: 'Big Race', date: '2026-10-10', time: '10:00 AM', venue: 'Nebraska Track', additionalInfo: 'Bring helmets', class: [{ name: 'Pro', status: 'pending' }] }), type: 'text' },
        { key: 'pictures', type: 'file', src: [] }
      ]
    }),
    createRequest('Get All Events', 'GET', '/event', null, [{ key: 'page', value: '1' }]),
    createRequest('Get Single Event', 'GET', '/event/{{event_id}}'),
    createRequest('Update Event', 'PATCH', '/event/{{event_id}}', {
      mode: 'formdata',
      formdata: [
        { key: 'data', value: JSON.stringify({ name: 'Updated Race Name' }), type: 'text' },
        { key: 'pictures', type: 'file', src: [] }
      ]
    }),
    createRequest('Delete Event', 'DELETE', '/event/{{event_id}}'),
    createRequest('Add Class to Event', 'POST', '/event/{{event_id}}/class', { raw: { name: 'Amateur', status: 'pending' } }),
    createRequest('Update Class Status', 'PATCH', '/event/{{event_id}}/class/Amateur/status', { raw: { status: 'live' } }),
    createRequest('Delete Class', 'DELETE', '/event/{{event_id}}/class/Amateur'),
  ],
  'Event Registration': [
    createRequest('Submit Registration Request', 'POST', '/event-registration/submit', { raw: { eventId: 'event_id_here', class: 'Pro' } }),
    createRequest('Draw Pulling Order Positions', 'POST', '/event-registration/draw'),
    createRequest('Cancel Drawing Positions', 'POST', '/event-registration/cancel-draw'),
    createRequest('Get Registrations', 'GET', '/event-registration/'),
    createRequest('Get Single Registration', 'GET', '/event-registration/{{registration_id}}'),
    createRequest('Update Status (Admin)', 'PATCH', '/event-registration/{{registration_id}}/status', { raw: { status: 'accepted' } }),
    createRequest('Delete Registration', 'DELETE', '/event-registration/{{registration_id}}'),
  ],
  'Result': [
    createRequest('Create Result', 'POST', '/result/create', { raw: { event: 'event_id', driver: 'driver_id', position: 1, points: 100, class: 'Pro' } }),
    createRequest('Get All Results', 'GET', '/result', null, [{ key: 'page', value: '1' }]),
    createRequest('Get Single Result', 'GET', '/result/{{result_id}}'),
    createRequest('Update Result', 'PATCH', '/result/{{result_id}}', { raw: { position: 2 } }),
    createRequest('Delete Result', 'DELETE', '/result/{{result_id}}'),
  ],
  'Category': [
    createRequest('Create Category', 'POST', '/category/create', {
      mode: 'formdata',
      formdata: [
        { key: 'data', value: JSON.stringify({ name: 'Category Name', isActive: true }), type: 'text' },
        { key: 'image', type: 'file', src: [] }
      ]
    }),
    createRequest('Get All Categories', 'GET', '/category', null, [{ key: 'page', value: '1' }]),
    createRequest('Get Single Category', 'GET', '/category/{{category_id}}'),
    createRequest('Update Category', 'PATCH', '/category/{{category_id}}', {
      mode: 'formdata',
      formdata: [
        { key: 'data', value: JSON.stringify({ name: 'Updated Category Name' }), type: 'text' },
        { key: 'image', type: 'file', src: [] }
      ]
    }),
    createRequest('Delete Category', 'DELETE', '/category/{{category_id}}'),
  ],
  'Sponsor': [
    createRequest('Create Sponsor', 'POST', '/sponsor/create', {
      mode: 'formdata',
      formdata: [
        { key: 'data', value: JSON.stringify({ name: 'Sponsor Name', url: 'https://sponsor.com' }), type: 'text' },
        { key: 'image', type: 'file', src: [] }
      ]
    }),
    createRequest('Get All Sponsors', 'GET', '/sponsor', null, [{ key: 'page', value: '1' }]),
    createRequest('Get Single Sponsor', 'GET', '/sponsor/{{sponsor_id}}'),
    createRequest('Update Sponsor', 'PATCH', '/sponsor/{{sponsor_id}}', {
      mode: 'formdata',
      formdata: [
        { key: 'data', value: JSON.stringify({ name: 'Updated Sponsor' }), type: 'text' },
        { key: 'image', type: 'file', src: [] }
      ]
    }),
    createRequest('Delete Sponsor', 'DELETE', '/sponsor/{{sponsor_id}}'),
  ],
  'Sponsor Request': [
    createRequest('Submit Sponsor Request', 'POST', '/sponsor-request/submit', { raw: { businessName: 'My Business', message: 'I want to sponsor!' } }),
    createRequest('Get All Sponsor Requests', 'GET', '/sponsor-request', null, [{ key: 'page', value: '1' }]),
    createRequest('Get Single Sponsor Request', 'GET', '/sponsor-request/{{request_id}}'),
    createRequest('Update Sponsor Request Status', 'PATCH', '/sponsor-request/{{request_id}}/status', { raw: { status: 'accepted' } }),
    createRequest('Delete Sponsor Request', 'DELETE', '/sponsor-request/{{request_id}}'),
  ],
  'Public': [
    createRequest('Create/Update Public Content', 'POST', '/public', { raw: { type: 'about', content: 'About us content here' } }),
    createRequest('Get Public Content by Type', 'GET', '/public/about'),
    createRequest('Delete Public Content', 'DELETE', '/public/{{id}}'),
    createRequest('Create Contact', 'POST', '/public/contact', { raw: { name: 'John Doe', email: 'john@example.com', message: 'Hello!' } }),
    createRequest('Get All Contacts', 'GET', '/public/contact/all', null, [{ key: 'page', value: '1' }]),
    createRequest('Create FAQ', 'POST', '/public/faq', { raw: { question: 'What is this?', answer: 'This is Nebraska.' } }),
    createRequest('Update FAQ', 'PATCH', '/public/faq/{{faq_id}}', { raw: { question: 'Updated Question?' } }),
    createRequest('Get Single FAQ', 'GET', '/public/faq/single/{{faq_id}}'),
    createRequest('Get All FAQs', 'GET', '/public/faq/all'),
    createRequest('Delete FAQ', 'DELETE', '/public/faq/{{faq_id}}'),
    createRequest('Upload Rolebook', 'POST', '/public/rolebook', {
      mode: 'formdata',
      formdata: [
        { key: 'file', type: 'file', src: [] }
      ]
    }),
    createRequest('Get Rolebook', 'GET', '/public/rolebook'),
  ],
  'Token': [
    createRequest('Create Token', 'POST', '/token', { raw: { deviceToken: 'device_token_string' } }),
    createRequest('Get All Tokens', 'GET', '/token'),
  ],
  'Notification': [
    createRequest('Get All Notifications', 'GET', '/notification', null, [{ key: 'page', value: '1' }]),
    createRequest('Get Unread Count', 'GET', '/notification/unread-count'),
    createRequest('Send Test Push Notification', 'POST', '/notification/test-push', { raw: { title: 'Test', body: 'Test Notification', fcmToken: 'fcm_token_here' } }),
  ],
  'Help & Support': [
    createRequest('Submit Support Ticket', 'POST', '/help-support/submit', {
      mode: 'formdata',
      formdata: [
        { key: 'title', value: 'Password Change Problem Issue', type: 'text' },
        { key: 'description', value: 'Users are unable to update their password due to validation or system error, preventing successful password change.', type: 'text' },
        { key: 'image', type: 'file', src: [] }
      ]
    }),
    createRequest('Get Support Tickets List', 'GET', '/help-support', null, [{ key: 'page', value: '1' }]),
    createRequest('Get Single Support Ticket', 'GET', '/help-support/{{ticket_id}}'),
    createRequest('Resolve Support Ticket (Admin)', 'PATCH', '/help-support/{{ticket_id}}/status', { raw: { status: 'resolved', reply: 'This issue has been successfully resolved. Please try changing your password now.' } }),
    createRequest('Withdraw Support Ticket', 'DELETE', '/help-support/{{ticket_id}}'),
  ]
};

Object.keys(folders).forEach(folderName => {
  collection.item.push({
    name: folderName,
    item: folders[folderName]
  });
});

fs.writeFileSync('./Nebraska_API_Collection.json', JSON.stringify(collection, null, 2));
console.log('Postman collection successfully re-generated at ./Nebraska_API_Collection.json');
