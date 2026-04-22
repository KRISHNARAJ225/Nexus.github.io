import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.SERVER_PORT || 5000;

// SMTP configuration for Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify connection configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP Connection Error Details:', error);
  } else {
    console.log('Mail server is ready to take our messages');
  }
});


app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  // Generate a reset token
  const resetToken = Math.random().toString(36).substring(2, 15);
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetLink = `${frontendUrl}/reset-password/${resetToken}`;

  const mailOptions = {
    from: `"StockFlow Support" <${process.env.SMTP_USER}>`, // From must match authenticated user
    to: email,
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #1b2559;">Reset Your Password</h2>
        <p>Hello,</p>
        <p>We received a request to reset your password. Click the button below to choose a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #1b2559; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
        </div>
        <p>If you did not request this, you can safely ignore this email.</p>
        <p>Best regards,<br>The StockFlow Team</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin-top: 20px;">
        <p style="font-size: 10px; color: #888; word-break: break-all;">${resetLink}</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    res.status(200).json({ message: 'Reset link sent to your email.' });
  } catch (error) {
    console.error('CRITICAL: Detailed Nodemailer Error:', error); // Log full error details for debugging
    res.status(500).json({ message: 'Failed to send reset link. Please check server logs for details.' });
  }
});

app.post('/api/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Token and new password are required' });
  }

  try {
    // In a real app, you would verify the token against your database
    // and update the user's password. For this demo, we'll simulate success.
    console.log(`Simulating password reset for token: ${token}`);

    // Note: To send a confirmation email, we'd ideally have the email address here.
    // In a real flow, you'd lookup the email associated with the token.
    
    res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
