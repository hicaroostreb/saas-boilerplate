// packages/ui/src/auth/session-manager.tsx - ACHROMATIC ENTERPRISE SESSION MANAGER

'use client';

import { useState } from 'react';
import { cn } from '../lib/utils';

// ============================================
// INTERFACES & TYPES
// ============================================

interface SessionDevice {
  sessionToken: string;
  deviceName: string | null;
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  ipAddress: string | null;
  location: {
    country: string | null;
    city: string | null;
  };
  lastAccessedAt: Date | null;
  createdAt: Date;
  isCurrent: boolean;
  riskScore: number;
  securityLevel: 'normal' | 'elevated' | 'high_risk' | 'critical';
}

interface SessionManagerProps {
  sessions: SessionDevice[];
  onRevokeSession: (sessionToken: string, deviceName?: string) => Promise<void>;
  onRevokeAllOtherSessions: () => Promise<void>;
  isLoading?: boolean;
  className?: string;

  // ✅ ENTERPRISE: Customization options
  showRiskScores?: boolean;
  showSecurityLevels?: boolean;
  showLocationInfo?: boolean;
  showLastAccessed?: boolean;
  allowBulkRevoke?: boolean;

  // ✅ ENTERPRISE: Organization context
  organizationSlug?: string | null;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

const getDeviceIcon = (deviceType: SessionDevice['deviceType']) => {
  switch (deviceType) {
    case 'mobile':
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zM6 4a1 1 0 011-1h6a1 1 0 011 1v12a1 1 0 01-1 1H7a1 1 0 01-1-1V4z"
            clipRule="evenodd"
          />
        </svg>
      );
    case 'tablet':
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zM5 4a1 1 0 011-1h8a1 1 0 011 1v12a1 1 0 01-1 1H6a1 1 0 01-1-1V4z"
            clipRule="evenodd"
          />
        </svg>
      );
    case 'desktop':
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-4l1.5 2H14a1 1 0 110 2H6a1 1 0 110-2h1.5L9 15H5a2 2 0 01-2-2V5zm2-1a1 1 0 00-1 1v8a1 1 0 001 1h10a1 1 0 001-1V5a1 1 0 00-1-1H5z"
            clipRule="evenodd"
          />
        </svg>
      );
    default:
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      );
  }
};

const getCountryFlag = (countryCode?: string | null) => {
  if (!countryCode) return '🌍';

  const flags: Record<string, string> = {
    BR: '🇧🇷',
    US: '🇺🇸',
    CA: '🇨🇦',
    GB: '🇬🇧',
    DE: '🇩🇪',
    FR: '🇫🇷',
    ES: '🇪🇸',
    IT: '🇮🇹',
    NL: '🇳🇱',
    AU: '🇦🇺',
    IN: '🇮🇳',
    JP: '🇯🇵',
    KR: '🇰🇷',
    CN: '🇨🇳',
    RU: '🇷🇺',
  };

  return flags[countryCode.toUpperCase()] ?? '🌍'; // ✅ CORREÇÃO: || → ||
};

const formatRelativeTime = (date: Date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return date.toLocaleDateString();
};

