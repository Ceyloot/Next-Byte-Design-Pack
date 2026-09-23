
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SecurityEvent {
  type: 'auth_failure' | 'suspicious_activity' | 'data_access' | 'password_change' | 'rate_limit_exceeded' | 'invalid_input';
  timestamp: Date;
  details: string;
  userAgent?: string;
  ipAddress?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

interface SecurityMetrics {
  authFailures: number;
  suspiciousActivities: number;
  totalEvents: number;
  highSeverityEvents: number;
}

export const useSecurityMonitoring = () => {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    authFailures: 0,
    suspiciousActivities: 0,
    totalEvents: 0,
    highSeverityEvents: 0
  });
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeoutId, setBlockTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const logSecurityEvent = useCallback(async (event: Omit<SecurityEvent, 'timestamp' | 'userAgent'>) => {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
    };
    
    setSecurityEvents(prev => {
      const updated = [...prev, securityEvent].slice(-100); // Keep last 100 events
      return updated;
    });
    
    // Enhanced logging with structured data
    console.warn('🚨 Security Event:', {
      type: securityEvent.type,
      severity: securityEvent.severity,
      details: securityEvent.details,
      timestamp: securityEvent.timestamp.toISOString(),
      metadata: securityEvent.metadata
    });
    
    // Send email alert for high/critical events
    if (securityEvent.severity === 'critical' || securityEvent.severity === 'high') {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          console.log('📊 Sending suspicious activity alert for user:', user.id);
          supabase.functions.invoke('send-suspicious-activity-alert', {
            body: {
              userId: user.id,
              email: user.email,
              eventType: securityEvent.type,
              severity: securityEvent.severity,
              details: securityEvent.details,
              userAgent: securityEvent.userAgent,
            },
          }).catch(e => console.error('Failed to send suspicious activity alert:', e));
        }
      } catch (error) {
        console.error('Failed to send security alert:', error);
      }
    }
    
    // Auto-responses to threats (less aggressive)
    if (securityEvent.severity === 'critical') {
      toast({
        title: "Krytyczne zagrożenie bezpieczeństwa!",
        description: "Wykryto podejrzaną aktywność. Skontaktuj się z administratorem.",
        variant: "destructive"
      });
      
      // Clear any existing timeout to prevent memory leak
      if (blockTimeoutId) {
        clearTimeout(blockTimeoutId);
      }
      
      // Shorter temporary block for critical threats with proper cleanup
      setIsBlocked(true);
      const timeoutId = setTimeout(() => {
        setIsBlocked(false);
        setBlockTimeoutId(null);
      }, 60000); // 1 minute instead of 5 minutes
      setBlockTimeoutId(timeoutId);
    } else if (securityEvent.severity === 'high') {
      // Only show toast for high severity, don't block
      toast({
        title: "Wykryto podejrzaną aktywność",
        description: securityEvent.details,
        variant: "destructive"
      });
    }
  }, [toast, blockTimeoutId]);

  const checkAuthFailures = useCallback(() => {
    const now = Date.now();
    const recentFailures = securityEvents.filter(
      event => event.type === 'auth_failure' && 
      now - event.timestamp.getTime() < 15 * 60 * 1000 // 15 minutes
    );
    
    if (recentFailures.length >= 5) {
      logSecurityEvent({
        type: 'suspicious_activity',
        severity: 'high',
        details: `Multiple auth failures detected: ${recentFailures.length} attempts in 15 minutes`,
        metadata: { failureCount: recentFailures.length, timeWindow: '15min' }
      });
    } else if (recentFailures.length >= 3) {
      logSecurityEvent({
        type: 'suspicious_activity',
        severity: 'medium',
        details: `Repeated auth failures: ${recentFailures.length} attempts in 15 minutes`,
        metadata: { failureCount: recentFailures.length, timeWindow: '15min' }
      });
    }
  }, [securityEvents, logSecurityEvent]);

  const validateSession = useCallback(async (): Promise<boolean> => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        await logSecurityEvent({
          type: 'auth_failure',
          severity: 'medium',
          details: `Session validation failed: ${error.message}`,
          metadata: { errorCode: error.status }
        });
        return false;
      }
      
      // Check session expiry
      if (session?.expires_at && session.expires_at < Math.floor(Date.now() / 1000)) {
        await logSecurityEvent({
          type: 'auth_failure',
          severity: 'low',
          details: 'Session expired during validation',
          metadata: { expiresAt: session.expires_at }
        });
        return false;
      }
      
      return !!session;
    } catch (error) {
      await logSecurityEvent({
        type: 'auth_failure',
        severity: 'high',
        details: `Session validation error: ${error}`,
        metadata: { error: String(error) }
      });
      return false;
    }
  }, [logSecurityEvent]);

  const detectAnomalousActivity = useCallback(() => {
    const now = Date.now();
    const last5Minutes = securityEvents.filter(
      event => now - event.timestamp.getTime() < 5 * 60 * 1000
    );
    
    // Detect unusual activity patterns
    if (last5Minutes.length > 20) {
      logSecurityEvent({
        type: 'suspicious_activity',
        severity: 'high',
        details: `Unusual activity spike: ${last5Minutes.length} events in 5 minutes`,
        metadata: { eventCount: last5Minutes.length, timeWindow: '5min' }
      });
    }
    
    // Detect repeated invalid inputs
    const invalidInputs = last5Minutes.filter(event => event.type === 'invalid_input');
    if (invalidInputs.length > 10) {
      logSecurityEvent({
        type: 'suspicious_activity',
        severity: 'medium',
        details: `Multiple invalid input attempts: ${invalidInputs.length} in 5 minutes`,
        metadata: { invalidInputCount: invalidInputs.length }
      });
    }
  }, [securityEvents, logSecurityEvent]);

  // Update metrics when events change
  useEffect(() => {
    const authFailures = securityEvents.filter(e => e.type === 'auth_failure').length;
    const suspiciousActivities = securityEvents.filter(e => e.type === 'suspicious_activity').length;
    const highSeverityEvents = securityEvents.filter(e => 
      e.severity === 'high' || e.severity === 'critical'
    ).length;
    
    setMetrics({
      authFailures,
      suspiciousActivities,
      totalEvents: securityEvents.length,
      highSeverityEvents
    });
  }, [securityEvents]);

  // Run security checks periodically (reduced frequency)
  useEffect(() => {
    const interval = setInterval(() => {
      checkAuthFailures();
      detectAnomalousActivity();
    }, 5 * 60 * 1000); // Every 5 minutes instead of 1 minute

    return () => clearInterval(interval);
  }, [checkAuthFailures, detectAnomalousActivity]);

  // Cleanup block timeout on unmount - MEMORY LEAK FIX
  useEffect(() => {
    return () => {
      if (blockTimeoutId) {
        clearTimeout(blockTimeoutId);
      }
    };
  }, [blockTimeoutId]);

  return {
    logSecurityEvent,
    validateSession,
    securityEvents: securityEvents.slice(-50), // Keep only last 50 events for display
    metrics,
    isBlocked
  };
};
