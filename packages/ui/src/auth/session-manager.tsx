'use client';

import { useState } from 'react';
import { useTimeRemaining } from '../hooks/useTimeRemaining';
import { Button } from '../primitives/Button';
import { ErrorAlert } from '../primitives/ErrorAlert';
import { cn } from '../utils/cn';

export interface SessionData {
  id: string;
  deviceName?: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  browser?: string;
  location?: string;
  ipAddress?: string;
  lastActive: string;
  isCurrent: boolean;
  createdAt: string;
}

export interface SessionManagerProps {
  sessions: SessionData[];
  currentSessionId?: string | null; // ✅ MANTER nome original na interface
  organizationSlug?: string | null;
  onEndSession: (sessionId: string) => Promise<void>;
  onEndAllSessions: () => Promise<void>;
  onRefresh?: () => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
  showLocationInfo?: boolean;
  sessionTimeout?: string; // ISO date string
}

/**
 * SessionManager component - Manage active user sessions
 *
 * @example
 * ```
 * function SecuritySettings() {
 *   const [sessions, setSessions] = useState<SessionData[]>([]);
 *   const [isLoading, setIsLoading] = useState(true);
 *   const [error, setError] = useState<string | null>(null);
 *
 *   useEffect(() => {
 *     loadSessions();
 *   }, []);
 *
 *   const loadSessions = async () => {
 *     try {
 *       const data = await authService.getUserSessions();
 *       setSessions(data);
 *     } catch (err) {
 *       setError('Failed to load sessions');
 *     } finally {
 *       setIsLoading(false);
 *     }
 *   };
 *
 *   const handleEndSession = async (sessionId: string) => {
 *     await authService.endSession(sessionId);
 *     await loadSessions();
 *   };
 *
 *   const handleEndAllSessions = async () => {
 *     await authService.endAllSessions();
 *     await loadSessions();
 *   };
 *
 *   return (
 *     <SessionManager
 *       sessions={sessions}
 *       currentSessionId={currentUser.sessionId}
 *       organizationSlug="acme-corp"
 *       onEndSession={handleEndSession}
 *       onEndAllSessions={handleEndAllSessions}
 *       onRefresh={loadSessions}
 *       isLoading={isLoading}
 *       error={error}
 *       showLocationInfo={true}
 *       sessionTimeout="2024-12-31T23:59:59Z"
 *     />
 *   );
 * }
 * ```
 */
export function SessionManager({
  sessions,
  currentSessionId: _currentSessionId, // ✅ CORREÇÃO: Renomear apenas no destructuring
  organizationSlug,
  onEndSession,
  onEndAllSessions,
  onRefresh,
  isLoading = false,
  error,
  className,
  showLocationInfo = false,
  sessionTimeout,
}: SessionManagerProps): JSX.Element {
  const [endingSessionIds, setEndingSessionIds] = useState<Set<string>>(
    new Set()
  );
  const [isEndingAll, setIsEndingAll] = useState(false);

  const currentSession = sessions.find(session => session.isCurrent);
  const otherSessions = sessions.filter(session => !session.isCurrent);

  const handleEndSession = async (sessionId: string): Promise<void> => {
    setEndingSessionIds(prev => new Set(prev).add(sessionId));

    try {
      await onEndSession(sessionId);
    } finally {
      setEndingSessionIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(sessionId);
        return newSet;
      });
    }
  };

  const handleEndAllSessions = async (): Promise<void> => {
    setIsEndingAll(true);

    try {
      await onEndAllSessions();
    } finally {
      setIsEndingAll(false);
    }
  };

  if (isLoading) {
    return (
      <div className={cn('space-y-6', className)}>
        <SessionManagerHeader
          organizationSlug={organizationSlug || null}
          sessionTimeout={sessionTimeout}
        />

        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      <SessionManagerHeader
        organizationSlug={organizationSlug || null}
        sessionTimeout={sessionTimeout}
      />

      <ErrorAlert message={error} />

      {/* Refresh Button */}
      {onRefresh && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshIcon className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      )}

      {/* Current Session */}
      {currentSession && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Current Session</h3>
          <SessionCard
            session={currentSession}
            isCurrent={true}
            showLocationInfo={showLocationInfo}
            onEndSession={() => {}} // Can't end current session
            isEnding={false}
            disabled={true}
          />
        </div>
      )}

      {/* Other Sessions */}
      {otherSessions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Other Sessions</h3>
            {otherSessions.length > 1 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleEndAllSessions}
                disabled={isEndingAll}
                loading={isEndingAll}
              >
                End All Sessions
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {otherSessions.map(session => (
              <SessionCard
                key={session.id}
                session={session}
                isCurrent={false}
                showLocationInfo={showLocationInfo}
                onEndSession={handleEndSession}
                isEnding={endingSessionIds.has(session.id)}
                disabled={isEndingAll}
              />
            ))}
          </div>
        </div>
      )}

      {/* No Other Sessions */}
      {otherSessions.length === 0 && currentSession && (
        <div className="text-center py-8">
          <div className="text-muted-foreground text-sm">
            No other active sessions found.
          </div>
        </div>
      )}

      {/* Security Notice */}
      <SecurityNotice organizationSlug={organizationSlug || null} />
    </div>
  );
}

