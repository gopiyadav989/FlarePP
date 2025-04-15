/**
 * Video service for handling API calls related to videos
 */

const API_URL = 'http://localhost:3000/api/videos';

/**
 * Get videos for the creator dashboard
 * @returns {Promise} The response from the API
 */
export const getCreatorVideos = async () => {
  try {
    const response = await fetch(`${API_URL}/creator-get-videos`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch videos');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }
};

/**
 * Get a single video by ID
 * @param {string} videoId The ID of the video to fetch
 * @returns {Promise} The response from the API
 */
export const getVideoById = async (videoId) => {
  try {
    const response = await fetch(`${API_URL}/get-video/${videoId}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch video');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching video by ID:', error);
    throw error;
  }
};

/**
 * Upload a video
 * @param {FormData} formData The form data containing the video file and metadata
 * @returns {Promise} The response from the API
 */
export const uploadVideo = async (formData) => {
  try {
    const response = await fetch(`${API_URL}/creator-upload-video`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload video');
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading video:', error);
    throw error;
  }
};

/**
 * Search videos
 * @param {string} query The search query
 * @returns {Promise} The response from the API
 */
export const searchVideos = async (query) => {
  try {
    const response = await fetch(`${API_URL}/creator-search-videos?query=${query}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to search videos');
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching videos:', error);
    throw error;
  }
};

/**
 * Assign an editor to a video
 * @param {Object} data The data containing videoId and editorId
 * @returns {Promise} The response from the API
 */
export const assignEditor = async (data) => {
  try {
    const response = await fetch(`${API_URL}/assign-editor`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to assign editor');
    }

    return await response.json();
  } catch (error) {
    console.error('Error assigning editor:', error);
    throw error;
  }
};

/**
 * Get all editors
 * @returns {Promise} The response from the API
 */
export const getAllEditors = async () => {
  try {
    const response = await fetch(`${API_URL}/getEditors`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch editors');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching editors:', error);
    throw error;
  }
}; 