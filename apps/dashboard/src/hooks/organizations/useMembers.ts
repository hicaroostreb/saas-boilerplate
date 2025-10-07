'use client';

import { useState, useEffect } from 'react';

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  joinedAt: string;
}

export function useMembers(organizationSlug: string) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/organizations/${organizationSlug}/members`);
        
        if (response.ok) {
          const data = await response.json();
          setMembers(data.members);
        } else {
          setError('Failed to fetch members');
        }
      } catch {
        setError('An error occurred while fetching members');
      } finally {
        setLoading(false);
      }
    };

    if (organizationSlug) {
      fetchMembers();
    }
  }, [organizationSlug]);

  const inviteMember = async (email: string, role: string) => {
    const response = await fetch('/api/organizations/invitations/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, organizationSlug, role }),
    });

    if (!response.ok) {
      throw new Error('Failed to send invitation');
    }

    return response.json();
  };

  return {
    members,
    loading,
    error,
    inviteMember,
  };
}
