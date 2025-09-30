'use client';

import { toast } from '@workspace/ui';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface TeamInvitation {
  email: string;
  role: 'MEMBER' | 'ADMIN';
}

export function OrganizationOnboardingClient() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1 data
  const [organizationData, setOrganizationData] = useState({
    name: '',
    slug: '',
    logo: null as File | null,
    includeExampleData: true,
  });

  // Step 2 data
  const [invitations, setInvitations] = useState<TeamInvitation[]>([
    { email: '', role: 'MEMBER' },
    { email: '', role: 'MEMBER' },
    { email: '', role: 'MEMBER' },
  ]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    setOrganizationData(prev => ({ ...prev, name, slug }));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slug = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-');

    setOrganizationData(prev => ({ ...prev, slug }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error('Logo file must be less than 5MB');
        return;
      }
      setOrganizationData(prev => ({ ...prev, logo: file }));
    }
  };

  const addInvitation = () => {
    setInvitations(prev => [...prev, { email: '', role: 'MEMBER' }]);
  };

  const updateInvitation = (
    index: number,
    field: keyof TeamInvitation,
    value: string
  ) => {
    setInvitations(prev =>
      prev.map((inv, i) => (i === index ? { ...inv, [field]: value } : inv))
    );
  };

  const _removeInvitation = (index: number) => {
    if (invitations.length > 1) {
      setInvitations(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!organizationData.name || !organizationData.slug) {
        toast.error('Please fill in all required fields');
        return;
      }
      setStep(2);
    }
  };

  const handleFinish = async () => {
    setIsLoading(true);

    try {
      // Create organization
      const organizationFormData = new FormData();
      organizationFormData.append('name', organizationData.name);
      organizationFormData.append('slug', organizationData.slug);
      organizationFormData.append(
        'includeExampleData',
        organizationData.includeExampleData.toString()
      );

      if (organizationData.logo) {
        organizationFormData.append('logo', organizationData.logo);
      }

      const orgResponse = await fetch('/api/organizations/create', {
        method: 'POST',
        body: organizationFormData,
      });

      const orgResult = await orgResponse.json();

      if (!orgResponse.ok || !orgResult.success) {
        toast.error(
          orgResult.error?.message || 'Failed to create organization'
        );
        return;
      }

      // Send invitations (only non-empty emails)
      const validInvitations = invitations.filter(inv => inv.email.trim());

      if (validInvitations.length > 0) {
        const invitationResponse = await fetch(
          '/api/organizations/invitations/send',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              organizationId: orgResult.organization.id,
              invitations: validInvitations,
            }),
          }
        );

        if (!invitationResponse.ok) {
          console.warn('Failed to send some invitations');
          // Don't block the flow, just warn
        }
      }

      toast.success('Organization created successfully!');
      // Redirect to the new organization
      window.location.href = `/organizations/${organizationData.slug}/home`;
    } catch (error) {
      console.error('Organization creation error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isStep1Valid =
    organizationData.name.trim() && organizationData.slug.trim();

  return (
    <div className="relative min-h-screen bg-background">
      {/* Logo Header */}
      <div className="absolute inset-x-0 top-0 mx-auto flex min-w-80 items-center justify-center p-4">
        <div className="flex items-center space-x-2">
          <div className="flex size-9 items-center justify-center p-1">
            <div className="flex size-7 items-center justify-center rounded-md border text-primary-foreground bg-primary">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g>
                  <path
                    d="M7.81815 8.36373L12 0L24 24H15.2809L7.81815 8.36373Z"
                    fill="currentColor"
                  />
                  <path
                    d="M4.32142 15.3572L8.44635 24H-1.14809e-06L4.32142 15.3572Z"
                    fill="currentColor"
                  />
                </g>
              </svg>
            </div>
          </div>
          <span className="font-bold">Acme</span>
        </div>
      </div>

      {/* Back Button */}
      <Link
        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 absolute left-4 top-4"
        href={step === 1 ? '/organizations' : '#'}
        onClick={
          step === 2
            ? e => {
                e.preventDefault();
                setStep(1);
              }
            : undefined
        }
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-chevron-left mr-2 size-4 shrink-0"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back
      </Link>

      {/* Main Form */}
      <div className="mx-auto w-full min-w-80 max-w-lg space-y-4 p-4 pt-24">
        {/* Progress Indicator */}
        <div className="w-48 space-y-4">
          <p className="text-sm text-muted-foreground">Step {step} of 2</p>
          <div className="flex flex-row gap-2">
            <div
              className={`h-1 w-full rounded-[1px] ${step >= 1 ? 'bg-primary' : 'bg-muted'}`}
            />
            <div
              className={`h-1 w-full rounded-[1px] ${step >= 2 ? 'bg-primary' : 'bg-muted'}`}
            />
          </div>
        </div>

        {/* Step 1: Organization Details */}
        {step === 1 && (
          <div className="flex w-full flex-col gap-4">
            <h1 className="text-xl font-semibold leading-none tracking-tight lg:text-2xl">
              Add your organization
            </h1>
            <p className="text-sm text-muted-foreground lg:text-base">
              We just need some basic info to get your organization set up.
              You&apos;ll be able to edit this later.
            </p>

            {/* Logo Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Logo
              </label>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <label className="text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent shadow-sm hover:text-accent-foreground flex flex-col items-center justify-center border-dashed hover:border-primary hover:bg-accent size-20 rounded-xl p-0.5 cursor-pointer">
                    <input
                      accept="image/*"
                      type="file"
                      className="sr-only"
                      onChange={handleLogoUpload}
                    />
                    <span className="relative flex shrink-0 overflow-hidden size-[72px] rounded-md">
                      {organizationData.logo ? (
                        <Image
                          src={URL.createObjectURL(organizationData.logo)}
                          alt="Logo preview"
                          width={72}
                          height={72}
                          className="size-[72px] rounded-md object-cover"
                        />
                      ) : (
                        <span className="flex items-center justify-center bg-muted size-[72px] rounded-md text-2xl">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-upload size-5 shrink-0 text-muted-foreground"
                          >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" x2="12" y1="3" y2="15" />
                          </svg>
                        </span>
                      )}
                    </span>
                  </label>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-sm">Upload your logo</span>
                  <span className="text-xs text-muted-foreground">
                    *.png, *.jpeg files up to 5 MB
                  </span>
                </div>
              </div>
            </div>

            {/* Organization Name */}
            <div className="space-y-2 flex w-full flex-col">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Name<span className="align-top">*</span>
              </label>
              <input
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                maxLength={64}
                required
                type="text"
                value={organizationData.name}
                onChange={handleNameChange}
                placeholder="Enter organization name"
              />
            </div>

            {/* Organization Slug */}
            <div className="space-y-2 flex w-full flex-col">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Slug<span className="align-top">*</span>
              </label>
              <input
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                maxLength={255}
                required
                type="text"
                value={organizationData.slug}
                onChange={handleSlugChange}
                placeholder="organization-slug"
              />
              <p className="text-[0.8rem] text-muted-foreground break-all">
                /organizations/{organizationData.slug || '...'}
              </p>
            </div>

            {/* Example Data Toggle */}
            <div className="space-y-2 flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Example data
                </label>
                <p className="text-[0.8rem] text-muted-foreground">
                  Recommended to explore the platform
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={organizationData.includeExampleData}
                data-state={
                  organizationData.includeExampleData ? 'checked' : 'unchecked'
                }
                className="peer inline-flex h-[20px] w-[36px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
                onClick={() =>
                  setOrganizationData(prev => ({
                    ...prev,
                    includeExampleData: !prev.includeExampleData,
                  }))
                }
              >
                <span
                  data-state={
                    organizationData.includeExampleData
                      ? 'checked'
                      : 'unchecked'
                  }
                  className="pointer-events-none block size-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
                />
              </button>
            </div>

            {/* Next Step Button */}
            <div>
              <button
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 mt-4"
                type="button"
                disabled={!isStep1Valid}
                onClick={handleNextStep}
              >
                Next step →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Invite Team */}
        {step === 2 && (
          <div className="flex w-full flex-col gap-4">
            <h1 className="text-3xl font-medium">Invite your team</h1>
            <p className="text-base text-muted-foreground">
              Add team members to get started. You can always invite more people
              later.
            </p>

            <div className="flex flex-col space-y-2">
              <div className="flex h-9 flex-row items-center justify-between">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Email address
                </label>
                <button
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 text-primary underline-offset-4 hover:underline h-9 px-4 py-2"
                  type="button"
                  onClick={addInvitation}
                >
                  + Add invitation
                </button>
              </div>

              {/* Invitation Rows */}
              {invitations.map((invitation, index) => (
                <div key={index} className="flex items-baseline space-x-2">
                  <div className="space-y-2 w-full">
                    <input
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      maxLength={255}
                      placeholder="user@email.com"
                      type="email"
                      value={invitation.email}
                      onChange={e =>
                        updateInvitation(index, 'email', e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2 w-44">
                    <select
                      className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      value={invitation.role}
                      onChange={e =>
                        updateInvitation(index, 'role', e.target.value)
                      }
                    >
                      <option value="MEMBER">Member</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>

            {/* Finish Button */}
            <div>
              <button
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 mt-4"
                type="button"
                disabled={isLoading}
                onClick={handleFinish}
              >
                {isLoading ? 'Creating...' : 'Finish'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
