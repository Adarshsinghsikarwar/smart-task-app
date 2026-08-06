import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import OTP from "../models/OTP.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// @route POST /api/auth/signup
export const signup = async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;

    if (!name || !email || !password || !otp) {
      return res.status(400).json({ message: "All fields, including verification code, are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Verify OTP
    const otpRecord = await OTP.findOne({ email });
    if (!otpRecord || otpRecord.otp !== otp) {
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }

    // OTP is valid, delete it
    await OTP.deleteOne({ email });

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // process.env.NODE_ENV === "production"
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Signup failed", error: error.message });
  }
};

// @route POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Email is wrong" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Password is wrong" });
    }

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // process.env.NODE_ENV === "production"
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

// @route GET /api/auth/me
export const getMe = async (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
  });
};

// @route POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal whether the email exists
      return res.json({ message: "If that email exists, a reset link has been sent" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    try {
      await sendEmail({
        to: user.email,
        subject: "Password Reset Request",
        text: `Reset your password using this link (valid for 15 minutes): ${resetUrl}`,
      });
    } catch (emailErr) {
      console.log(`\n==================================================`);
      console.log(`[DEV MODE] Password Reset URL for ${user.email}: ${resetUrl}`);
      console.log(`==================================================\n`);
      console.error("Email sending failed:", emailErr.message);
      
      return res.json({ message: "If that email exists, a reset link has been sent (Logged to console in dev mode)" });
    }

    res.json({ message: "If that email exists, a reset link has been sent" });
  } catch (error) {
    res.status(500).json({ message: "Request failed", error: error.message });
  }
};

// @route POST /api/auth/reset-password/:token
export const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: "Reset failed", error: error.message });
  }
};

// @route POST /api/auth/logout
export const logout = async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
    sameSite: "lax",
    secure: false,
  });
  res.json({ message: "Logged out successfully" });
};

// @route POST /api/auth/send-otp
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save/update in database
    await OTP.findOneAndUpdate(
      { email },
      { otp, createdAt: new Date() },
      { upsert: true, new: true }
    );

    // Send email
    try {
      await sendEmail({
        to: email,
        subject: "Verification Code - Flucy",
        text: `Your verification code is ${otp}. This code is valid for 5 minutes.`,
      });
    } catch (emailErr) {
      console.log(`\n==================================================`);
      console.log(`[DEV MODE] Verification Code for ${email}: ${otp}`);
      console.log(`==================================================\n`);
      console.error("Email sending failed:", emailErr.message);

      return res.json({ message: "Verification code sent to your email (Logged to console in dev mode)" });
    }

    res.json({ message: "Verification code sent to your email" });
  } catch (error) {
    res.status(500).json({ message: "Failed to send verification code", error: error.message });
  }
};
