'use client';

import React, { useState } from 'react';
import {
  IconLock,
  IconKey,
  IconShieldCheck,
  IconEye,
  IconEyeOff,
  IconLoader2,
  IconCircleCheck,
  IconAlertCircle,
} from '@tabler/icons-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/toast';
import { authService } from '@/services/auth.service';
import { cn } from '@/lib/cn';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'enable' | 'change';
  onSuccess?: () => void;
}

export function ChangePasswordModal({
  isOpen,
  onClose,
  mode = 'change',
  onSuccess,
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isEnableMode = mode === 'enable';

  // Password Strength Calculation
  const hasMinLength = newPassword.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);
  const hasSpecial = /[^a-zA-Z0-9]/.test(newPassword);
  const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword;

  const strengthScore = [hasMinLength, hasLetter, hasNumber, hasSpecial].filter(Boolean).length;

  const getStrengthLabel = () => {
    if (!newPassword) return '';
    if (strengthScore <= 1) return 'Weak';
    if (strengthScore === 2) return 'Fair';
    if (strengthScore === 3) return 'Good';
    return 'Strong';
  };

  const getStrengthColor = () => {
    if (strengthScore <= 1) return 'bg-rose-500';
    if (strengthScore === 2) return 'bg-amber-500';
    if (strengthScore === 3) return 'bg-blue-500';
    return 'bg-emerald-600';
  };

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
    setIsLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEnableMode && !currentPassword.trim()) {
      toast.error('Validation Error', { description: 'Please enter your current password.' });
      return;
    }

    if (!newPassword) {
      toast.error('Validation Error', { description: 'Please enter a new password.' });
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Weak Password', { description: 'Password must be at least 8 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Mismatch', { description: 'New passwords do not match.' });
      return;
    }

    setIsLoading(true);

    try {
      await authService.setPassword(newPassword);

      toast.success(
        isEnableMode ? 'Password Login Enabled' : 'Password Updated',
        {
          description: isEnableMode
            ? 'Your new password has been saved to your account. You can now log in using password or Mobile OTP.'
            : 'Your account password has been changed successfully.',
        }
      );

      resetForm();
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(
        'Action Failed',
        { description: err?.message || 'Could not save password. Please try again.' }
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEnableMode ? 'Enable Account Password' : 'Change Password'}
      description={
        isEnableMode
          ? 'Set a secure password so you can sign in to your matrimonial account using your mobile/email and password alongside Mobile OTP.'
          : 'Ensure your matrimonial account remains secure with a strong password.'
      }
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {/* Current Password (only in change mode) */}
        {!isEnableMode && (
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
                aria-label={showCurrent ? "Hide current password" : "Show current password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#766B6F] hover:text-[#211B1E]"
              >
                {showCurrent ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        )}

        {/* New Password */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#766B6F] mb-1.5">
            {isEnableMode ? 'Create New Password' : 'New Password'}
          </label>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="w-full rounded-xl bg-[#FFF9F6] border border-[#E9DDE0] pl-3.5 pr-10 py-2.5 text-xs text-[#211B1E] outline-none focus:border-[#7A1835] focus:bg-white"
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              aria-label={showNew ? "Hide new password" : "Show new password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#766B6F] hover:text-[#211B1E]"
            >
              {showNew ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {newPassword.length > 0 && (
            <div className="mt-2 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#766B6F]">Password Strength:</span>
                <span className="font-bold text-[#211B1E]">{getStrengthLabel()}</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 h-1.5">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={cn(
                      'rounded-full transition-colors duration-300',
                      step <= strengthScore ? getStrengthColor() : 'bg-[#E9DDE0]'
                    )}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Confirm New Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#766B6F]">
              Confirm Password
            </label>
            {confirmPassword.length > 0 && (
              <span
                className={cn(
                  'text-[11px] font-semibold flex items-center gap-1',
                  passwordsMatch ? 'text-emerald-700' : 'text-rose-600'
                )}
              >
                {passwordsMatch ? (
                  <>
                    <IconCircleCheck className="h-3.5 w-3.5" /> Passwords match
                  </>
                ) : (
                  <>
                    <IconAlertCircle className="h-3.5 w-3.5" /> Does not match
                  </>
                )}
              </span>
            )}
          </div>
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your new password"
              className={cn(
                'w-full rounded-xl bg-[#FFF9F6] border pl-3.5 pr-10 py-2.5 text-xs text-[#211B1E] outline-none transition-colors',
                confirmPassword.length > 0 && !passwordsMatch
                  ? 'border-rose-300 focus:border-rose-500 bg-rose-50/20'
                  : 'border-[#E9DDE0] focus:border-[#7A1835] focus:bg-white'
              )}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#766B6F] hover:text-[#211B1E]"
            >
              {showConfirm ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Requirements Checklist */}
        <div className="rounded-2xl bg-[#FAF3EC] border border-[#EAD8C7] p-3 text-[11px] text-[#5C1027] space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <IconShieldCheck className="h-4 w-4 text-[#7A1835] shrink-0" />
            <span>Password Security Guidelines:</span>
          </div>
          <ul className="pl-5 list-disc space-y-0.5 text-[#766B6F]">
            <li className={cn(hasMinLength ? 'text-emerald-700 font-medium' : '')}>
              At least 8 characters
            </li>
            <li className={cn(hasLetter && hasNumber ? 'text-emerald-700 font-medium' : '')}>
              Include letters and numbers
            </li>
            <li className={cn(hasSpecial ? 'text-emerald-700 font-medium' : '')}>
              Special characters (!@#$%) recommended
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E9DDE0]">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isLoading}
            className="rounded-xl text-xs font-semibold text-[#766B6F]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="md"
            disabled={isLoading || !hasMinLength || (confirmPassword.length > 0 && !passwordsMatch)}
            className="rounded-xl bg-[#7A1835] hover:bg-[#5C1027] text-white text-xs font-bold px-6 shadow-sm active-press disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <IconLoader2 className="h-4 w-4 animate-spin mr-1.5" />
                <span>Saving...</span>
              </>
            ) : isEnableMode ? (
              'Enable & Save Password'
            ) : (
              'Update Password'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
