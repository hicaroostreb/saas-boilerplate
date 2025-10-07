'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, FormField } from '@workspace/ui';

export function OrganizationSetup() {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    setSlug(generateSlug(newName));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/organizations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug }),
      });

      if (response.ok) {
        router.push(`/organizations/${slug}`);
      } else {
        setError('Failed to create organization. Please try again.');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      <FormField label="Organization name" required>
        <Input
          type="text"
          value={name}
          onChange={handleNameChange}
          placeholder="Enter organization name"
          required
        />
      </FormField>

      <FormField label="Organization URL" required>
        <div className="flex">
          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
            yourapp.com/
          </span>
          <Input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="organization-slug"
            className="rounded-l-none"
            required
          />
        </div>
      </FormField>

      {error && (
        <div className="text-sm text-red-600 text-center">
          {error}
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading || !name || !slug}
      >
        {isLoading ? 'Creating...' : 'Create Organization'}
      </Button>
    </form>
  );
}
