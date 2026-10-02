import { apiFetch } from "@/lib/http/api-client";

export const mediaService = {
  uploadPhoto: (file: File) => {
    const formData = new FormData();
    formData.append("photo", file);

    return apiFetch<{ url: string; id: string }>("/media/upload", {
      method: "POST",
      body: formData,
    });
  },

  deletePhoto: (photoId: string) => {
    return apiFetch(`/media/${photoId}`, {
      method: "DELETE",
    });
  },
};
