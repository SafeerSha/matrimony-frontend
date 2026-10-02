import { apiFetch } from "@/lib/http/api-client";

export const mediaService = {
  uploadPhoto: (file: File) => {
    const formData = new FormData();
    formData.append("photo", file);

    // Note: apiFetch uses JSON by default, so we might need a custom fetch 
    // or to omit the Content-Type header so the browser sets it with the boundary for FormData.
    const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
    
    return fetch(`${API_URL}/media/upload`, {
      method: "POST",
      body: formData,
      credentials: "include", // Ensure session cookies are sent
    }).then(res => {
      if (!res.ok) throw new Error("Upload failed");
      return res.json();
    });
  },

  deletePhoto: (photoId: string) => {
    return apiFetch(`/media/${photoId}`, {
      method: "DELETE",
    });
  },
};
