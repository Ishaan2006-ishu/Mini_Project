



const jwt            = require('jsonwebtoken');
const bcrypt         = require('bcryptjs');
const User           = require('../models/User');
const Otp            = require('../models/Otp');
const { sendOtpEmail } = require('../utils/sendEmail');
const { AUTH_CONSTANTS, APP_CONSTANTS } = require('../utils/constants');


// Helper — generate 6-digit OTP
const generateOtp = () => {
  const min = 10 ** (AUTH_CONSTANTS.OTP_LENGTH - 1);
  const max = (10 ** AUTH_CONSTANTS.OTP_LENGTH) - 1;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
};

// Helper — generate signed JWT
const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: APP_CONSTANTS.JWT_EXPIRES_IN,
  });


// ── POST /api/auth/register ───────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required',
      });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name must be at least 2 characters',
      });
    }

    if (!/^[\w.-]+@[\w.-]+\.\w{2,}$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'This email is already registered. Please login.',
      });
    }

    const salt           = await bcrypt.genSalt(AUTH_CONSTANTS.BCRYPT_SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = generateOtp();

    await Otp.deleteMany({ email: email.toLowerCase(), purpose: 'registration' });

    await Otp.create({
      email:    email.toLowerCase(),
      name:     name.trim(),
      password: hashedPassword,
      otp,
    });

    await sendOtpEmail(email, name.trim(), otp);

    res.status(200).json({
      success: true,
      message: `OTP sent to ${email}. Please verify to complete registration.`,
    });
  } catch (err) {
    next(err);
  }
};


// ── POST /api/auth/verify-otp ─────────────────────────────
exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required',
      });
    }

    const otpRecord = await Otp.findOne({ email: email.toLowerCase(), purpose: 'registration' });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired or not found. Please register again.',
      });
    }

    if (otpRecord.attempts >= AUTH_CONSTANTS.OTP_MAX_ATTEMPTS) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return res.status(429).json({
        success: false,
        message: 'Too many wrong attempts. Please register again.',
      });
    }

    if (otpRecord.otp !== otp.toString().trim()) {
      await Otp.findByIdAndUpdate(otpRecord._id, { $inc: { attempts: 1 } });
      const remaining = Math.max(AUTH_CONSTANTS.OTP_MAX_ATTEMPTS - (otpRecord.attempts + 1), 0);
      return res.status(400).json({
        success: false,
        message: `Incorrect OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`,
      });
    }

    // ✅ OTP correct — create user account
    await User.create({
      name:     otpRecord.name,
      email:    otpRecord.email,
      password: otpRecord.password,  // already hashed
    });

    await Otp.deleteOne({ _id: otpRecord._id });

    // ✅ NO token — user must login separately
    res.status(201).json({
      success: true,
      message: 'Email verified! Registration successful. Please login to continue.',
    });
  } catch (err) {
    next(err);
  }
};


// ── POST /api/auth/resend-otp ─────────────────────────────
exports.resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const otpRecord = await Otp.findOne({ email: email.toLowerCase(), purpose: 'registration' });
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'No pending registration found. Please register again.',
      });
    }

    const newOtp = generateOtp();

    await Otp.deleteOne({ email: email.toLowerCase(), purpose: 'registration' });
    await Otp.create({
      email:    otpRecord.email,
      name:     otpRecord.name,
      password: otpRecord.password,
      otp:      newOtp,
      purpose:  'registration',
    });

    await sendOtpEmail(otpRecord.email, otpRecord.name, newOtp);

    res.status(200).json({
      success: true,
      message: `New OTP sent to ${email}.`,
    });
  } catch (err) {
    next(err);
  }
};


// ── POST /api/auth/forgot-password ────────────────────────
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email',
      });
    }

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'Account password is missing. Please login support or reset your account.',
      });
    }

    const otp = generateOtp();

    await Otp.deleteMany({ email: email.toLowerCase(), purpose: 'reset_password' });
    await Otp.create({
      email: email.toLowerCase(),
      name: user.name,
      password: user.password, // keep existing password as placeholder
      otp,
      purpose: 'reset_password',
    });

    await sendOtpEmail(user.email, user.name, otp);

    res.status(200).json({
      success: true,
      message: `Password reset OTP sent to ${user.email}`,
    });
  } catch (err) {
    next(err);
  }
};


// ── POST /api/auth/reset-password ────────────────────────
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP and new password are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    const otpRecord = await Otp.findOne({
      email: email.toLowerCase(),
      purpose: 'reset_password',
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Reset OTP expired or not found. Please request again.',
      });
    }

    if (otpRecord.attempts >= AUTH_CONSTANTS.OTP_MAX_ATTEMPTS) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return res.status(429).json({
        success: false,
        message: 'Too many wrong attempts. Please request a new reset OTP.',
      });
    }

    if (otpRecord.otp !== otp.toString().trim()) {
      await Otp.findByIdAndUpdate(otpRecord._id, { $inc: { attempts: 1 } });
      const remaining = Math.max(AUTH_CONSTANTS.OTP_MAX_ATTEMPTS - (otpRecord.attempts + 1), 0);
      return res.status(400).json({
        success: false,
        message: `Incorrect OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`,
      });
    }

    const salt = await bcrypt.genSalt(AUTH_CONSTANTS.BCRYPT_SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { password: hashedPassword },
      { runValidators: true }
    );

    await Otp.deleteOne({ _id: otpRecord._id });

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. Please login with your new password.',
    });
  } catch (err) {
    next(err);
  }
};


// ── POST /api/auth/login ──────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, isPremium: user.isPremium },
    });
  } catch (err) {
    next(err);
  }
};


// ── GET /api/auth/me ──────────────────────────────────────
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isPremium: user.isPremium,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};


// ── PATCH /api/auth/me ───────────────────────────────────
exports.updateMe = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name must be at least 2 characters',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name: name.trim() },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isPremium: user.isPremium,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};