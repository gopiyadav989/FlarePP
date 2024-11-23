import { useState } from 'react';

const FormPage = ({ setShowUploadForm }) => {
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!videoFile || !thumbnail) {
      alert('Both video file and thumbnail are required.');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('videofile', videoFile);
      formData.append('thumbnail', thumbnail);
      formData.append('title', title);
      formData.append('description', description);

      const response = await fetch("http://localhost:3000/api/videos//uploadVideo", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      console.log(formData);

      const result = await response.json();


      if (response.ok) {
        alert('Video uploaded successfully!');
        setShowUploadForm(false);
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('An error occurred while uploading the video. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-gray-800 p-6 rounded-lg ">
      <h2 className="text-xl font-bold mb-4">Upload Your Video</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 mt-2 bg-gray-700 text-white rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium">Description</label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 mt-2 bg-gray-700 text-white rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="videofile" className="block text-sm font-medium">Video File</label>
          <input
            type="file"
            id="videofile"
            name="videofile"
            onChange={(e) => setVideoFile(e.target.files[0])}
            className="w-full p-2 mt-2 bg-gray-700 text-white rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="thumbnail" className="block text-sm font-medium">Thumbnail</label>
          <input
            type="file"
            id="thumbnail"
            name="thumbnail"
            onChange={(e) => setThumbnail(e.target.files[0])}
            className="w-full p-2 mt-2 bg-gray-700 text-white rounded"
            required
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            {loading ? 'Uploading...' : 'Upload Video'}
          </button>
          <button
            type="button"
            onClick={() => setShowUploadForm(false)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormPage;
