const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOtpEmail = async (toEmail, toName, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: 'MockMate Pro — Your OTP Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;
                  border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">

        <!-- Header -->
        <div style="background: #01696f; padding: 24px 32px;">
          <h2 style="color: white; margin: 0; font-size: 20px;">MockMate Pro</h2>
          <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 13px;">
            AI-Powered Interview Preparation
          </p>
        </div>

        <!-- Body -->
        <div style="padding: 32px;">
          <p style="font-size: 16px; color: #28251d; margin: 0 0 8px;">
            Hi <strong>${toName}</strong>,
          </p>
          <p style="font-size: 14px; color: #7a7974; margin: 0 0 24px; line-height: 1.6;">
            Use the OTP below to verify your email address and complete your registration.
            This code expires in <strong>10 minutes</strong>.
          </p>

          <!-- OTP Box -->
          <div style="background: #f3f0ec; border-radius: 8px; padding: 24px;
                      text-align: center; margin-bottom: 24px;">
            <p style="margin: 0 0 8px; font-size: 13px; color: #7a7974; 
                      text-transform: uppercase; letter-spacing: 1px;">
              Your OTP Code
            </p>
            <p style="margin: 0; font-size: 40px; font-weight: 700;
                      letter-spacing: 12px; color: #01696f;">
              ${otp}
            </p>
          </div>

          <p style="font-size: 13px; color: #bab9b4; margin: 0; line-height: 1.6;">
            If you did not request this, please ignore this email.
            Your account will not be created without OTP verification.
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #f7f6f2; padding: 16px 32px; border-top: 1px solid #dcd9d5;">
          <p style="margin: 0; font-size: 12px; color: #bab9b4;">
            © 2026 MockMate Pro. This is an automated email — please do not reply.
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOtpEmail };