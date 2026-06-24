import config from '../config'
import { ICreateAccount, IResetPassword } from '../interfaces/emailTemplate'

const createAccount = (values: ICreateAccount) => {
  console.log(values, 'values')
  const data = {
    to: values.email,
    subject: `Verify your Nebraska Bush Puller account, ${values.name}`,
    html: `
<body style="margin:0; padding:0; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0"
         style="max-width:640px; margin:40px auto; background-color:#ffffff; border-radius:14px;
                overflow:hidden; box-shadow:0 5px 25px rgba(0,0,0,0.08);">
    
    <!-- Body -->
    <tr>
      <td style="padding:45px;">
        <h1 style="color:#5690ff; font-size:26px; font-weight:700; margin-bottom:15px; text-align:center;">
          Verify Your Email ✨
        </h1>

        <p style="color:#1e293b; font-size:16px; line-height:1.6; margin-bottom:25px; text-align:center;">
          Hey <strong>${values.name}</strong>, welcome to <strong>Nebraska Bush Puller</strong>! 🎉<br>
          Please verify your email to activate your account.
        </p>

        <!-- OTP Box -->
        <div style="background:linear-gradient(145deg,#EBF2FF,#D7E4FF); border:2px solid #5690ff; 
                    border-radius:12px; padding:25px 0; text-align:center; margin:30px auto; max-width:300px;">
          <span style="font-size:40px; font-weight:700; color:#1e293b; letter-spacing:6px;">
            ${values.otp}
          </span>
        </div>

        <p style="color:#1e293b; font-size:15px; line-height:1.6; text-align:center;">
          This code will expire in <strong>5 minutes</strong>.<br>
          If you didn’t request this, you can safely ignore this email.
        </p>

        <!-- Tip -->
        <div style="margin-top:35px; background-color:#fff8e1; border-left:6px solid #ffd54f; 
                    border-radius:8px; padding:15px 18px;">
          <p style="margin:0; color:#4a4a4a; font-size:14px;">
            🔒 For security reasons, never share this code with anyone.
          </p>
        </div>

        <!-- Button -->
        <div style="text-align:center; margin-top:45px;">
          <a href="${config.frontend_url}/otp-verify" 
             style="background-color:#5690ff; color:#ffffff; padding:14px 32px; font-size:16px; 
                    font-weight:600; border-radius:10px; text-decoration:none; display:inline-block; 
                    box-shadow:0 4px 12px rgba(86,144,255,0.3); transition:all 0.3s;">
            Open App 🚀
          </a>
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td align="center" style="background:linear-gradient(135deg,#F5F8FF,#E6EEFF); padding:25px 20px; border-top:1px solid #5690ff33;">
        <p style="margin:0; color:#1e293b; font-size:13px;">
          © ${new Date().getFullYear()} <strong>Nebraska Bush Puller</strong>. All rights reserved.
        </p>
        <p style="margin:6px 0 0; color:#1e293b; font-size:13px;">
          Powered by <strong style="color:#5690ff;">Nebraska Bush Puller API</strong> ✨
        </p>
      </td>
    </tr>

  </table>
</body>
    `,
  }
  return data
}

