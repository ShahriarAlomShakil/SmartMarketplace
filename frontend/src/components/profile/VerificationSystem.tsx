import React, { useState } from 'react';
import { BlurCard } from '../ui/BlurCard';
import { ModernButton } from '../ui/ModernButton';
import { ModernBadge } from '../ui/ModernBadge';

interface VerificationSystemProps {
  user: any;
  onVerificationComplete: (type: string) => void;
  className?: string;
}

interface VerificationType {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  verified: boolean;
  required: boolean;
  trustScoreBonus: number;
}

/**
 * Verification Badge System - Day 18 Implementation
 * 
 * Features:
 * - Email verification with trust score bonus
 * - Phone number verification
 * - Identity document verification
 * - Address verification
 * - Social media account linking
 * - Professional verification
 * - Trust score calculation based on verifications
 */
export const VerificationSystem: React.FC<VerificationSystemProps> = ({
  user,
  onVerificationComplete,
  className = ''
}) => {
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const verificationTypes: VerificationType[] = [
    {
      id: 'email',
      name: 'Email Address',
      description: 'Verify your email address to secure your account',
      icon: '📧',
      color: 'blue',
      verified: user.profile?.verificationStatus?.email || false,
      required: true,
      trustScoreBonus: 10
    },
    {
      id: 'phone',
      name: 'Phone Number',
      description: 'Add and verify your phone number for better security',
      icon: '📱',
      color: 'green',
      verified: user.profile?.verificationStatus?.phone || false,
      required: true,
      trustScoreBonus: 15
    },
    {
      id: 'identity',
      name: 'Identity Document',
      description: 'Upload a government-issued ID to verify your identity',
      icon: '🆔',
      color: 'purple',
      verified: user.profile?.verificationStatus?.identity || false,
      required: false,
      trustScoreBonus: 25
    },
    {
      id: 'address',
      name: 'Address Verification',
      description: 'Verify your address with a utility bill or bank statement',
      icon: '🏠',
      color: 'orange',
      verified: user.profile?.verificationStatus?.address || false,
      required: false,
      trustScoreBonus: 20
    }
  ];

  const oauthConnections = [
    {
      id: 'google',
      name: 'Google Account',
      description: 'Connect your Google account for additional verification',
      icon: '🔗',
      color: 'red',
      connected: user.oauth?.google?.verified || false,
      trustScoreBonus: 10
    },
    {
      id: 'facebook',
      name: 'Facebook Account',
      description: 'Link your Facebook profile to boost credibility',
      icon: '👥',
      color: 'blue',
      connected: user.oauth?.facebook?.verified || false,
      trustScoreBonus: 10
    },
    {
      id: 'linkedin',
      name: 'LinkedIn Profile',
      description: 'Connect your professional LinkedIn profile',
      icon: '💼',
      color: 'blue',
      connected: user.oauth?.linkedin?.verified || false,
      trustScoreBonus: 15
    }
  ];

  const handleVerification = async (type: string) => {
    setLoading(prev => ({ ...prev, [type]: true }));
    
    try {
      const response = await fetch(`/api/profile/verification/${type}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        onVerificationComplete(type);
      } else {
        console.error('Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleOAuthConnect = async (provider: string) => {
    try {
      // Redirect to OAuth provider
      window.location.href = `/api/auth/oauth/${provider}`;
    } catch (error) {
      console.error('OAuth connection error:', error);
    }
  };

  const calculateVerificationScore = () => {
    const totalVerifications = verificationTypes.length + oauthConnections.length;
    const completedVerifications = [
      ...verificationTypes.filter(v => v.verified),
      ...oauthConnections.filter(c => c.connected)
    ].length;

    return Math.round((completedVerifications / totalVerifications) * 100);
  };

  const getTotalTrustBonus = () => {
    const verificationBonus = verificationTypes
      .filter(v => v.verified)
      .reduce((sum, v) => sum + v.trustScoreBonus, 0);
    
    const oauthBonus = oauthConnections
      .filter(c => c.connected)
      .reduce((sum, c) => sum + c.trustScoreBonus, 0);

    return verificationBonus + oauthBonus;
  };

  const getColorClasses = (color: string, type: 'bg' | 'text' | 'border') => {
    const colorMap: Record<string, Record<string, string>> = {
      blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
      green: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
      purple: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
      orange: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
      red: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' }
    };
    return colorMap[color]?.[type] || colorMap.blue[type];
  };

  const verificationScore = calculateVerificationScore();
  const trustBonus = getTotalTrustBonus();

  return (
    <BlurCard className={`p-8 ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Account Verification</h2>
        <p className="text-white/70">Increase your trust score and credibility by completing verifications</p>
        
        {/* Verification Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="text-2xl font-bold text-white">{verificationScore}%</div>
            <div className="text-white/60 text-sm">Verified</div>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="text-2xl font-bold text-green-400">+{trustBonus}</div>
            <div className="text-white/60 text-sm">Trust Score Bonus</div>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="text-2xl font-bold text-blue-400">
              {verificationTypes.filter(v => v.verified).length + oauthConnections.filter(c => c.connected).length}
            </div>
            <div className="text-white/60 text-sm">Completed</div>
          </div>
        </div>
      </div>

      {/* Account Verifications */}
      <div className="space-y-4 mb-8">
        <h3 className="text-lg font-semibold text-white">Account Verifications</h3>
        {verificationTypes.map((verification) => (
          <div key={verification.id} className="border border-white/10 rounded-lg overflow-hidden">
            <div 
              className="p-4 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              onClick={() => setExpandedSection(expandedSection === verification.id ? null : verification.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{verification.icon}</div>
                  <div>
                    <div className="flex items-center space-x-3">
                      <h4 className="text-white font-medium">{verification.name}</h4>
                      {verification.required && (
                        <ModernBadge size="sm" className="bg-red-500/20 text-red-400">
                          Required
                        </ModernBadge>
                      )}
                      <ModernBadge size="sm" className={getColorClasses(verification.color, 'bg')}>
                        +{verification.trustScoreBonus} Trust Score
                      </ModernBadge>
                    </div>
                    <p className="text-white/60 text-sm">{verification.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {verification.verified ? (
                    <ModernBadge className="bg-green-500/20 text-green-400">
                      ✓ Verified
                    </ModernBadge>
                  ) : (
                    <ModernBadge variant="secondary">
                      Pending
                    </ModernBadge>
                  )}
                  <svg 
                    className={`w-5 h-5 text-white/40 transition-transform ${
                      expandedSection === verification.id ? 'rotate-180' : ''
                    }`} 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            
            {expandedSection === verification.id && (
              <div className="p-4 bg-white/2 border-t border-white/10">
                {verification.verified ? (
                  <div className="flex items-center space-x-2 text-green-400">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">Verification completed successfully</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-white/70 text-sm">
                      {verification.id === 'email' && 'We\'ll send a verification link to your email address.'}
                      {verification.id === 'phone' && 'We\'ll send a verification code to your phone number.'}
                      {verification.id === 'identity' && 'Upload a clear photo of your government-issued ID.'}
                      {verification.id === 'address' && 'Upload a recent utility bill or bank statement.'}
                    </div>
                    <ModernButton
                      onClick={() => handleVerification(verification.id)}
                      loading={loading[verification.id]}
                      size="sm"
                      className={getColorClasses(verification.color, 'bg')}
                    >
                      Start Verification
                    </ModernButton>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Social Connections */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Social Connections</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {oauthConnections.map((connection) => (
            <div key={connection.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="text-center">
                <div className="text-2xl mb-2">{connection.icon}</div>
                <h4 className="text-white font-medium mb-1">{connection.name}</h4>
                <p className="text-white/60 text-xs mb-3">{connection.description}</p>
                <div className="mb-3">
                  <ModernBadge size="sm" className={getColorClasses(connection.color, 'bg')}>
                    +{connection.trustScoreBonus} Trust Score
                  </ModernBadge>
                </div>
                {connection.connected ? (
                  <ModernBadge className="bg-green-500/20 text-green-400 w-full">
                    ✓ Connected
                  </ModernBadge>
                ) : (
                  <ModernButton
                    onClick={() => handleOAuthConnect(connection.id)}
                    size="sm"
                    variant="secondary"
                    className="w-full"
                  >
                    Connect
                  </ModernButton>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="mt-8 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
        <h3 className="text-lg font-semibold text-white mb-3">Verification Benefits</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start space-x-2">
            <div className="text-green-400 mt-1">🛡️</div>
            <div>
              <div className="text-white font-medium">Increased Trust</div>
              <div className="text-white/60">Build confidence with other users</div>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <div className="text-blue-400 mt-1">🚀</div>
            <div>
              <div className="text-white font-medium">Higher Visibility</div>
              <div className="text-white/60">Verified profiles appear higher in search</div>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <div className="text-purple-400 mt-1">💰</div>
            <div>
              <div className="text-white font-medium">Better Deals</div>
              <div className="text-white/60">Access to premium features and discounts</div>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <div className="text-orange-400 mt-1">⚡</div>
            <div>
              <div className="text-white font-medium">Faster Transactions</div>
              <div className="text-white/60">Verified users close deals 50% faster</div>
            </div>
          </div>
        </div>
      </div>
    </BlurCard>
  );
};
