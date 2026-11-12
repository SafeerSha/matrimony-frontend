'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { IconBan, IconLoader2, IconAlertCircle } from '@tabler/icons-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/toast';
import { reportService, type BlockedUser } from '@/services/report.service';

interface BlockedUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCountChange?: (count: number) => void;
}

export function BlockedUsersModal({
  isOpen,
  onClose,
  onCountChange,
}: BlockedUsersModalProps) {
  const [blockedList, setBlockedList] = useState<BlockedUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unblockingId, setUnblockingId] = useState<string | null>(null);

  const loadBlockedUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await reportService.getBlockedUsers();
      setBlockedList(list);
      onCountChange?.(list.length);
    } catch (err: any) {
      setError(err?.message || 'Unable to load blocked profiles.');
    } finally {
      setIsLoading(false);
    }
  }, [onCountChange]);

  useEffect(() => {
    if (isOpen) {
      loadBlockedUsers();
    }
  }, [isOpen, loadBlockedUsers]);

  const handleUnblock = async (user: BlockedUser) => {
    const targetId = user.blockedId || user.id;
    setUnblockingId(targetId);
    try {
      await reportService.unblockUser(targetId);
      setBlockedList((prev) => {
        const next = prev.filter((u) => (u.blockedId || u.id) !== targetId);
        onCountChange?.(next.length);
        return next;
      });
      toast.success('Member Unblocked', {
        description: `${user.name} has been removed from your blocked list.`,
      });
    } catch (err: any) {
      toast.error('Unblock Failed', {
        description: err?.message || 'Could not unblock this member right now.',
      });
    } finally {
      setUnblockingId(null);
    }
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
        {isLoading ? (
          <div className="text-center py-10 text-[#766B6F]">
            <IconLoader2 className="h-6 w-6 mx-auto animate-spin text-[#7A1835] mb-2" />
            <p className="text-xs font-semibold">Loading blocked profiles…</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-[#766B6F] space-y-2">
            <IconAlertCircle className="h-7 w-7 mx-auto text-rose-500" />
            <p className="text-xs font-semibold text-rose-700">{error}</p>
            <Button variant="outline" size="sm" onClick={loadBlockedUsers}>
              Try Again
            </Button>
          </div>
        ) : blockedList.length === 0 ? (
          <div className="text-center py-10 text-[#766B6F]">
            <IconBan className="h-8 w-8 mx-auto text-[#766B6F]/60 mb-2" />
            <p className="text-xs font-semibold">No blocked members</p>
            <p className="text-[11px] text-[#766B6F]/80 mt-0.5">
              You haven&apos;t blocked any matrimonial profiles.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E9DDE0]">
            {blockedList.map((user) => {
              const targetId = user.blockedId || user.id;
              const isBusy = unblockingId === targetId;
              const blockedDate = user.createdAt
                ? `Blocked on ${new Date(user.createdAt).toLocaleDateString()}`
                : '';

              return (
                <div
                  key={user.id}
                  className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-2xl overflow-hidden border border-[#E9DDE0] bg-[#FAF3EC] shrink-0 grid place-items-center text-xs font-bold text-[#7A1835]">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name}
                          className="h-full w-full object-cover grayscale"
                        />
                      ) : (
                        <span>{user.name?.charAt(0)?.toUpperCase() || 'M'}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-[#211B1E] truncate">
                        {user.name}
                        {user.profileId ? (
                          <span className="ml-1.5 font-mono text-[10px] font-normal text-[#766B6F]">
                            ({user.profileId})
                          </span>
                        ) : null}
                      </h4>
                      <p className="text-[10px] text-[#766B6F] truncate">{user.location}</p>
                      {blockedDate && (
                        <span className="text-[9px] text-[#766B6F]/80 block mt-0.5">
                          {blockedDate}
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isBusy}
                    onClick={() => handleUnblock(user)}
                    className="rounded-xl border-[#E9DDE0] text-[#7A1835] hover:bg-[#FAF3EC] text-xs font-bold h-8 px-3 shrink-0"
                  >
                    {isBusy ? 'Unblocking…' : 'Unblock'}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}