const resetPassword = (values: IResetPassword) => {
  console.log(values, 'values')
  const data = {
    to: values.email,
    subject: `Reset your Nebraska Bush Puller password, ${values.name}`,
    html: `
<body style="margin:0; padding:0; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0"
         style="max-width:640px; margin:40px auto; background-color:#ffffff; border-radius:14px;
                overflow:hidden; box-shadow:0 5px 25px rgba(0,0,0,0.08);">
    
    <!-- Body -->
    <tr>
      <td style="padding:45px;">
        <h1 style="color:#5690ff; font-size:26px; font-weight:700; margin-bottom:15px; text-align:center;">
          Password Reset Request 🔐
        </h1>

        <p style="color:#1e293b; font-size:16px; line-height:1.6; margin-bottom:25px; text-align:center;">
          Hi <strong>${values.name}</strong>, 👋<br>
          We received a request to reset your password for your <strong>Nebraska Bush Puller</strong> account.
          <br>Enter the code below to complete the process:
        </p>

        <!-- OTP Box -->
        <div style="background:linear-gradient(145deg,#EBF2FF,#D7E4FF); border:2px solid #5690ff;
                    border-radius:12px; padding:25px 0; text-align:center; margin:30px auto; max-width:300px;">
          <span style="font-size:40px; font-weight:700; color:#1e293b; letter-spacing:6px;">
            ${values.otp}
          </span>
        </div>

        <p style="color:#1e293b; font-size:15px; line-height:1.6; text-align:center;">
          This verification code is valid for <strong>5 minutes</strong>.<br>
          If you didn’t request this, please ignore this email — your account is safe.
        </p>

        <!-- Tip -->
        <div style="margin-top:35px; background-color:#fff8e1;
                    border-left:6px solid #ffd54f;
                    border-radius:8px; padding:15px 18px;">
          <p style="margin:0; color:#4a4a4a; font-size:14px;">
            ⚠️ <strong>Security Tip:</strong> Never share your reset code with anyone. Nebraska Bush Puller will never ask for it.
          </p>
        </div>

        <!-- Button -->
        <div style="text-align:center; margin-top:45px;">
          <a href="${config.frontend_url}/otp-verify" target="_blank"
             style="background-color:#5690ff; color:#ffffff; padding:14px 32px; font-size:16px;
                    font-weight:600; border-radius:10px; text-decoration:none; display:inline-block;
                    box-shadow:0 4px 12px rgba(86,144,255,0.3); transition:all 0.3s;">
            🔑 Reset Password
          </a>
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td align="center" style="background:linear-gradient(135deg,#F5F8FF,#E6EEFF); padding:25px 20px; border-top:1px solid #5690ff33;">
        <p style="margin:0; color:#1e293b; font-size:13px;">
          © ${new Date().getFullYear()} <strong>Nebraska Bush Puller</strong>. All rights reserved.
        </p>
        <p style="margin:6px 0 0; color:#1e293b; font-size:13px;">
          Powered by <strong style="color:#5690ff;">Nebraska Bush Puller API</strong> ✨
        </p>
      </td>
    </tr>

  </table>
</body>
    `,
  }

  return data
}

const resendOtp = (values: {
  email: string
  name: string
  otp: string
  type: 'resetPassword' | 'createAccount'
}) => {
  console.log(values, 'values')
  const isReset = values.type === 'resetPassword'

  const data = {
    to: values.email,
    subject: `${isReset ? 'Password Reset' : 'Account Verification'} - New Code`,
    html: `
   <body style="margin:0; padding:0; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0"
         style="max-width:640px; margin:40px auto; background:#ffffff; border-radius:14px;
                overflow:hidden; box-shadow:0 5px 25px rgba(0,0,0,0.08);">

    <!-- Body -->
    <tr>
      <td style="padding:45px;">
        <h1 style="color:#5690ff; font-size:26px; font-weight:700; margin-bottom:15px; text-align:center;">
          ${isReset ? 'Reset Your Password 🔐' : 'Verify Your Account 🚀'}
        </h1>

        <p style="color:#1e293b; font-size:16px; line-height:1.6; margin-bottom:25px; text-align:center;">
          Hi <strong>${values.name}</strong>, 👋<br>
          ${isReset
            ? 'You requested a new verification code to reset your Nebraska Bush Puller password.'
            : 'Here is your new verification code to complete your Nebraska Bush Puller account setup.'
          }<br>
          Use the code below to continue:
        </p>

        <!-- OTP Box -->
        <div style="background:linear-gradient(145deg,#EBF2FF,#D7E4FF);
                    border:2px solid #5690ff; border-radius:12px;
                    padding:25px 0; text-align:center;
                    margin:30px auto; max-width:300px;">
          <span style="font-size:40px; font-weight:700; color:#1e293b; letter-spacing:6px;">
            ${values.otp}
          </span>
        </div>

        <p style="color:#1e293b; font-size:15px; line-height:1.6; text-align:center;">
          This code is valid for <strong>5 minutes</strong>.<br>
          If this was not you, please ignore the email.
        </p>

        <!-- Tip -->
        <div style="margin-top:35px; background-color:#fff8e1;
                    border-left:6px solid #ffd54f;
                    border-radius:8px; padding:15px 18px;">
          <p style="margin:0; color:#4a4a4a; font-size:14px;">
            🔒 <strong>Security Tip:</strong> Never share your OTP with anyone. Nebraska Bush Puller will never request it.
          </p>
        </div>

        <!-- Button -->
        <div style="text-align:center; margin-top:45px;">
          <a href="${config.frontend_url}/otp-verify"
             style="background-color:#5690ff; color:#ffffff; padding:14px 32px;
                    font-size:16px; font-weight:600; border-radius:10px;
                    text-decoration:none; display:inline-block;
                    box-shadow:0 4px 12px rgba(86,144,255,0.3);">
            ${isReset ? 'Reset Password' : 'Verify Account'}
          </a>
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td align="center" style="background:linear-gradient(135deg,#F5F8FF,#E6EEFF); padding:25px 20px; border-top:1px solid #5690ff33;">
        <p style="margin:0; color:#64748b; font-size:13px;">
          © ${new Date().getFullYear()} <strong>Nebraska Bush Puller</strong>. All rights reserved.
        </p>
        <p style="margin:6px 0 0; color:#1e293b; font-size:13px;">
          Powered by <strong style="color:#5690ff;">Nebraska Bush Puller API</strong> 🚀
        </p>
      </td>
    </tr>

  </table>
</body>
    `,
  }

  return data
}

