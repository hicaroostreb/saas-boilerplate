'use client';

import { useEffect, useState } from 'react';

interface Subscription {
  id: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  planName: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export function useSubscription(organizationSlug: string) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/organizations/${organizationSlug}/subscription`
        );

        if (response.ok) {
          const data = await response.json();
          setSubscription(data.subscription);
        } else if (response.status === 404) {
          // No subscription found
          setSubscription(null);
        } else {
          setError('Failed to fetch subscription');
        }
      } catch {
        setError('An error occurred while fetching subscription');
      } finally {
        setLoading(false);
      }
    };

    if (organizationSlug) {
      fetchSubscription();
    }
  }, [organizationSlug]);

  const cancelSubscription = async () => {
    const response = await fetch(
      `/api/organizations/${organizationSlug}/subscription/cancel`,
      {
        method: 'POST',
      }
    );

    if (response.ok) {
      const updatedSubscription = await response.json();
      setSubscription(updatedSubscription.subscription);
    } else {
      throw new Error('Failed to cancel subscription');
    }
  };

  return {
    subscription,
    loading,
    error,
    cancelSubscription,
  };
}
