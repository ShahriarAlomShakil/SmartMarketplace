const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    // Configure email transporter based on environment
    if (process.env.NODE_ENV === 'production') {
      // Production configuration (e.g., SendGrid, AWS SES, etc.)
      this.transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });
    } else {
      // Development configuration (console logging)
      this.transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: 'unix',
        buffer: true
      });
    }
  }

  async sendVerificationEmail(user, verificationToken) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    
    const template = await this.getEmailTemplate('verification', {
      userName: user.firstName || user.username,
      verificationUrl,
      companyName: 'Smart Marketplace'
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@smartmarketplace.com',
      to: user.email,
      subject: 'Verify Your Email Address - Smart Marketplace',
      html: template,
      text: `
        Hi ${user.firstName || user.username},
        
        Welcome to Smart Marketplace! Please verify your email address by clicking the following link:
        ${verificationUrl}
        
        This link will expire in 24 hours.
        
        If you didn't create this account, please ignore this email.
        
        Best regards,
        Smart Marketplace Team
      `
    };

    return this.sendEmail(mailOptions);
  }

  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    const template = await this.getEmailTemplate('password-reset', {
      userName: user.firstName || user.username,
      resetUrl,
      companyName: 'Smart Marketplace'
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@smartmarketplace.com',
      to: user.email,
      subject: 'Reset Your Password - Smart Marketplace',
      html: template,
      text: `
        Hi ${user.firstName || user.username},
        
        You requested to reset your password for Smart Marketplace. Click the following link to reset your password:
        ${resetUrl}
        
        This link will expire in 10 minutes.
        
        If you didn't request this password reset, please ignore this email and consider changing your password for security.
        
        Best regards,
        Smart Marketplace Team
      `
    };

    return this.sendEmail(mailOptions);
  }

  async send2FASetupEmail(user, qrCodeUrl) {
    const template = await this.getEmailTemplate('2fa-setup', {
      userName: user.firstName || user.username,
      qrCodeUrl,
      companyName: 'Smart Marketplace'
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@smartmarketplace.com',
      to: user.email,
      subject: 'Two-Factor Authentication Setup - Smart Marketplace',
      html: template,
      text: `
        Hi ${user.firstName || user.username},
        
        You have successfully enabled two-factor authentication for your Smart Marketplace account.
        
        Please save your backup codes in a safe place. You can use them to access your account if you lose access to your authenticator app.
        
        Best regards,
        Smart Marketplace Team
      `
    };

    return this.sendEmail(mailOptions);
  }

  async sendSecurityAlertEmail(user, alertType, details = {}) {
    const template = await this.getEmailTemplate('security-alert', {
      userName: user.firstName || user.username,
      alertType,
      details,
      companyName: 'Smart Marketplace'
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@smartmarketplace.com',
      to: user.email,
      subject: 'Security Alert - Smart Marketplace',
      html: template,
      text: `
        Hi ${user.firstName || user.username},
        
        We detected a security event on your Smart Marketplace account:
        
        Alert Type: ${alertType}
        Time: ${new Date().toLocaleString()}
        IP Address: ${details.ip || 'Unknown'}
        User Agent: ${details.userAgent || 'Unknown'}
        
        If this was you, no action is required. If you don't recognize this activity, please secure your account immediately.
        
        Best regards,
        Smart Marketplace Team
      `
    };

    return this.sendEmail(mailOptions);
  }

  async sendGDPRExportEmail(user, exportUrl) {
    const template = await this.getEmailTemplate('gdpr-export', {
      userName: user.firstName || user.username,
      exportUrl,
      companyName: 'Smart Marketplace'
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@smartmarketplace.com',
      to: user.email,
      subject: 'Your Data Export is Ready - Smart Marketplace',
      html: template,
      text: `
        Hi ${user.firstName || user.username},
        
        Your data export request has been processed. You can download your data using the following link:
        ${exportUrl}
        
        This link will expire in 48 hours for security reasons.
        
        Best regards,
        Smart Marketplace Team
      `
    };

    return this.sendEmail(mailOptions);
  }

  async sendPasswordChangeNotification(user) {
    const template = await this.getEmailTemplate('password-change', {
      userName: user.firstName || user.username,
      companyName: 'Smart Marketplace',
      loginUrl: `${process.env.FRONTEND_URL}/login`,
      supportUrl: `${process.env.FRONTEND_URL}/support`
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@smartmarketplace.com',
      to: user.email,
      subject: 'Password Changed Successfully - Smart Marketplace',
      html: template,
      text: `
        Hi ${user.firstName || user.username},
        
        Your password has been successfully changed for your Smart Marketplace account.
        
        If you made this change, no further action is required.
        
        If you didn't change your password, please:
        1. Immediately log in to your account
        2. Change your password again
        3. Contact our support team
        
        For security, all your devices have been logged out and you'll need to log in again.
        
        Best regards,
        Smart Marketplace Security Team
      `
    };

    return this.sendEmail(mailOptions);
  }

  async sendAccountDeletionConfirmation(user) {
    const template = await this.getEmailTemplate('account-deletion', {
      userName: user.firstName || user.username,
      companyName: 'Smart Marketplace',
      cancelUrl: `${process.env.FRONTEND_URL}/account/cancel-deletion`,
      supportUrl: `${process.env.FRONTEND_URL}/support`
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@smartmarketplace.com',
      to: user.email,
      subject: 'Account Deletion Requested - Smart Marketplace',
      html: template,
      text: `
        Hi ${user.firstName || user.username},
        
        We've received a request to delete your Smart Marketplace account.
        
        Your account will be permanently deleted in 30 days. This includes:
        - All your personal information
        - Your product listings
        - Your negotiation history
        - Your profile and settings
        
        If you want to cancel this deletion request, please contact our support team within 30 days.
        
        If you didn't request this deletion, please contact support immediately.
        
        Best regards,
        Smart Marketplace Team
      `
    };

    return this.sendEmail(mailOptions);
  }

  async sendSecurityAlert(user, alertType, details = {}) {
    const template = await this.getEmailTemplate('security-alert', {
      userName: user.firstName || user.username,
      alertType,
      details,
      companyName: 'Smart Marketplace',
      securityUrl: `${process.env.FRONTEND_URL}/account/security`
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'security@smartmarketplace.com',
      to: user.email,
      subject: `Security Alert - ${alertType} - Smart Marketplace`,
      html: template,
      text: `
        Hi ${user.firstName || user.username},
        
        Security Alert: ${alertType}
        
        We detected unusual activity on your Smart Marketplace account:
        ${JSON.stringify(details, null, 2)}
        
        If this was you, no action is needed.
        If this wasn't you, please:
        1. Change your password immediately
        2. Review your account security settings
        3. Contact our support team
        
        Best regards,
        Smart Marketplace Security Team
      `
    };

    return this.sendEmail(mailOptions);
  }

  async sendAccountLockNotification(user, lockDuration) {
    const template = await this.getEmailTemplate('account-lock', {
      userName: user.firstName || user.username,
      lockDuration,
      companyName: 'Smart Marketplace',
      supportUrl: `${process.env.FRONTEND_URL}/support`
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'security@smartmarketplace.com',
      to: user.email,
      subject: 'Account Temporarily Locked - Smart Marketplace',
      html: template,
      text: `
        Hi ${user.firstName || user.username},
        
        Your Smart Marketplace account has been temporarily locked due to multiple failed login attempts.
        
        Your account will be automatically unlocked in ${lockDuration}.
        
        If you forgot your password, you can reset it using the "Forgot Password" link on the login page.
        
        If you believe this is an error, please contact our support team.
        
        Best regards,
        Smart Marketplace Security Team
      `
    };

    return this.sendEmail(mailOptions);
  }

  async getEmailTemplate(templateName, variables = {}) {
    try {
      const templatePath = path.join(__dirname, '..', 'templates', 'email', `${templateName}.html`);
      let template = await fs.readFile(templatePath, 'utf8');
      
      // Replace variables in template
      Object.keys(variables).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        template = template.replace(regex, variables[key]);
      });
      
      return template;
    } catch (error) {
      console.error(`Error loading email template ${templateName}:`, error);
      
      // Fallback to basic template
      return this.getBasicTemplate(templateName, variables);
    }
  }

  getBasicTemplate(templateName, variables = {}) {
    const { userName = 'User', companyName = 'Smart Marketplace' } = variables;
    
    const templates = {
      verification: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to ${companyName}!</h2>
          <p>Hi ${userName},</p>
          <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
          <a href="${variables.verificationUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Email</a>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create this account, please ignore this email.</p>
          <p>Best regards,<br>${companyName} Team</p>
        </div>
      `,
      'password-reset': `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Hi ${userName},</p>
          <p>You requested to reset your password. Click the button below to reset it:</p>
          <a href="${variables.resetUrl}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
          <p>This link will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br>${companyName} Team</p>
        </div>
      `,
      '2fa-setup': `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Two-Factor Authentication Enabled</h2>
          <p>Hi ${userName},</p>
          <p>You have successfully enabled two-factor authentication for your account.</p>
          <p>Your account is now more secure!</p>
          <p>Best regards,<br>${companyName} Team</p>
        </div>
      `,
      'security-alert': `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Security Alert</h2>
          <p>Hi ${userName},</p>
          <p>We detected a security event on your account: ${variables.alertType}</p>
          <p>If this was you, no action is required. If not, please secure your account immediately.</p>
          <p>Best regards,<br>${companyName} Team</p>
        </div>
      `,
      'gdpr-export': `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Your Data Export is Ready</h2>
          <p>Hi ${userName},</p>
          <p>Your data export request has been processed.</p>
          <a href="${variables.exportUrl}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Download Data</a>
          <p>This link will expire in 48 hours.</p>
          <p>Best regards,<br>${companyName} Team</p>
        </div>
      `,
      'password-change': `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Changed Successfully</h2>
          <p>Hi ${userName},</p>
          <p>Your password has been successfully changed.</p>
          <p>If you didn't make this change, please secure your account immediately.</p>
          <p>Best regards,<br>${companyName} Security Team</p>
        </div>
      `,
      'account-deletion': `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Account Deletion Requested</h2>
          <p>Hi ${userName},</p>
          <p>We've received a request to delete your account.</p>
          <p>Your account will be permanently deleted in 30 days. If you didn't request this, please contact support immediately.</p>
          <p>Best regards,<br>${companyName} Team</p>
        </div>
      `,
      'account-lock': `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Account Temporarily Locked</h2>
          <p>Hi ${userName},</p>
          <p>Your account has been temporarily locked due to multiple failed login attempts.</p>
          <p>It will be automatically unlocked in ${variables.lockDuration}.</p>
          <p>If you forgot your password, you can reset it on the login page.</p>
          <p>If you believe this is an error, please contact support.</p>
          <p>Best regards,<br>${companyName} Security Team</p>
        </div>
      `
    };

    return templates[templateName] || templates.verification;
  }

  async sendEmail(mailOptions) {
    try {
      if (process.env.NODE_ENV === 'production') {
        const result = await this.transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', result.messageId);
        return { success: true, messageId: result.messageId };
      } else {
        // In development, log email content
        console.log('\n=== EMAIL SENT (DEVELOPMENT MODE) ===');
        console.log('To:', mailOptions.to);
        console.log('Subject:', mailOptions.subject);
        console.log('Text:', mailOptions.text);
        console.log('=======================================\n');
        return { success: true, messageId: 'dev-mode' };
      }
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  async verifyTransporter() {
    try {
      if (process.env.NODE_ENV === 'production') {
        await this.transporter.verify();
        console.log('Email transporter verified successfully');
      }
      return true;
    } catch (error) {
      console.error('Email transporter verification failed:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
