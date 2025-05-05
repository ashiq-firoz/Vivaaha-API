const User = require('../models/User');
const { SendMail } = require('../helpers/mailing');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const authController = {
  async register(req, res) {
    try {
      const { email, password } = req.body;

      // Input validation
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Generate verification token
      const verificationToken = jwt.sign(
        { email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Create new user with verification token
      const user = new User({
        email,
        password: hashedPassword,
        firstName:" ",
        lastName :" ",
        authType: 'email',
        verificationToken,
        verificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        isVerified: false
      });

      await user.save();

      // Create verification URL
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

      // Send verification email
      const emailContent = `
        Hello ,

        Thank you for registering with Vivaaha ! To complete your registration, please verify your email address by clicking the link below:

        ${verificationUrl}

        This link will expire in 24 hours.

        If you didn't create this account, please ignore this email.

        Best regards,
        Vivaaha Support
      `;

      const emailSubject = 'Welcome to Vivaaha- Verify Your Email';

      try {
        await SendMail(emailContent, emailSubject, email);
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Delete the user if email sending fails
        await User.deleteOne({ _id: user._id });
        return res.status(500).json({ message: 'Failed to send verification email' });
      }

      // Remove sensitive information from response
      const userResponse = user.toObject();
      delete userResponse.password;
      delete userResponse.verificationToken;
      delete userResponse.verificationTokenExpiry;

      res.status(201).json({
        message: 'Registration initiated. Please check your email to verify your account.',
        user: {
          id: userResponse._id,
          email: userResponse.email,
          firstName: userResponse.firstName,
          lastName: userResponse.lastName,
          isVerified: false
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ 
        message: 'Error registering user', 
        error: error.message 
      });
    }
  },

  async verifyEmail(req, res) {
    try {
      const { token } = req.body;

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user by verification token
      const user = await User.findOne({ 
        email: decoded.email,
        verificationToken: token,
        verificationTokenExpiry: { $gt: new Date() }
      });

      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired verification token' });
      }

      // Update user verification status
      user.isVerified = true;
      user.verificationToken = undefined;
      user.verificationTokenExpiry = undefined;
      await user.save();

      // Generate new JWT token for authenticated session
      const authToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(200).json({
        message: 'Email verified successfully',
        token: authToken,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isVerified: true
        }
      });

    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({ 
        message: 'Error verifying email', 
        error: error.message 
      });
    }
  },
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Input validation
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Compare password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: userResponse._id,
          email: userResponse.email,
          firstName: userResponse.firstName,
          lastName: userResponse.lastName
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        message: 'Error logging in', 
        error: error.message 
      });
    }
  },

  // Change password
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user._id; // From auth middleware

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password
      user.password = hashedPassword;
      await user.save();

      res.json({ message: 'Password updated successfully' });

    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ 
        message: 'Error changing password', 
        error: error.message 
      });
    }
  }
};

module.exports = authController;