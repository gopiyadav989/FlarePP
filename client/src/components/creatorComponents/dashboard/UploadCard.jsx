import React from 'react';
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { Upload } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const UploadCard = () => {
  const navigate = useNavigate();

  // Handle file upload
  const handleUploadClick = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'video/*';
    fileInput.onchange = (e) => {
      if (e.target.files && e.target.files[0]) {
        const videoFile = e.target.files[0];
        
        // Create a FormData object to send to the backend
        const formData = new FormData();
        formData.append('videofile', videoFile);
        
        // You could directly upload here or navigate to an upload page
        console.log('Selected file:', videoFile.name);
        navigate('/creator-dashboard/upload', { 
          state: { 
            selectedFile: videoFile.name,
            fileSize: (videoFile.size / (1024 * 1024)).toFixed(2) // Size in MB
          } 
        });
      }
    };
    fileInput.click();
  };

  return (
    <Card className="bg-gradient-to-br from-blue-900/40 via-indigo-900/40 to-purple-900/40 border border-white/10">
      <CardHeader>
        <CardTitle>Quick Upload</CardTitle>
        <CardDescription>Share your latest creation</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-6">
        <div className="bg-blue-500/20 p-6 rounded-full mb-4">
          <Upload className="h-8 w-8 text-blue-400" />
        </div>
        <p className="text-center text-sm text-gray-400 mb-4">
          Drag and drop or click to upload your video
        </p>
        <HoverBorderGradient
          containerClassName="w-full rounded-full"
          className="w-full group relative h-11 text-white font-medium rounded-full"
          gradient="linear-gradient(90deg, rgba(59,130,246,0.8) 0%, rgba(147,51,234,0.8) 100%)"
          as="button"
          onClick={handleUploadClick}
        >
          <span className="z-10 relative flex items-center justify-center">
            Upload Now <Upload className="ml-2 h-4 w-4" />
          </span>
        </HoverBorderGradient>
      </CardContent>
    </Card>
  );
};

export default UploadCard; 