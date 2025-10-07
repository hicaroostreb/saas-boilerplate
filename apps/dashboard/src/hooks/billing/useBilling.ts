'use client';

import { useState, useEffect } from 'react';

interface BillingInfo {
  plan: string;
  status: string;
  nextBillingDate?: string;
  amount?: number;
}

export function useBilling(organizationSlug: string) {
  const [billing, setBilling] = useState<BillingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBilling = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/organizations/${organizationSlug}/billing`);
        
        if (response.ok) {
          const data = await response.json();
          setBilling(data.billing);
        } else {
          setError('Failed to fetch billing information');
        }
      } catch {
        setError('An error occurred while fetching billing information');
      } finally {
        setLoading(false);
      }
    };

    if (organizationSlug) {
      fetchBilling();
    }
  }, [organizationSlug]);

  const createCheckoutSession = async (priceId: string) => {
    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId, organizationSlug }),
    });

    if (response.ok) {
      const { url } = await response.json();
      window.location.href = url;
    } else {
      throw new Error('Failed to create checkout session');
    }
  };

  return {
    billing,
    loading,
    error,
    createCheckoutSession,
  };
}
