
export const uploadVideoToYouTube = async (videoId, googleToken, onProgress) => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/videos/creator-upload-to-youtube`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoId,
          googleToken,
        }),
        // Add progress tracking if supported by backend
        onProgress: (event) => {
          if (onProgress) {
            const progress = event.loaded / event.total * 100;
            onProgress(Math.round(progress));
          }
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload to YouTube');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("YouTube Upload Error:", error);
    throw error;
  }
};