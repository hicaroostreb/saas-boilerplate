'use client';

import { Button } from '@workspace/ui';
import { useState } from 'react';

interface BillingSettingsProps {
  organizationSlug: string;
}

export function BillingSettings({ organizationSlug }: BillingSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async (priceId: string) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, organizationSlug }),
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Failed to create checkout session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Current Plan</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900">Free Plan</p>
            <p className="text-gray-600">Up to 5 team members</p>
            <p className="text-xs text-gray-500 mt-1">
              Organization: {organizationSlug}
            </p>
          </div>
          <Button
            onClick={() => handleUpgrade('price_premium')}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Upgrade to Premium'}
          </Button>
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Billing History
        </h3>
        <p className="text-gray-600">No billing history yet.</p>
      </div>

      {/* Payment Method */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Payment Method
        </h3>
        <p className="text-gray-600">No payment method on file.</p>
        <Button variant="outline" className="mt-4">
          Add Payment Method
        </Button>
      </div>
    </div>
  );
}