// Sub-components
function SessionManagerHeader({
  organizationSlug,
  sessionTimeout,
}: {
  organizationSlug: string | null;
  sessionTimeout?: string;
}): JSX.Element {
  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-bold">
        {organizationSlug ? `${organizationSlug} Sessions` : 'Active Sessions'}
      </h2>
      <p className="text-muted-foreground">
        Manage your active sessions across all devices. End sessions you
        don&apos;t recognize.
      </p>

      {sessionTimeout && <SessionTimeout expiresAt={sessionTimeout} />}
    </div>
  );
}

function SessionTimeout({ expiresAt }: { expiresAt: string }): JSX.Element {
  const { formattedTime, isExpired } = useTimeRemaining(expiresAt);

  if (isExpired) {
    return (
      <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
        <div className="flex items-center gap-2">
          <ClockIcon className="h-4 w-4 text-error" />
          <span className="text-sm text-error font-medium">
            Session expired. Please sign in again.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
      <div className="flex items-center gap-2">
        <ClockIcon className="h-4 w-4 text-warning" />
        <span className="text-sm text-warning">
          Session expires in:{' '}
          <span className="font-medium">{formattedTime}</span>
        </span>
      </div>
    </div>
  );
}

function SessionCard({
  session,
  isCurrent,
  showLocationInfo,
  onEndSession,
  isEnding,
  disabled,
}: {
  session: SessionData;
  isCurrent: boolean;
  showLocationInfo: boolean;
  onEndSession: (sessionId: string) => void;
  isEnding: boolean;
  disabled: boolean;
}): JSX.Element {
  const formatLastActive = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div
      className={cn(
        'border rounded-lg p-4',
        isCurrent ? 'border-primary/20 bg-primary/5' : 'border-border'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-1">
            <DeviceIcon
              deviceType={session.deviceType}
              className="h-5 w-5 text-muted-foreground"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {session.deviceName || `${session.deviceType} Device`}
              </span>
              {isCurrent && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  Current
                </span>
              )}
            </div>

            {session.browser && (
              <p className="text-sm text-muted-foreground">{session.browser}</p>
            )}

            {showLocationInfo && session.location && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <LocationIcon className="h-3 w-3" />
                {session.location}
              </p>
            )}

            {showLocationInfo && session.ipAddress && (
              <p className="text-xs text-muted-foreground">
                IP: {session.ipAddress}
              </p>
            )}

            <p className="text-xs text-muted-foreground">
              Last active: {formatLastActive(session.lastActive)}
            </p>
          </div>
        </div>

        {!isCurrent && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEndSession(session.id)}
            disabled={disabled || isEnding}
            loading={isEnding}
            className="text-error hover:text-error"
          >
            End Session
          </Button>
        )}
      </div>
    </div>
  );
}

function SecurityNotice({
  organizationSlug,
}: {
  organizationSlug: string | null;
}): JSX.Element {
  return (
    <div className="p-4 bg-muted/50 rounded-lg space-y-2">
      <h4 className="font-medium text-sm">Security Tips</h4>
      <ul className="text-xs text-muted-foreground space-y-1">
        <li className="flex items-start gap-2">
          <div className="w-1 h-1 rounded-full bg-muted-foreground mt-2" />
          <span>
            End sessions you don&apos;t recognize or from unfamiliar locations
          </span>
        </li>
        <li className="flex items-start gap-2">
          <div className="w-1 h-1 rounded-full bg-muted-foreground mt-2" />
          <span>
            {organizationSlug
              ? `Contact your ${organizationSlug} admin if you see suspicious activity`
              : 'Report suspicious activity to support immediately'}
          </span>
        </li>
        <li className="flex items-start gap-2">
          <div className="w-1 h-1 rounded-full bg-muted-foreground mt-2" />
          <span>Always sign out when using shared or public devices</span>
        </li>
      </ul>
    </div>
  );
}

// Icons
function DeviceIcon({
  deviceType,
  className,
}: {
  deviceType: SessionData['deviceType'];
  className?: string;
}): JSX.Element {
  switch (deviceType) {
    case 'mobile':
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
          <path d="M12 18h.01" />
        </svg>
      );
    case 'tablet':
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
      );
    case 'desktop':
    default:
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect width="20" height="14" x="2" y="3" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      );
  }
}

function RefreshIcon({ className }: { className?: string }): JSX.Element {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }): JSX.Element {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12,6 12,12 16,14" />
    </svg>
  );
}

function LocationIcon({ className }: { className?: string }): JSX.Element {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
