const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');

class OAuthService {
  constructor() {
    this.initializeStrategies();
  }

  initializeStrategies() {
    // Local Strategy (email/password)
    passport.use(new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password'
    },
    async (email, password, done) => {
      try {
        const user = await User.findByCredentials(email, password);
        return done(null, user);
      } catch (error) {
        return done(null, false, { message: error.message });
      }
    }));

    // Google OAuth Strategy
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback"
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const result = await this.handleOAuthProfile(profile, 'google');
          return done(null, result);
        } catch (error) {
          return done(error, null);
        }
      }));
    }

    // Facebook OAuth Strategy
    if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
      passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: "/api/auth/facebook/callback",
        profileFields: ['id', 'emails', 'name', 'picture.type(large)']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const result = await this.handleOAuthProfile(profile, 'facebook');
          return done(null, result);
        } catch (error) {
          return done(error, null);
        }
      }));
    }

    // Apple Sign-In would require apple-signin-auth package
    // Implementation would be similar but requires different setup

    // Serialize/Deserialize user for session
    passport.serializeUser((user, done) => {
      done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
      try {
        const user = await User.findById(id);
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    });
  }

  async handleOAuthProfile(profile, provider) {
    try {
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
      
      if (!email) {
        throw new Error('No email provided by OAuth provider');
      }

      // Check if user already exists with this email
      let user = await User.findOne({ email });

      if (user) {
        // User exists, update OAuth info
        user.oauth[provider] = {
          id: profile.id,
          email: email,
          verified: true
        };

        // Update profile info if not set
        if (!user.firstName && profile.name?.givenName) {
          user.firstName = profile.name.givenName;
        }
        if (!user.lastName && profile.name?.familyName) {
          user.lastName = profile.name.familyName;
        }
        if (!user.avatar && profile.photos && profile.photos[0]) {
          user.avatar = profile.photos[0].value;
        }

        user.isVerified = true; // OAuth emails are considered verified
        await user.save();

        return { user, isNewUser: false };
      } else {
        // Create new user
        const username = await this.generateUniqueUsername(profile);
        
        user = new User({
          username,
          email,
          firstName: profile.name?.givenName || '',
          lastName: profile.name?.familyName || '',
          avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
          isVerified: true,
          oauth: {
            [provider]: {
              id: profile.id,
              email: email,
              verified: true
            }
          },
          gdpr: {
            consentGiven: true,
            consentDate: new Date(),
            dataProcessingConsent: true
          }
        });

        await user.save();
        return { user, isNewUser: true };
      }
    } catch (error) {
      console.error('OAuth profile handling error:', error);
      throw new Error('Failed to process OAuth authentication');
    }
  }

  async generateUniqueUsername(profile) {
    let baseUsername = '';
    
    if (profile.name?.givenName) {
      baseUsername = profile.name.givenName.toLowerCase().replace(/[^a-z0-9]/g, '');
    } else if (profile.displayName) {
      baseUsername = profile.displayName.toLowerCase().replace(/[^a-z0-9]/g, '');
    } else {
      baseUsername = 'user';
    }

    // Ensure username is at least 3 characters
    if (baseUsername.length < 3) {
      baseUsername = 'user' + Math.random().toString(36).substring(2, 5);
    }

    let username = baseUsername;
    let counter = 1;

    // Check for uniqueness
    while (await User.findOne({ username })) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    return username;
  }

  // Link OAuth account to existing user
  async linkOAuthAccount(userId, provider, oauthProfile) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      // Check if this OAuth account is already linked to another user
      const existingUser = await User.findOne({
        [`oauth.${provider}.id`]: oauthProfile.id
      });

      if (existingUser && existingUser._id.toString() !== userId) {
        throw new Error('This OAuth account is already linked to another user');
      }

      // Link the account
      user.oauth[provider] = {
        id: oauthProfile.id,
        email: oauthProfile.emails && oauthProfile.emails[0] ? oauthProfile.emails[0].value : null,
        verified: true
      };

      await user.save();
      return user;
    } catch (error) {
      console.error('OAuth linking error:', error);
      throw error;
    }
  }

  // Unlink OAuth account
  async unlinkOAuthAccount(userId, provider) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      // Ensure user has a password if unlinking OAuth
      if (!user.password && Object.keys(user.oauth).filter(p => user.oauth[p].verified).length === 1) {
        throw new Error('Cannot unlink the only authentication method. Please set a password first.');
      }

      // Unlink the account
      if (user.oauth[provider]) {
        user.oauth[provider] = {
          id: null,
          email: null,
          verified: false
        };
      }

      await user.save();
      return user;
    } catch (error) {
      console.error('OAuth unlinking error:', error);
      throw error;
    }
  }

  // Get OAuth authentication URL
  getAuthURL(provider, state = null) {
    const baseURLs = {
      google: '/api/auth/google',
      facebook: '/api/auth/facebook'
    };

    let url = baseURLs[provider];
    if (state) {
      url += `?state=${encodeURIComponent(state)}`;
    }

    return url;
  }

  // Validate OAuth state parameter (CSRF protection)
  validateState(receivedState, expectedState) {
    return receivedState === expectedState;
  }

  // Get user's OAuth connections
  async getUserOAuthConnections(userId) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      const connections = {};
      
      Object.keys(user.oauth).forEach(provider => {
        connections[provider] = {
          connected: user.oauth[provider].verified || false,
          email: user.oauth[provider].email || null
        };
      });

      return connections;
    } catch (error) {
      console.error('Get OAuth connections error:', error);
      throw error;
    }
  }

  // Security: Check for suspicious OAuth activity
  async checkOAuthSecurity(req, profile, provider) {
    const securityChecks = {
      passed: true,
      warnings: []
    };

    // Check if email domain is suspicious
    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
    if (email) {
      const domain = email.split('@')[1];
      const suspiciousDomains = ['tempmail.com', '10minutemail.com']; // Add more as needed
      
      if (suspiciousDomains.includes(domain)) {
        securityChecks.warnings.push('Suspicious email domain detected');
      }
    }

    // Check for rapid OAuth attempts from same IP
    // This would require storing attempt history
    
    // Check if profile data seems legitimate
    if (!profile.name && !profile.displayName) {
      securityChecks.warnings.push('Incomplete profile data');
    }

    return securityChecks;
  }

  // Initialize passport middleware
  initialize() {
    return passport.initialize();
  }

  // Session middleware (if using sessions)
  session() {
    return passport.session();
  }

  // Authenticate middleware factory
  authenticate(strategy, options = {}) {
    return passport.authenticate(strategy, options);
  }
}

module.exports = new OAuthService();
