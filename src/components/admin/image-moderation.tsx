'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  IconPhoto,
  IconCheck,
  IconX,
  IconLoader2,
  IconRefresh,
  IconSearch,
  IconEye,
  IconShieldCheck,
  IconTrash,
  IconChevronLeft,
  IconChevronRight,
  IconFilter,
} from '@tabler/icons-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { adminService, type PhotoModerationItem } from '@/services/admin.service';
import { toast } from '@/lib/toast';

export function ImageModeration() {
  const [photos, setPhotos] = useState<PhotoModerationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'unverified' | 'verified' | 'all'>('unverified');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [unverifiedCount, setUnverifiedCount] = useState(0);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(new Set());
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [batchLoading, setBatchLoading] = useState(false);

  // Lightbox preview modal
  const [previewPhoto, setPreviewPhoto] = useState<PhotoModerationItem | null>(null);

  // Reject single photo modal
  const [rejectConfirmPhoto, setRejectConfirmPhoto] = useState<PhotoModerationItem | null>(null);

  const fetchPhotos = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      const res = await adminService.getPhotosForModeration(
        {
          status: statusFilter,
          page,
          limit: 24,
          search: search || undefined,
        },
        signal
      );
      setPhotos(res.data || []);
      setTotalPages(res.meta?.totalPages || 1);
      setTotalCount(res.meta?.total || 0);
      setUnverifiedCount(res.meta?.unverifiedCount || 0);
      setSelectedPhotoIds(new Set());
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      toast.error('Failed to load photos', err?.message || 'Could not fetch image moderation queue.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page, search]);

  useEffect(() => {
    const controller = new AbortController();
    fetchPhotos(controller.signal);
    return () => controller.abort();
  }, [fetchPhotos]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const handleSingleVerify = async (photoId: string, status: 'approved' | 'rejected') => {
    try {
      setActionLoadingId(photoId);
      await adminService.verifyPhoto(photoId, status);
      toast.success(
        status === 'approved' ? 'Photo Approved' : 'Photo Rejected',
        status === 'approved' ? 'Photo has been verified successfully.' : 'Photo was rejected and removed.'
      );
      if (previewPhoto?.id === photoId) setPreviewPhoto(null);
      if (rejectConfirmPhoto?.id === photoId) setRejectConfirmPhoto(null);
      fetchPhotos();
    } catch (err: any) {
      toast.error('Moderation Failed', err?.message || 'Could not update photo verification status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleBatchVerify = async (status: 'approved' | 'rejected') => {
    if (selectedPhotoIds.size === 0) return;
    try {
      setBatchLoading(true);
      const res = await adminService.batchVerifyPhotos(Array.from(selectedPhotoIds), status);
      toast.success(
        status === 'approved' ? 'Batch Approved' : 'Batch Rejected',
        res.message || `${res.count} photo(s) processed.`
      );
      setSelectedPhotoIds(new Set());
      fetchPhotos();
    } catch (err: any) {
      toast.error('Batch Action Failed', err?.message || 'Failed to process selected photos.');
    } finally {
      setBatchLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedPhotoIds.size === photos.length) {
      setSelectedPhotoIds(new Set());
    } else {
      setSelectedPhotoIds(new Set(photos.map((p) => p.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    const next = new Set(selectedPhotoIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedPhotoIds(next);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tracking-tight">
              Image Moderation
            </h1>
            {unverifiedCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                {unverifiedCount} Unverified
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
            Review uploaded profile and gallery photos. Approve appropriate images or reject violations.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => fetchPhotos()}
          disabled={loading}
          className="self-start sm:self-auto cursor-pointer"
        >
          <IconRefresh className={`mr-1.5 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </header>

      {/* Control Bar: Filter Tabs, Search & Batch Actions */}
      <Card className="p-4 bg-white border-[var(--border)] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl overflow-x-auto">
            <button
              onClick={() => {
                setStatusFilter('unverified');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'unverified'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Needs Moderation
              {unverifiedCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-bold">
                  {unverifiedCount}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                setStatusFilter('verified');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'verified'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Verified Photos
            </button>
            <button
              onClick={() => {
                setStatusFilter('all');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'all'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All Photos ({totalCount})
            </button>
          </div>

          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
              <input
                type="text"
                placeholder="Search member name, ID, email…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[var(--surface-muted)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--primary)] text-[var(--foreground)]"
              />
            </div>
            <Button type="submit" size="sm" variant="secondary" className="text-xs">
              Search
            </Button>
          </form>
        </div>

        {/* Batch Action Toolbar */}
        {photos.length > 0 && (
          <div className="mt-3 pt-3 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-700">
                <input
                  type="checkbox"
                  checked={photos.length > 0 && selectedPhotoIds.size === photos.length}
                  onChange={toggleSelectAll}
                  className="rounded text-[var(--primary)] focus:ring-[var(--primary)] h-4 w-4"
                />
                <span>Select All ({photos.length})</span>
              </label>
              {selectedPhotoIds.size > 0 && (
                <span className="font-semibold text-[var(--primary)]">
                  • {selectedPhotoIds.size} selected
                </span>
              )}
            </div>

            {selectedPhotoIds.size > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => handleBatchVerify('approved')}
                  disabled={batchLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 cursor-pointer"
                >
                  <IconCheck className="mr-1 h-3.5 w-3.5" />
                  Approve Selected ({selectedPhotoIds.size})
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleBatchVerify('rejected')}
                  disabled={batchLoading}
                  className="text-rose-700 hover:bg-rose-50 border-rose-200 text-xs h-8 cursor-pointer"
                >
                  <IconTrash className="mr-1 h-3.5 w-3.5" />
                  Reject Selected ({selectedPhotoIds.size})
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Grid of Photos */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-2xl bg-[var(--surface-muted)] animate-pulse border border-[var(--border)]"
            />
          ))}
        </div>
      ) : photos.length === 0 ? (
        <Card className="p-12 text-center bg-white border-[var(--border)]">
          <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 grid place-items-center mx-auto mb-3">
            <IconShieldCheck className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-[var(--foreground)]">Queue is Clean!</h3>
          <p className="text-xs text-[var(--muted)] mt-1 max-w-sm mx-auto">
            {statusFilter === 'unverified'
              ? 'There are no pending unverified photos waiting for moderation right now.'
              : 'No photos found matching your current filter criteria.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => {
            const isSelected = selectedPhotoIds.has(photo.id);
            const isBusy = actionLoadingId === photo.id || batchLoading;

            return (
              <Card
                key={photo.id}
                className={`overflow-hidden bg-white border transition-all hover:shadow-md flex flex-col ${
                  isSelected ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]/20' : 'border-[var(--border)]'
                }`}
              >
                {/* Photo Container */}
                <div className="relative aspect-square w-full bg-stone-900 group overflow-hidden">
                  <img
                    src={photo.url}
                    alt={photo.user?.firstName || 'User Photo'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* Top Overlay Badges */}
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1 pointer-events-none">
                    <div className="pointer-events-auto">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(photo.id)}
                        className="rounded text-[var(--primary)] focus:ring-[var(--primary)] h-4 w-4 bg-white/90 shadow-sm cursor-pointer"
                        aria-label="Select photo"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      {photo.isPrimary && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#80132E] text-white shadow-xs">
                          Primary
                        </span>
                      )}
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold shadow-xs ${
                          photo.isVerified
                            ? 'bg-emerald-500 text-white'
                            : 'bg-amber-500 text-white'
                        }`}
                      >
                        {photo.isVerified ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Hover Quick Zoom Button */}
                  <button
                    onClick={() => setPreviewPhoto(photo)}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                    title="Click to preview full image"
                  >
                    <div className="h-10 w-10 rounded-full bg-black/60 backdrop-blur-xs flex items-center justify-center text-white hover:scale-110 transition-transform">
                      <IconEye className="h-5 w-5" />
                    </div>
                  </button>
                </div>

                {/* Details Footer */}
                <div className="p-3.5 flex-1 flex flex-col justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-[var(--foreground)] truncate">
                        {photo.user?.firstName || 'Member'} {photo.user?.lastName || ''}
                      </span>
                      <span className="text-[10px] font-mono text-[var(--muted)] shrink-0">
                        {photo.user?.profileId || 'N/A'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--muted)] truncate mt-0.5">
                      {photo.user?.email || photo.user?.phone || 'No contact info'}
                    </p>
                    <p className="text-[10px] text-stone-400 mt-1">
                      Uploaded {new Date(photo.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 pt-2 border-t border-[var(--border)]">
                    {!photo.isVerified ? (
                      <Button
                        size="sm"
                        disabled={isBusy}
                        onClick={() => handleSingleVerify(photo.id, 'approved')}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 cursor-pointer font-semibold"
                      >
                        {actionLoadingId === photo.id ? (
                          <IconLoader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <>
                            <IconCheck className="mr-1 h-3.5 w-3.5" /> Approve
                          </>
                        )}
                      </Button>
                    ) : (
                      <span className="flex-1 text-center text-emerald-600 font-semibold text-[11px] py-1 bg-emerald-50 rounded-lg">
                        ✓ Verified
                      </span>
                    )}

                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={isBusy}
                      onClick={() => setRejectConfirmPhoto(photo)}
                      className="px-2.5 text-rose-700 hover:bg-rose-50 border-rose-200 text-xs h-8 cursor-pointer"
                      title="Reject and delete photo"
                    >
                      <IconTrash className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 pt-4 border-t border-[var(--border)] text-xs">
          <span className="text-[var(--muted)]">
            Page <strong className="text-[var(--foreground)]">{page}</strong> of{' '}
            <strong className="text-[var(--foreground)]">{totalPages}</strong> ({totalCount} photos)
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="cursor-pointer"
            >
              <IconChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
              className="cursor-pointer"
            >
              Next <IconChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Lightbox / Zoom Preview Modal */}
      {previewPhoto && (
        <Modal
          isOpen={true}
          onClose={() => setPreviewPhoto(null)}
          title={`Photo Inspection: ${previewPhoto.user?.firstName || 'Member'} (${previewPhoto.user?.profileId || 'N/A'})`}
        >
          <div className="space-y-4">
            <div className="relative max-h-[60vh] overflow-hidden rounded-xl bg-stone-950 flex items-center justify-center p-2">
              <img
                src={previewPhoto.url}
                alt="Enlarged user photo"
                className="max-h-[56vh] w-auto object-contain rounded-lg"
              />
            </div>

            <div className="bg-[var(--surface-muted)] p-3 rounded-xl flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-[var(--foreground)]">
                  {previewPhoto.user?.firstName} {previewPhoto.user?.lastName}
                </p>
                <p className="text-[var(--muted)]">{previewPhoto.user?.email || previewPhoto.user?.phone}</p>
              </div>
              <div className="flex items-center gap-2">
                {previewPhoto.isPrimary && <Badge tone="default">Primary Photo</Badge>}
                <Badge tone={previewPhoto.isVerified ? 'success' : 'champagne'}>
                  {previewPhoto.isVerified ? 'Verified' : 'Pending Verification'}
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setPreviewPhoto(null)}>
                Close Preview
              </Button>
              {!previewPhoto.isVerified && (
                <Button
                  onClick={() => handleSingleVerify(previewPhoto.id, 'approved')}
                  disabled={actionLoadingId === previewPhoto.id}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <IconCheck className="mr-1.5 h-4 w-4" /> Approve Photo
                </Button>
              )}
              <Button
                variant="secondary"
                onClick={() => {
                  const p = previewPhoto;
                  setPreviewPhoto(null);
                  setRejectConfirmPhoto(p);
                }}
                className="text-rose-700 hover:bg-rose-50 border-rose-200"
              >
                <IconTrash className="mr-1.5 h-4 w-4" /> Reject Photo
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reject Confirmation Dialog */}
      {rejectConfirmPhoto && (
        <Modal
          isOpen={true}
          onClose={() => setRejectConfirmPhoto(null)}
          title="Confirm Photo Rejection"
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <p className="text-stone-700">
              Are you sure you want to reject and permanently delete this photo uploaded by{' '}
              <strong>{rejectConfirmPhoto.user?.firstName || 'this member'}</strong>?
            </p>
            <p className="text-rose-600 text-xs">
              This action will remove the photo from cloud storage and remove it from the user&apos;s profile.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                disabled={actionLoadingId === rejectConfirmPhoto.id}
                onClick={() => setRejectConfirmPhoto(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleSingleVerify(rejectConfirmPhoto.id, 'rejected')}
                disabled={actionLoadingId === rejectConfirmPhoto.id}
                className="bg-rose-600 hover:bg-rose-700 text-white font-semibold"
              >
                {actionLoadingId === rejectConfirmPhoto.id ? (
                  <IconLoader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Yes, Reject & Delete'
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
