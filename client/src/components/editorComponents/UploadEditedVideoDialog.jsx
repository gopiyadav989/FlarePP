import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Edit,
    Upload,
    FileVideo,
    CheckCircle,
    XCircle
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import axios from 'axios';

const UploadEditedVideoDialog = ({ videoId, onVideoUpload }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Validate file type and size
            const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
            const maxSize = 500 * 1024 * 1024; // 500 MB

            if (!allowedTypes.includes(file.type)) {
                toast({
                    title: "Invalid File Type",
                    description: "Please upload a valid video file (MP4, AVI, MOV)",
                    variant: "destructive"
                });
                return;
            }

            if (file.size > maxSize) {
                toast({
                    title: "File Too Large",
                    description: "Video file must be less than 500 MB",
                    variant: "destructive"
                });
                return;
            }

            setSelectedFile(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            toast({
                title: "No File Selected",
                description: "Please select a video file to upload",
                variant: "destructive"
            });
            return;
        }

        const formData = new FormData();
        formData.append('editedVideo', selectedFile);

        try {
            setUploadStatus('uploading');
            setUploadProgress(0);

            const response = await axios.post(
                `http://localhost:3000/api/editor/upload-edited-video/${videoId}`,
                formData,
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    onUploadProgress: (progressEvent) => {
                        const percentComplete = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setUploadProgress(percentComplete);
                    }
                }
            );

            setUploadStatus('success');
            toast({
                title: "Upload Successful",
                description: "Your edited video has been uploaded",
                variant: "default"
            });

            // Call parent component's upload handler
            onVideoUpload(response.data.video);

        } catch (error) {
            console.error('Upload error:', error);
            setUploadStatus('error');
            toast({
                title: "Upload Error",
                description: error.response?.data?.message || "An unexpected error occurred",
                variant: "destructive"
            });
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="default" className="w-full">
                    <Edit className="mr-2 h-4 w-4" /> Upload Edited Video
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Upload Edited Video</DialogTitle>
                    <DialogDescription>
                        Upload your edited version of the video
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="videoFile" className="text-right">
                            Video File
                        </Label>
                        <div className="col-span-3 flex items-center space-x-2">
                            <Input
                                id="videoFile"
                                type="file"
                                accept="video/mp4,video/quicktime,video/x-msvideo"
                                className="w-full"
                                onChange={handleFileChange}
                            />
                            {selectedFile && (
                                <FileVideo className="text-blue-500 w-6 h-6" />
                            )}
                        </div>
                    </div>

                    {selectedFile && (
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                                Selected: {selectedFile.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                        </div>
                    )}

                    {uploadStatus === 'uploading' && (
                        <div className="space-y-2">
                            <Progress value={uploadProgress} className="w-full" />
                            <p className="text-sm text-muted-foreground text-center">
                                Uploading... {uploadProgress}%
                            </p>
                        </div>
                    )}

                    {uploadStatus === 'success' && (
                        <div className="flex items-center justify-center text-green-500 space-x-2">
                            <CheckCircle className="w-6 h-6" />
                            <span>Upload Complete</span>
                        </div>
                    )}

                    {uploadStatus === 'error' && (
                        <div className="flex items-center justify-center text-red-500 space-x-2">
                            <XCircle className="w-6 h-6" />
                            <span>Upload Failed</span>
                        </div>
                    )}
                </div>

                <div className="flex justify-end space-x-2">
                    <Button
                        variant="outline"
                        disabled={uploadStatus === 'uploading'}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUpload}
                        disabled={!selectedFile || uploadStatus === 'uploading' || uploadStatus === 'success'}
                    >
                        <Upload className="mr-2 h-4 w-4" /> Upload
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default UploadEditedVideoDialog;