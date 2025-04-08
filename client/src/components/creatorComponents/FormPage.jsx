import React, { useState, useRef } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileUp, 
  FileText, 
  ImageIcon, 
  Video, 
  X, 
  UploadCloud 
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

const FormPage = ({ isOpen, onClose }) => {
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const videoInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);

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
      
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "http://localhost:3000/api/videos/creator-upload-video", true);
      xhr.withCredentials = true;

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setUploadProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        setLoading(false);
        if (xhr.status === 200) {
          alert('Video uploaded successfully!');
          onClose();
        } else {
          const result = JSON.parse(xhr.responseText);
          alert(`Error: ${result.message}`);
        }
      };

      xhr.onerror = () => {
        setLoading(false);
        alert('An error occurred while uploading the video. Please try again.');
      };

      xhr.send(formData);
    } catch (error) {
      console.error('Error uploading video:', error);
      setLoading(false);
      alert('An error occurred while uploading the video. Please try again.');
    }
  };

  const handleFileChange = (type, e) => {
    const file = e.target.files[0];
    if (type === 'video') {
      setVideoFile(file);
    } else if (type === 'thumbnail') {
      setThumbnail(file);
    }
  };

  const clearFile = (type) => {
    if (type === 'video') {
      setVideoFile(null);
      if (videoInputRef.current) videoInputRef.current.value = '';
    } else if (type === 'thumbnail') {
      setThumbnail(null);
      if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
    }
  };

  const FileSelector = ({ 
    type, 
    icon: Icon, 
    file, 
    label, 
    inputRef 
  }) => (
    <div className="space-y-2">
      <Label className="flex items-center text-gray-700 dark:text-gray-300">
        <Icon className="mr-2 h-4 w-4" />
        {label}
      </Label>
      <div className="relative">
        <input
          type="file"
          ref={inputRef}
          accept={type === 'video' ? 'video/*' : 'image/*'}
          onChange={(e) => handleFileChange(type, e)}
          className="hidden"
          id={`${type}-upload`}
        />
        <label 
          htmlFor={`${type}-upload`} 
          className="group cursor-pointer"
        >
          <div className={`
            flex items-center justify-between 
            border-2 border-dashed 
            ${file 
              ? 'border-green-500 bg-green-50 dark:bg-green-900/30' 
              : 'border-gray-300 hover:border-blue-500 dark:border-gray-700'}
            p-3 rounded-lg transition-all
          `}>
            <span className="flex-grow truncate text-sm text-gray-600 dark:text-gray-400">
              {file 
                ? `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)` 
                : `Select ${label}`}
            </span>
            {file ? (
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="ml-2 text-red-500 hover:text-red-700"
                onClick={(e) => {
                  e.preventDefault();
                  clearFile(type);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            ) : (
              <UploadCloud className="h-5 w-5 text-gray-400 group-hover:text-blue-500" />
            )}
          </div>
        </label>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-6">
        <DialogHeader className="text-center">
          <DialogTitle className="flex items-center justify-center text-2xl font-bold text-gray-800 dark:text-gray-100">
            <FileUp className="mr-3 h-8 w-8 text-blue-600" />
            Upload Your Video
          </DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-gray-400">
            Share your content with the world
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center text-gray-700 dark:text-gray-300">
              <FileText className="mr-2 h-4 w-4" />
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter an engaging title for your video"
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell viewers about your video. What can they expect?"
              required
              rows={4}
              className="w-full"
            />
          </div>

          <FileSelector 
            type="video" 
            icon={Video} 
            file={videoFile} 
            label="Video File"
            inputRef={videoInputRef}
          />

          <FileSelector 
            type="thumbnail" 
            icon={ImageIcon} 
            file={thumbnail} 
            label="Thumbnail"
            inputRef={thumbnailInputRef}
          />

          {loading && (
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300">
                Upload Progress
              </Label>
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                {`${Math.round(uploadProgress)}% Uploaded`}
              </p>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 transition-colors"
            disabled={loading}
          >
            <UploadCloud className="mr-2 h-5 w-5" />
            {loading ? 'Uploading...' : 'Upload Video'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FormPage;