const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');
const User = require('../models/User');

class TwoFactorAuthService {
  constructor() {
    this.appName = 'Smart Marketplace';
    this.issuer = 'Smart Marketplace';
  }

  // Generate 2FA secret for user
  async generateSecret(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const secret = speakeasy.generateSecret({
        name: `${this.appName} (${user.email})`,
        issuer: this.issuer,
        length: 32
      });

      // Store the secret (but don't enable 2FA yet)
      user.twoFactor.secret = secret.base32;
      user.twoFactor.enabled = false;
      await user.save();

      // Generate QR code
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

      return {
        secret: secret.base32,
        qrCode: qrCodeUrl,
        manualEntryKey: secret.base32,
        backupCodes: [] // Will be generated after verification
      };
    } catch (error) {
      console.error('2FA secret generation error:', error);
      throw new Error('Failed to generate 2FA secret');
    }
  }

  // Verify 2FA token and enable 2FA
  async enable2FA(userId, token) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (!user.twoFactor.secret) {
        throw new Error('2FA secret not found. Please generate a new secret.');
      }

      // Verify the token
      const verified = speakeasy.totp.verify({
        secret: user.twoFactor.secret,
        encoding: 'base32',
        token: token,
        window: 2 // Allow 2 time steps (±60 seconds)
      });

      if (!verified) {
        throw new Error('Invalid 2FA token. Please try again.');
      }

      // Enable 2FA and generate backup codes
      user.twoFactor.enabled = true;
      user.twoFactor.lastUsed = new Date();
      
      const backupCodes = this.generateBackupCodes();
      user.twoFactor.backupCodes = backupCodes.map(code => 
        crypto.createHash('sha256').update(code).digest('hex')
      );

      await user.save();

      return {
        enabled: true,
        backupCodes: backupCodes // Return unhashed codes to user
      };
    } catch (error) {
      console.error('2FA enable error:', error);
      throw error;
    }
  }

  // Disable 2FA
  async disable2FA(userId, password, token = null) {
    try {
      const user = await User.findById(userId).select('+password');
      if (!user) {
        throw new Error('User not found');
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new Error('Invalid password');
      }

      // If 2FA is enabled, require token to disable
      if (user.twoFactor.enabled && token) {
        const tokenValid = this.verifyToken(user, token);
        if (!tokenValid) {
          throw new Error('Invalid 2FA token');
        }
      }

      // Disable 2FA
      user.twoFactor = {
        enabled: false,
        secret: null,
        backupCodes: [],
        lastUsed: null
      };

      await user.save();

      return { disabled: true };
    } catch (error) {
      console.error('2FA disable error:', error);
      throw error;
    }
  }

  // Verify 2FA token
  verifyToken(user, token) {
    if (!user.twoFactor.enabled || !user.twoFactor.secret) {
      return false;
    }

    return speakeasy.totp.verify({
      secret: user.twoFactor.secret,
      encoding: 'base32',
      token: token,
      window: 2
    });
  }

  // Verify backup code
  async verifyBackupCode(userId, code) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (!user.twoFactor.enabled) {
        throw new Error('2FA is not enabled');
      }

      const hashedCode = crypto.createHash('sha256').update(code.toUpperCase()).digest('hex');
      const codeIndex = user.twoFactor.backupCodes.indexOf(hashedCode);

      if (codeIndex === -1) {
        return false;
      }

      // Remove used backup code
      user.twoFactor.backupCodes.splice(codeIndex, 1);
      await user.save();

      return true;
    } catch (error) {
      console.error('Backup code verification error:', error);
      return false;
    }
  }

  // Generate new backup codes
  async regenerateBackupCodes(userId, password) {
    try {
      const user = await User.findById(userId).select('+password');
      if (!user) {
        throw new Error('User not found');
      }

      if (!user.twoFactor.enabled) {
        throw new Error('2FA is not enabled');
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new Error('Invalid password');
      }

      // Generate new backup codes
      const backupCodes = this.generateBackupCodes();
      user.twoFactor.backupCodes = backupCodes.map(code => 
        crypto.createHash('sha256').update(code).digest('hex')
      );

      await user.save();

      return backupCodes; // Return unhashed codes
    } catch (error) {
      console.error('Backup codes regeneration error:', error);
      throw error;
    }
  }

  // Generate backup codes
  generateBackupCodes(count = 10) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      // Generate 8-character alphanumeric code
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  // Check if user has 2FA enabled
  async is2FAEnabled(userId) {
    try {
      const user = await User.findById(userId);
      return user?.twoFactor?.enabled || false;
    } catch (error) {
      console.error('2FA status check error:', error);
      return false;
    }
  }

  // Get 2FA status and backup codes count
  async get2FAStatus(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      return {
        enabled: user.twoFactor.enabled || false,
        hasSecret: !!user.twoFactor.secret,
        backupCodesCount: user.twoFactor.backupCodes?.length || 0,
        lastUsed: user.twoFactor.lastUsed
      };
    } catch (error) {
      console.error('2FA status error:', error);
      throw error;
    }
  }

  // Middleware to require 2FA
  require2FA() {
    return async (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            status: 'error',
            message: 'Authentication required'
          });
        }

        const is2FAEnabled = await this.is2FAEnabled(req.user._id);
        
        if (is2FAEnabled) {
          const token = req.headers['x-2fa-token'] || req.body.twoFactorToken;
          
          if (!token) {
            return res.status(200).json({
              status: 'requires_2fa',
              message: '2FA token required'
            });
          }

          const user = await User.findById(req.user._id);
          const isValid = this.verifyToken(user, token) || await this.verifyBackupCode(req.user._id, token);
          
          if (!isValid) {
            return res.status(401).json({
              status: 'error',
              message: 'Invalid 2FA token'
            });
          }

          // Update last used
          user.twoFactor.lastUsed = new Date();
          await user.save();
        }

        next();
      } catch (error) {
        console.error('2FA middleware error:', error);
        res.status(500).json({
          status: 'error',
          message: 'Server error during 2FA verification'
        });
      }
    };
  }

  // Generate recovery codes for account recovery
  async generateRecoveryCodes(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const recoveryCodes = this.generateBackupCodes(5);
      
      // Store hashed recovery codes (separate from backup codes)
      if (!user.security) {
        user.security = {};
      }
      
      user.security.recoveryCodes = recoveryCodes.map(code => 
        crypto.createHash('sha256').update(code).digest('hex')
      );

      await user.save();

      return recoveryCodes;
    } catch (error) {
      console.error('Recovery codes generation error:', error);
      throw error;
    }
  }

  // Verify recovery code for account recovery
  async verifyRecoveryCode(email, code) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('User not found');
      }

      if (!user.security?.recoveryCodes) {
        return false;
      }

      const hashedCode = crypto.createHash('sha256').update(code.toUpperCase()).digest('hex');
      const codeIndex = user.security.recoveryCodes.indexOf(hashedCode);

      if (codeIndex === -1) {
        return false;
      }

      // Remove used recovery code
      user.security.recoveryCodes.splice(codeIndex, 1);
      await user.save();

      return true;
    } catch (error) {
      console.error('Recovery code verification error:', error);
      return false;
    }
  }

  // Security audit log
  async logSecurityEvent(userId, event, details = {}) {
    try {
      const securityLog = {
        userId,
        event,
        details: {
          ...details,
          timestamp: new Date(),
          ip: details.ip || 'unknown',
          userAgent: details.userAgent || 'unknown'
        }
      };

      // In production, store this in a security audit log
      console.log('2FA Security Event:', JSON.stringify(securityLog, null, 2));
      
      return securityLog;
    } catch (error) {
      console.error('Security log error:', error);
    }
  }
}

module.exports = new TwoFactorAuthService();
