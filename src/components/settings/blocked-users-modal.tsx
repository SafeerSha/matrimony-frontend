'use client';

import React, { useState } from 'react';
import { IconBan, IconUserCheck, IconShieldCheck, IconTrash } from '@tabler/icons-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/toast';

interface BlockedUser {
  id: string;
  name: string;
  location: string;
  blockedDate: string;
  image: string;
}

const INITIAL_BLOCKED_USERS: BlockedUser[] = [];

interface BlockedUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BlockedUsersModal({ isOpen, onClose }: BlockedUsersModalProps) {
  const [blockedList, setBlockedList] = useState<BlockedUser[]>(INITIAL_BLOCKED_USERS);

  const handleUnblock = (user: BlockedUser) => {
    setBlockedList((prev) => prev.filter((u) => u.id !== user.id));
    toast.success('Member Unblocked', {
      description: `${user.name} has been removed from your blocked list.`,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Blocked Profiles"
      description="Blocked members cannot view your profile, send interests, or message you."
      size="md"
      footer={
        <div className="flex justify-end w-full">
          <Button
            size="md"
            onClick={onClose}
            className="rounded-xl bg-[#7A1835] text-white text-xs font-bold px-6"
          >
            Done
          </Button>
        </div>
      }
    >
      <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
        {blockedList.length === 0 ? (
          <div className="text-center py-10 text-[#766B6F]">
            <IconBan className="h-8 w-8 mx-auto text-[#766B6F]/60 mb-2" />
            <p className="text-xs font-semibold">No blocked members</p>
            <p className="text-[11px] text-[#766B6F]/80 mt-0.5">
              You haven't blocked any matrimonial profiles.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E9DDE0]">
            {blockedList.map((user) => (
              <div
                key={user.id}
                className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl overflow-hidden border border-[#E9DDE0] bg-[#FAF3EC] shrink-0">
                    <img
                      src={user.image}
                      alt={user.name}
                      className="h-full w-full object-cover grayscale"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#211B1E]">{user.name}</h4>
                    <p className="text-[10px] text-[#766B6F]">{user.location}</p>
                    <span className="text-[9px] text-[#766B6F]/80 block mt-0.5">
                      {user.blockedDate}
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUnblock(user)}
                  className="rounded-xl border-[#E9DDE0] text-[#7A1835] hover:bg-[#FAF3EC] text-xs font-bold h-8 px-3"
                >
                  Unblock
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