const adminContactNotificationEmail = (payload: {
  name: string
  email: string
  phone?: string
  message: string
}) => {
  return {
    to: config.super_admin.email as string,
    subject: '📩 New Contact Form Submission – Nebraska Bush Puller',
    html: `
<body style="margin:0; padding:0; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0"
         style="max-width:640px; margin:40px auto; background-color:#ffffff; border-radius:14px;
                overflow:hidden; box-shadow:0 5px 25px rgba(0,0,0,0.08);">

    <!-- Body -->
    <tr>
      <td style="padding:45px;">
        <h1 style="color:#5690ff; font-size:26px; font-weight:700; margin-bottom:20px; text-align:center;">
          📬 New Contact Submission
        </h1>

        <p style="color:#1e293b; font-size:16px; text-align:center; margin-bottom:30px;">
          A new contact message has been submitted on <strong>Nebraska Bush Puller</strong>.
        </p>

        <!-- Contact Details -->
        <table style="width:100%; border-collapse:collapse; margin:20px 0;">
          <tr>
            <td style="padding:12px 0; font-size:15px; color:#1e293b;">👤 <strong>Name:</strong></td>
            <td style="padding:12px 0; font-size:15px; color:#1e293b; text-align:right;">
              ${payload.name}
            </td>
          </tr>

          <tr style="border-top:1px solid #5690ff22;">
            <td style="padding:12px 0; font-size:15px; color:#1e293b;">📧 <strong>Email:</strong></td>
            <td style="padding:12px 0; font-size:15px; color:#1e293b; text-align:right;">
              ${payload.email}
            </td>
          </tr>

          <tr style="border-top:1px solid #5690ff22;">
            <td style="padding:12px 0; font-size:15px; color:#1e293b;">📞 <strong>Phone:</strong></td>
            <td style="padding:12px 0; font-size:15px; color:#1e293b; text-align:right;">
              ${payload.phone || 'N/A'}
            </td>
          </tr>
        </table>

        <!-- Message Box -->
        <div style="background:linear-gradient(145deg,#EBF2FF,#D7E4FF); border:2px solid #5690ff;
                    border-radius:12px; padding:20px; margin-top:30px;">
          <p style="margin:0; font-size:15px; color:#1e293b; line-height:1.6;">
            “${payload.message}”
          </p>
        </div>

        <p style="color:#1e293b; font-size:14px; margin-top:30px; text-align:center;">
          You can respond directly to <strong>${payload.email}</strong>.
        </p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td align="center" 
          style="background:linear-gradient(135deg,#F5F8FF,#E6EEFF); padding:25px 20px; border-top:1px solid #5690ff33;">
        <p style="margin:0; color:#1e293b; font-size:13px;">
          © ${new Date().getFullYear()} <strong>Nebraska Bush Puller</strong>. All rights reserved.
        </p>
        <p style="margin:6px 0 0; color:#1e293b; font-size:13px;">
          Powered by <strong style="color:#5690ff;">Nebraska Bush Puller API</strong> 
        </p>
      </td>
    </tr>

  </table>
</body>
    `,
  }
}

