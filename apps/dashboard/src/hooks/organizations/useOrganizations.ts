'use client';

import { useState, useEffect } from 'react';

interface Organization {
  id: string;
  name: string;
  slug: string;
  memberCount: number;
  description?: string;
  createdAt: string;
}

export function useOrganizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/organizations');
        
        if (response.ok) {
          const data = await response.json();
          setOrganizations(data.organizations);
        } else {
          setError('Failed to fetch organizations');
        }
      } catch (err) {
        setError('An error occurred while fetching organizations');
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  const createOrganization = async (name: string, slug: string) => {
    const response = await fetch('/api/organizations/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, slug }),
    });

    if (response.ok) {
      const newOrg = await response.json();
      setOrganizations(prev => [...prev, newOrg.organization]);
      return newOrg.organization;
    } else {
      throw new Error('Failed to create organization');
    }
  };

  return {
    organizations,
    loading,
    error,
    createOrganization,
  };
}
