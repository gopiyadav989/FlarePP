import React, { useState } from 'react';
import { 
  CircleCheck, 
  CircleX, 
  PlayCircle,
  Check,
  ChevronsUpDown,
  XCircle
} from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

const VideoUploadWorkflow = () => {
  const [step, setStep] = useState(1);
  const [videoDetails, setVideoDetails] = useState({
    title: '',
    description: '',
    playlist: '',
    visibility: 'private',
    includedInPlaylist: false,
    tags: [],
    monetizationEnabled: false,
    videoFile: null,
    thumbnailFile: null,
    selectedEditor: null,
    tagInput: ''
  });
  const [editorOpen, setEditorOpen] = useState(false);
  const [visibilityOpen, setVisibilityOpen] = useState(false);
  const [playlistOpen, setPlaylistOpen] = useState(false);

  const [playlists] = useState([
    { id: '1', name: 'Tutorials', description: 'Learning guides', videoCount: 5 },
    { id: '2', name: 'Vlogs', description: 'Personal stories', videoCount: 3 },
    { id: '3', name: 'Reviews', description: 'Product and media reviews', videoCount: 7 }
  ]);

  const [editors] = useState([
    { id: '1', name: 'John Doe', speciality: 'Cutting', availability: true },
    { id: '2', name: 'Jane Smith', speciality: 'Color Grading', availability: false },
    { id: '3', name: 'Mike Johnson', speciality: 'Sound Design', availability: true }
  ]);

  const handleInputChange = (field, value) => {
    setVideoDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = () => {
    const tag = videoDetails.tagInput.trim();
    if (tag && !videoDetails.tags.includes(tag)) {
      setVideoDetails(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
        tagInput: ''
      }));
    }
  };

  const removeTag = (tagToRemove) => {
    setVideoDetails(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <Card className="w-full max-w-2xl relative bg-white">
            <CardHeader>
              <CardTitle className="flex items-center">
                <PlayCircle className="mr-2" /> Video Details
              </CardTitle>
              <CardDescription>Provide comprehensive information about your video</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Title</Label>
                  <Input 
                    value={videoDetails.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter engaging video title"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Visibility</Label>
                  <Popover open={visibilityOpen} onOpenChange={(open) => setVisibilityOpen(open)}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between mt-2"
                      >
                        {videoDetails.visibility}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandList>
                          <CommandItem
                            onSelect={() => {
                              handleInputChange('visibility', 'private');
                              setVisibilityOpen(false);
                            }}
                          >
                            <CircleX className="mr-2 text-red-500" /> Private
                          </CommandItem>
                          <CommandItem
                            onSelect={() => {
                              handleInputChange('visibility', 'public');
                              setVisibilityOpen(false);
                            }}
                          >
                            <CircleCheck className="mr-2 text-green-500" /> Public
                          </CommandItem>
                          <CommandItem
                            onSelect={() => {
                              handleInputChange('visibility', 'unlisted');
                              setVisibilityOpen(false);
                            }}
                          >
                            <CircleCheck className="mr-2 text-yellow-500" /> Unlisted
                          </CommandItem>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div>
                <Label>Description</Label>
                <Textarea 
                  value={videoDetails.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your video in detail"
                  className="mt-2 h-24"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Playlist</Label>
                  <Popover open={playlistOpen} onOpenChange={(open) => setPlaylistOpen(open)}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between mt-2"
                      >
                        {videoDetails.playlist || 'Select Playlist'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandList>
                          {playlists.map(playlist => (
                            <CommandItem
                              key={playlist.id}
                              onSelect={() => {
                                handleInputChange('playlist', playlist.name);
                                handleInputChange('includedInPlaylist', true);
                                setPlaylistOpen(false);
                              }}
                            >
                              {playlist.name} ({playlist.videoCount} videos)
                            </CommandItem>
                          ))}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>Editors</Label>
                  <Popover open={editorOpen} onOpenChange={(open) => setEditorOpen(open)}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={editorOpen}
                        className="w-full justify-between mt-2"
                      >
                        {videoDetails.selectedEditor
                          ? editors.find(
                              (editor) => editor.id === videoDetails.selectedEditor
                            )?.name
                          : "Select editor..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search editors..." />
                        <CommandList>
                          <CommandEmpty>No editors found.</CommandEmpty>
                          <CommandGroup>
                            {editors.map((editor) => (
                              <CommandItem
                                key={editor.id}
                                value={editor.id}
                                onSelect={() => {
                                  handleInputChange('selectedEditor', 
                                    editor.id === videoDetails.selectedEditor 
                                      ? null 
                                      : editor.id
                                  );
                                  if (editor.id !== videoDetails.selectedEditor) {
                                    setEditorOpen(false);
                                  }
                                }}
                                disabled={!editor.availability}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    videoDetails.selectedEditor === editor.id 
                                      ? "opacity-100" 
                                      : "opacity-0"
                                  )}
                                />
                                <div className="flex justify-between w-full">
                                  <span>{editor.name}</span>
                                  <span className="text-sm text-muted-foreground">{editor.speciality}</span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return <></>;
    }
  };

  return (
    <div className="py-6">
      <Progress value={(step / 3) * 100} className="mb-6" />
      {renderStep()}
    </div>
  );
};

export default VideoUploadWorkflow;