const getRiskLevelColor = (riskScore: number) => {
  if (riskScore >= 80)
    return { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' };
  if (riskScore >= 60)
    return {
      bg: 'bg-orange-100',
      text: 'text-orange-700',
      dot: 'bg-orange-500',
    };
  if (riskScore >= 30)
    return {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      dot: 'bg-yellow-500',
    };
  return { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' };
};

const getSecurityLevelColor = (level: SessionDevice['securityLevel']) => {
  switch (level) {
    case 'critical':
      return {
        bg: 'bg-red-100',
        text: 'text-red-700',
        border: 'border-red-200',
      };
    case 'high_risk':
      return {
        bg: 'bg-orange-100',
        text: 'text-orange-700',
        border: 'border-orange-200',
      };
    case 'elevated':
      return {
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        border: 'border-yellow-200',
      };
    default:
      return {
        bg: 'bg-green-100',
        text: 'text-green-700',
        border: 'border-green-200',
      };
  }
};

// ============================================
// MAIN COMPONENT
// ============================================

export function SessionManager({
  sessions,
  onRevokeSession,
  onRevokeAllOtherSessions,
  isLoading = false,
  className,
  showRiskScores = true,
  showSecurityLevels = false,
  showLocationInfo = true,
  showLastAccessed = true,
  allowBulkRevoke = true,
  organizationSlug,
}: SessionManagerProps) {
  const [revokingSessionToken, setRevokingSessionToken] = useState<
    string | null
  >(null);
  const [isRevokingAll, setIsRevokingAll] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState<{
    type: 'single' | 'all';
    sessionToken?: string;
    deviceName?: string;
  } | null>(null);

  // ✅ ENTERPRISE: Separate current and other sessions
  const currentSession = sessions.find(s => s.isCurrent);
  const otherSessions = sessions.filter(s => !s.isCurrent);

  // ✅ ENTERPRISE: Handle single session revocation
  const handleRevokeSession = async (
    sessionToken: string,
    deviceName?: string
  ) => {
    setRevokingSessionToken(sessionToken);

    try {
      await onRevokeSession(sessionToken, deviceName);
    } catch (_error) {
      // ✅ CORREÇÃO: Add underscore prefix
      console.error('Error revoking session:', _error);
    } finally {
      setRevokingSessionToken(null);
      setShowConfirmDialog(null);
    }
  };

  // ✅ ENTERPRISE: Handle bulk revocation
  const handleRevokeAllOtherSessions = async () => {
    setIsRevokingAll(true);

    try {
      await onRevokeAllOtherSessions();
    } catch (_error) {
      // ✅ CORREÇÃO: Add underscore prefix
      console.error('Error revoking all sessions:', _error);
    } finally {
      setIsRevokingAll(false);
      setShowConfirmDialog(null);
    }
  };

  // ✅ ENTERPRISE: Render session item
  const renderSessionItem = (
    session: SessionDevice,
    isCurrentSession = false
  ) => {
    const riskColors = getRiskLevelColor(session.riskScore);
    const securityColors = getSecurityLevelColor(session.securityLevel);
    const isRevoking = revokingSessionToken === session.sessionToken;

    return (
      <div
        key={session.sessionToken}
        className={cn(
          'relative p-4 border rounded-lg transition-all',
          isCurrentSession
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50',
          isRevoking && 'opacity-50'
        )}
      >
        {/* ✅ ENTERPRISE: Current session indicator */}
        {isCurrentSession && (
          <div className="absolute -top-2 -right-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground">
              Current
            </span>
          </div>
        )}

        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            {/* Device icon */}
            <div className="mt-1 text-muted-foreground">
              {getDeviceIcon(session.deviceType)}
            </div>

            <div className="flex-1 min-w-0">
              {/* Device name and type */}
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-medium text-foreground truncate">
                  {session.deviceName ?? `${session.deviceType} Device`}{' '}
                  {/* ✅ CORREÇÃO: || → || */}
                </h3>

                {/* ✅ ENTERPRISE: Security level badge */}
                {showSecurityLevels && session.securityLevel !== 'normal' && (
                  <span
                    className={cn(
                      'inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium',
                      securityColors.bg,
                      securityColors.text
                    )}
                  >
                    {session.securityLevel.replace('_', ' ')}
                  </span>
                )}
              </div>

              {/* Location and IP */}
              {showLocationInfo && (
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {getCountryFlag(session.location.country)}{' '}
                    {
                      session.location.city && session.location.country
                        ? `${session.location.city}, ${session.location.country}`
                        : (session.location.country ?? 'Unknown location') // ✅ CORREÇÃO: || → ||
                    }
                  </span>
                  {session.ipAddress && (
                    <>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {session.ipAddress}
                      </span>
                    </>
                  )}
                </div>
              )}

              {/* Last accessed and risk info */}
              <div className="flex items-center space-x-3 mt-2">
                {/* Last accessed */}
                {showLastAccessed && session.lastAccessedAt && (
                  <span className="text-xs text-muted-foreground">
                    Active {formatRelativeTime(session.lastAccessedAt)}
                  </span>
                )}

                {/* Risk score */}
                {showRiskScores && (
                  <div className="flex items-center space-x-1">
                    <div
                      className={cn('w-2 h-2 rounded-full', riskColors.dot)}
                    />
                    <span className="text-xs text-muted-foreground">
                      Risk: {session.riskScore}%
                    </span>
                  </div>
                )}

                {/* Creation date */}
                <span className="text-xs text-muted-foreground">
                  Added {formatRelativeTime(session.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          {!isCurrentSession && (
            <div className="ml-4">
              <button
                onClick={() =>
                  setShowConfirmDialog({
                    type: 'single',
                    sessionToken: session.sessionToken,
                    deviceName: session.deviceName ?? undefined, // ✅ CORREÇÃO: || → ||
                  })
                }
                disabled={isRevoking || isLoading}
                className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
              >
                {isRevoking ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1" />
                    Revoking...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-3 h-3 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Revoke
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* ✅ ENTERPRISE: Header with stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Active Sessions
            {organizationSlug && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                • {organizationSlug}
              </span>
            )}
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage your active sessions across all devices
            {sessions.length > 0 && (
              <span className="ml-1">
                ({sessions.length} active session
                {sessions.length !== 1 ? 's' : ''})
              </span>
            )}
          </p>
        </div>

        {/* ✅ ENTERPRISE: Bulk actions */}
        {allowBulkRevoke && otherSessions.length > 0 && (
          <button
            onClick={() => setShowConfirmDialog({ type: 'all' })}
            disabled={isRevokingAll || isLoading}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-md transition-colors disabled:opacity-50"
          >
            {isRevokingAll ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                Revoking All...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Revoke All Other Sessions
              </>
            )}
          </button>
        )}
      </div>

      {/* ✅ ENTERPRISE: Sessions list */}
      {sessions.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-foreground mb-1">
            No Active Sessions
          </h3>
          <p className="text-sm text-muted-foreground">
            You don&apos;t have any active sessions.
          </p>{' '}
          {/* ✅ CORREÇÃO: Escape apostrophe */}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Current session */}
          {currentSession && (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">
                This Device
              </h3>
              {renderSessionItem(currentSession, true)}
            </div>
          )}

          {/* Other sessions */}
          {otherSessions.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">
                Other Sessions ({otherSessions.length})
              </h3>
              <div className="space-y-3">
                {otherSessions.map(session => renderSessionItem(session))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ✅ ENTERPRISE: Security notice */}
      <div className="p-4 bg-muted/50 rounded-lg">
        <div className="flex items-start space-x-2">
          <svg
            className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium">Security Tips</p>
            <ul className="space-y-1">
              <li>• If you see an unfamiliar session, revoke it immediately</li>
              <li>
                • Sessions automatically expire after 30 days of inactivity
              </li>
              <li>
                • Use &quot;Revoke All Other Sessions&quot; if you suspect
                unauthorized access
              </li>{' '}
              {/* ✅ CORREÇÃO: Escape quotes */}
              {organizationSlug && (
                <li>
                  • These sessions are specific to your {organizationSlug}{' '}
                  account
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* ✅ ENTERPRISE: Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-background rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex items-center space-x-2 mb-4">
              <svg
                className="w-5 h-5 text-orange-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <h3 className="text-lg font-semibold">
                {showConfirmDialog.type === 'all'
                  ? 'Revoke All Other Sessions?'
                  : 'Revoke Session?'}
              </h3>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              {
                showConfirmDialog.type === 'all'
                  ? `This will sign you out of all other devices (${otherSessions.length} sessions). You&apos;ll need to sign in again on those devices.` // ✅ CORREÇÃO: Escape apostrophe
                  : `This will sign you out of &quot;${showConfirmDialog.deviceName ?? 'this device'}&quot;. You&apos;ll need to sign in again on that device.` // ✅ CORREÇÃO: Escape quotes and apostrophe, || → ||
              }
            </p>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowConfirmDialog(null)}
                disabled={isRevokingAll || revokingSessionToken !== null}
                className="flex-1 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-input rounded-md hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={
                  void (() => {
                    // ✅ CORREÇÃO: Add void to handle promise
                    if (showConfirmDialog.type === 'all') {
                      void handleRevokeAllOtherSessions(); // ✅ CORREÇÃO: Add void
                    } else if (showConfirmDialog.sessionToken) {
                      void handleRevokeSession(
                        showConfirmDialog.sessionToken,
                        showConfirmDialog.deviceName
                      ); // ✅ CORREÇÃO: Add void
                    }
                  })
                }
                disabled={isRevokingAll || revokingSessionToken !== null}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50"
              >
                {isRevokingAll || revokingSessionToken
                  ? 'Revoking...'
                  : 'Revoke'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// ADDITIONAL COMPONENTS
// ============================================

/**
 * ✅ ENTERPRISE: Compact session list for smaller spaces
 */
export function SessionList({
  sessions,
  onRevokeSession,
  className,
}: {
  sessions: SessionDevice[];
  onRevokeSession: (sessionToken: string) => Promise<void>;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {sessions.map(session => (
        <div
          key={session.sessionToken}
          className="flex items-center justify-between p-2 border rounded hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-center space-x-2">
            {getDeviceIcon(session.deviceType)}
            <div>
              <div className="text-sm font-medium">
                {session.deviceName ?? `${session.deviceType} Device`}{' '}
                {/* ✅ CORREÇÃO: || → || */}
                {session.isCurrent && (
                  <span className="ml-2 text-xs text-primary">(Current)</span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {session.location.city}, {session.location.country}
              </div>
            </div>
          </div>

          {!session.isCurrent && (
            <button
              onClick={void (() => onRevokeSession(session.sessionToken))} // ✅ CORREÇÃO: Add void to handle promise
              className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded"
            >
              Revoke
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * ✅ ENTERPRISE: Session summary card
 */
export function SessionSummary({
  sessionCount,
  riskScore,
  className,
}: {
  sessionCount: number;
  riskScore: number;
  className?: string;
}) {
  const riskColors = getRiskLevelColor(riskScore);

  return (
    <div className={cn('p-4 border rounded-lg', className)}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold">{sessionCount}</div>
          <div className="text-sm text-muted-foreground">Active Sessions</div>
        </div>
        <div className="text-right">
          <div className={cn('text-sm font-medium', riskColors.text)}>
            Risk: {riskScore}%
          </div>
          <div
            className={cn('w-2 h-2 rounded-full ml-auto mt-1', riskColors.dot)}
          />
        </div>
      </div>
    </div>
  );
}
