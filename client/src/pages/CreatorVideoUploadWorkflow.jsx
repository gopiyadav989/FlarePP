import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Drawer, 
  DrawerClose, 
  DrawerContent, 
  DrawerDescription, 
  DrawerFooter, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerTrigger 
} from "@/components/ui/drawer";
import { Progress } from "@/components/ui/progress";
import { 
  FileVideo, 
  FileImage, 
  CircleCheck, 
  CircleX 
} from "lucide-react";

const VideoUploadWorkflow = () => {
  // State for multi-step form
  const [step, setStep] = useState(1);
  
  // Video details state
  const [videoDetails, setVideoDetails] = useState({
    title: '',
    description: '',
    playlist: '',
    visibility: 'private',
    includedInPlaylist: false,
    editors: [],
    selectedEditor: null,
    videoFile: null,
    thumbnailFile: null
  });

  // Playlists and Editors (mock data - would come from backend)
  const [playlists, setPlaylists] = useState([
    { id: '1', name: 'Tutorials' },
    { id: '2', name: 'Vlogs' },
    { id: '3', name: 'Reviews' }
  ]);

  const [editors, setEditors] = useState([
    { id: '1', name: 'John Doe', speciality: 'Cutting' },
    { id: '2', name: 'Jane Smith', speciality: 'Color Grading' },
    { id: '3', name: 'Mike Johnson', speciality: 'Sound Design' }
  ]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setVideoDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // File upload handlers
  const handleFileUpload = (type, file) => {
    setVideoDetails(prev => ({
      ...prev,
      [`${type}File`]: file
    }));
  };

  // Multi-step navigation
  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  // Render different steps
  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <Card className="w-full max-w-xl">
            <CardHeader>
              <CardTitle>Video Details</CardTitle>
              <CardDescription>Provide basic information about your video</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input 
                  value={videoDetails.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter video title"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea 
                  value={videoDetails.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your video"
                />
              </div>
              <div>
                <Label>Playlist</Label>
                <Select 
                  onValueChange={(value) => {
                    handleInputChange('playlist', value);
                    handleInputChange('includedInPlaylist', true);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a playlist" />
                  </SelectTrigger>
                  <SelectContent>
                    {playlists.map(playlist => (
                      <SelectItem key={playlist.id} value={playlist.id}>
                        {playlist.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  checked={videoDetails.includedInPlaylist}
                  onCheckedChange={(checked) => handleInputChange('includedInPlaylist', checked)}
                />
                <Label>Include in Playlist</Label>
              </div>
              <div>
                <Label>Visibility</Label>
                <Select 
                  value={videoDetails.visibility}
                  onValueChange={(value) => handleInputChange('visibility', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="unlisted">Unlisted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <div className="p-4 flex justify-end">
              <Button onClick={nextStep}>Next: Upload Files</Button>
            </div>
          </Card>
        );
      
      case 2:
        return (
          <Card className="w-full max-w-xl">
            <CardHeader>
              <CardTitle>Upload Files</CardTitle>
              <CardDescription>Select your video and thumbnail</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="flex items-center">
                  <FileVideo className="mr-2" /> Video File
                </Label>
                <div className="flex items-center space-x-2">
                  <Input 
                    type="file" 
                    accept="video/*"
                    onChange={(e) => handleFileUpload('video', e.target.files[0])}
                  />
                  {videoDetails.videoFile && (
                    <CircleCheck className="text-green-500" />
                  )}
                </div>
              </div>
              <div>
                <Label className="flex items-center">
                  <FileImage className="mr-2" /> Thumbnail
                </Label>
                <div className="flex items-center space-x-2">
                  <Input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleFileUpload('thumbnail', e.target.files[0])}
                  />
                  {videoDetails.thumbnailFile && (
                    <CircleCheck className="text-green-500" />
                  )}
                </div>
              </div>
              <Drawer>
                <DrawerTrigger asChild>
                  <Button variant="outline">Select Editor</Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>Choose an Editor</DrawerTitle>
                    <DrawerDescription>Select an editor for your video</DrawerDescription>
                  </DrawerHeader>
                  <div className="grid gap-4 p-4">
                    {editors.map(editor => (
                      <div 
                        key={editor.id} 
                        className="flex items-center justify-between p-2 border rounded hover:bg-accent"
                        onClick={() => handleInputChange('selectedEditor', editor)}
                      >
                        <div>
                          <div className="font-medium">{editor.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Speciality: {editor.speciality}
                          </div>
                        </div>
                        {videoDetails.selectedEditor?.id === editor.id && (
                          <CircleCheck className="text-green-500" />
                        )}
                      </div>
                    ))}
                  </div>
                  <DrawerFooter>
                    <DrawerClose>
                      <Button variant="outline">Cancel</Button>
                    </DrawerClose>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            </CardContent>
            <div className="p-4 flex justify-between">
              <Button variant="outline" onClick={prevStep}>Back</Button>
              <Button onClick={nextStep} disabled={!videoDetails.videoFile || !videoDetails.thumbnailFile}>
                Next: Review
              </Button>
            </div>
          </Card>
        );
      
      case 3:
        return (
          <Card className="w-full max-w-xl">
            <CardHeader>
              <CardTitle>Review Upload</CardTitle>
              <CardDescription>Confirm your video details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Title</Label>
                <p>{videoDetails.title}</p>
              </div>
              <div>
                <Label>Description</Label>
                <p>{videoDetails.description}</p>
              </div>
              <div>
                <Label>Playlist</Label>
                <p>
                  {videoDetails.includedInPlaylist 
                    ? playlists.find(p => p.id === videoDetails.playlist)?.name 
                    : 'Not included in any playlist'}
                </p>
              </div>
              <div>
                <Label>Visibility</Label>
                <p>{videoDetails.visibility}</p>
              </div>
              <div>
                <Label>Selected Editor</Label>
                <p>{videoDetails.selectedEditor?.name || 'No editor selected'}</p>
              </div>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Label>Video File</Label>
                  <p>{videoDetails.videoFile?.name}</p>
                </div>
                <div className="flex-1">
                  <Label>Thumbnail</Label>
                  <p>{videoDetails.thumbnailFile?.name}</p>
                </div>
              </div>
            </CardContent>
            <div className="p-4 flex justify-between">
              <Button variant="outline" onClick={prevStep}>Back</Button>
              <Button onClick={() => {
                // Implement upload logic here
                console.log('Uploading video:', videoDetails);
              }}>
                Upload Video
              </Button>
            </div>
          </Card>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-background p-4">
      {renderStep()}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
        <Progress value={(step / 3) * 100} className="w-1/2" />
      </div>
    </div>
  );
};

export default VideoUploadWorkflow;