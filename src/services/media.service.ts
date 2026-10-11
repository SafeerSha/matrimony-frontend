import { apiFetch } from "@/lib/http/api-client";

export interface MediaUploadResponse {
  id: string;
  url: string;
  isPrimary?: boolean;
}

export const mediaService = {
  /** Upload a single photo */
  uploadPhoto: (file: File) => {
    const formData = new FormData();
    formData.append("photo", file);

    return apiFetch<MediaUploadResponse>("/media/upload", {
      method: "POST",
      body: formData,
    });
  },

  /** Upload multiple photos in one batch */
  uploadMultiplePhotos: (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("photos", file);
    });

    return apiFetch<MediaUploadResponse[]>("/media/upload-multiple", {
      method: "POST",
      body: formData,
    });
  },

  /** Set photo as primary display picture */
  setPrimaryPhoto: async (photoId: string) => {
    try {
      return await apiFetch<MediaUploadResponse>(`/media/${photoId}/primary`, {
        method: "PUT",
      });
    } catch {
      // Fallback route supported by profiles controller
      return await apiFetch<MediaUploadResponse>(`/profiles/me/photos/${photoId}/primary`, {
        method: "PUT",
      });
    }
  },

  /** Delete a photo with primary fallback support */
  deletePhoto: (photoId: string) => {
    return apiFetch<{ success: boolean; message?: string }>(`/media/${photoId}`, {
      method: "DELETE",
    });
  },
};
