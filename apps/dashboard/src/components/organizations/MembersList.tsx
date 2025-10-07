'use client';

import { useState, useEffect } from 'react';
import { Button } from '@workspace/ui';

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  joinedAt: string;
}

interface MembersListProps {
  organizationSlug: string;
}

export function MembersList({ organizationSlug }: MembersListProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - replace with real API call
  useEffect(() => {
    const mockMembers: Member[] = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'Admin',
        joinedAt: '2024-01-15',
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'Member',
        joinedAt: '2024-02-01',
      },
    ];
    
    setTimeout(() => {
      setMembers(mockMembers);
      setIsLoading(false);
    }, 1000);
  }, [organizationSlug]);

  if (isLoading) {
    return <div className="text-center py-4">Loading members...</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
      </div>
      
      <div className="divide-y divide-gray-200">
        {members.map((member) => (
          <div key={member.id} className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10">
                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700">
                    {member.name.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-900">{member.name}</div>
                <div className="text-sm text-gray-500">{member.email}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {member.role}
              </span>
              <Button variant="outline" size="sm">
                Edit
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
