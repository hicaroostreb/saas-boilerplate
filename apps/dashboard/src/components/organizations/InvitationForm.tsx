'use client';

import { Button, FormField, Input } from '@workspace/ui';
import { useState } from 'react';

interface InvitationFormProps {
  organizationSlug: string;
}

export function InvitationForm({ organizationSlug }: InvitationFormProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/organizations/invitations/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          organizationSlug,
          role,
        }),
      });

      if (response.ok) {
        setMessage('Invitation sent successfully!');
        setEmail('');
      } else {
        setMessage('Failed to send invitation. Please try again.');
      }
    } catch {
      setMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Invite New Member
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Email address" required>
          <Input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter email address"
            required
          />
        </FormField>

        <FormField label="Role">
          <select
            value={role}
            onChange={e => setRole(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </FormField>

        {message && (
          <div
            className={`text-sm ${
              message.includes('successfully')
                ? 'text-green-600'
                : 'text-red-600'
            }`}
          >
            {message}
          </div>
        )}

        <Button type="submit" disabled={isLoading || !email}>
          {isLoading ? 'Sending...' : 'Send Invitation'}
        </Button>
      </form>
    </div>
  );
}