const userContactConfirmationEmail = (payload: {
  name: string
  email: string
  message: string
}) => {
  return {
    to: payload.email,
    subject: '💬 Thank You for Contacting Nebraska Bush Puller',
    html: `
<body style="margin:0; padding:0; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0"
         style="max-width:640px; margin:40px auto; background-color:#ffffff; border-radius:14px;
                overflow:hidden; box-shadow:0 5px 25px rgba(0,0,0,0.08);">

    <!-- Body -->
    <tr>
      <td style="padding:45px;">
        <h1 style="color:#5690ff; font-size:26px; font-weight:700; margin-bottom:20px; text-align:center;">
          Thank You for Contacting Us 💙
        </h1>

        <p style="color:#1e293b; font-size:16px; line-height:1.6; text-align:center;">
          Dear <strong>${payload.name}</strong>,<br>
          We’ve received your message! Our support team will reach out to you shortly.
        </p>

        <!-- User Message -->
        <div style="background:linear-gradient(145deg,#EBF2FF,#D7E4FF); border:2px solid #5690ff; 
                    border-radius:12px; padding:25px 20px; text-align:center; margin:30px auto; max-width:500px;">
          <p style="font-size:15px; color:#1e293b; line-height:1.6; margin:0;">
            <em>“${payload.message}”</em>
          </p>
        </div>

        <p style="color:#1e293b; font-size:15px; line-height:1.6; text-align:center;">
          Thanks for reaching out to <strong>Nebraska Bush Puller</strong>.<br>
          We truly appreciate your message 💙
        </p>

        <!-- Button -->
        <div style="text-align:center; margin-top:40px;">
          <a href="${config.frontend_url}"
             style="background-color:#5690ff; color:#ffffff; padding:14px 32px; font-size:16px; 
                    font-weight:600; border-radius:10px; text-decoration:none; display:inline-block; 
                    box-shadow:0 4px 12px rgba(86,144,255,0.3); transition:all 0.3s;">
            Open App 
          </a>
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td align="center" 
          style="background:linear-gradient(135deg,#F5F8FF,#E6EEFF); padding:25px 20px; border-top:1px solid #5690ff33;">
        <p style="margin:0; color:#1e293b; font-size:13px;">
          © ${new Date().getFullYear()} <strong>Nebraska Bush Puller</strong>. All rights reserved.
        </p>
        <p style="margin:6px 0 0; color:#1e293b; font-size:13px;">
          Powered by <strong style="color:#5690ff;">Nebraska Bush Puller API</strong> ✨
        </p>
      </td>
    </tr>

  </table>
</body>
    `,
  }
}

const driverAccountCreated = (values: { name: string; email: string; password: string }) => {
  return {
    to: values.email,
    subject: 'Welcome to Nebraska Bush Puller – Your Driver Account Credentials',
    html: `
<body style="margin:0; padding:0; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0"
         style="max-width:640px; margin:40px auto; background-color:#ffffff; border-radius:14px;
                overflow:hidden; box-shadow:0 5px 25px rgba(0,0,0,0.08);">
    
    <!-- Body -->
    <tr>
      <td style="padding:45px;">
        <h1 style="color:#5690ff; font-size:26px; font-weight:700; margin-bottom:15px; text-align:center;">
          Driver Account Created 🚗
        </h1>

        <p style="color:#1e293b; font-size:16px; line-height:1.6; margin-bottom:25px; text-align:center;">
          Hello <strong>${values.name}</strong>,<br>
          An administrator has created a driver account for you on <strong>Nebraska Bush Puller</strong>! ✨
        </p>

        <!-- Credentials Box -->
        <div style="background-color:#F5F8FF; border:1px solid #5690ff33; border-radius:12px; padding:20px; margin:30px auto; max-width:400px;">
          <p style="margin:0 0 10px 0; color:#1e293b; font-size:15px;"><strong>Email:</strong> ${values.email}</p>
          <p style="margin:0; color:#1e293b; font-size:15px;"><strong>Password:</strong> ${values.password}</p>
        </div>

        <p style="color:#1e293b; font-size:15px; line-height:1.6; text-align:center;">
          Your account is already verified. You can log in immediately using the credentials above and change your password in the app.
        </p>

        <!-- Button -->
        <div style="text-align:center; margin-top:45px;">
          <a href="${config.frontend_url}/login" 
             style="background-color:#5690ff; color:#ffffff; padding:14px 32px; font-size:16px; 
                    font-weight:600; border-radius:10px; text-decoration:none; display:inline-block; 
                    box-shadow:0 4px 12px rgba(86,144,255,0.3); transition:all 0.3s;">
            Log In Now 🚀
          </a>
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td align="center" style="background:linear-gradient(135deg,#F5F8FF,#E6EEFF); padding:25px 20px; border-top:1px solid #5690ff33;">
        <p style="margin:0; color:#1e293b; font-size:13px;">
          © ${new Date().getFullYear()} <strong>Nebraska Bush Puller</strong>. All rights reserved.
        </p>
      </td>
    </tr>

  </table>
</body>
    `,
  }
}

export const emailTemplate = {
  createAccount,
  resetPassword,
  resendOtp,
  userContactConfirmationEmail,
  adminContactNotificationEmail,
  driverAccountCreated,
}
