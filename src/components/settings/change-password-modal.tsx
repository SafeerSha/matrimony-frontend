'use client';

import React, { useState } from 'react';
import { IconLock, IconKey, IconShieldCheck, IconEye, IconEyeOff, IconLoader2 } from '@tabler/icons-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/toast';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Validation Error', { description: 'Please fill in all password fields.' });
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Weak Password', { description: 'New password must be at least 8 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Mismatch', { description: 'New passwords do not match.' });
      return;
    }

    setIsLoading(true);
    // Simulate API update
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Password Updated', {
        description: 'Your account password has been changed successfully.',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    }, 800);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Change Password"
      description="Ensure your matrimonial account remains secure with a strong password."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {/* Current Password */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#766B6F] mb-1.5">
            Current Password
          </label>
          <div className="relative">
            <input
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full rounded-xl bg-[#FFF9F6] border border-[#E9DDE0] pl-3.5 pr-10 py-2.5 text-xs text-[#211B1E] outline-none focus:border-[#7A1835] focus:bg-white"
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#766B6F] hover:text-[#211B1E]"
            >
              {showCurrent ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#766B6F] mb-1.5">
            New Password
          </label>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full rounded-xl bg-[#FFF9F6] border border-[#E9DDE0] pl-3.5 pr-10 py-2.5 text-xs text-[#211B1E] outline-none focus:border-[#7A1835] focus:bg-white"
              required
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#766B6F] hover:text-[#211B1E]"
            >
              {showNew ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Confirm New Password */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#766B6F] mb-1.5">
            Confirm New Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
            className="w-full rounded-xl bg-[#FFF9F6] border border-[#E9DDE0] px-3.5 py-2.5 text-xs text-[#211B1E] outline-none focus:border-[#7A1835] focus:bg-white"
            required
          />
        </div>

        {/* Reassurance */}
        <div className="rounded-xl bg-[#FAF3EC] border border-[#EAD8C7] p-3 text-[11px] text-[#5C1027] flex items-center gap-2">
          <IconShieldCheck className="h-4 w-4 text-[#7A1835] shrink-0" />
          <span>We recommend using a mix of letters, numbers, and symbols.</span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E9DDE0]">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="rounded-xl text-xs font-semibold text-[#766B6F]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="md"
            disabled={isLoading}
            className="rounded-xl bg-[#7A1835] hover:bg-[#5C1027] text-white text-xs font-bold px-6 shadow-sm active-press"
          >
            {isLoading ? <IconLoader2 className="h-4 w-4 animate-spin" /> : 'Update Password'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
