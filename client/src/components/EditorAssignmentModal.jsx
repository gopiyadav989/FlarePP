import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

const EditorAssignmentModal = ({ 
  videoId, 
  open, 
  onClose, 
  onAssign 
}) => {
  const [editors, setEditors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEditor, setSelectedEditor] = useState('');
  const [openCombobox, setOpenCombobox] = useState(false);

  useEffect(() => {
    const fetchEditors = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/videos/getEditors');
        if (!response.ok) {
          throw new Error('Failed to fetch editors');
        }
        const data = await response.json();
        setEditors(data.editors);
        setLoading(false);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to fetch editors. Please try again.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    if (open) {
      fetchEditors();
    }
  }, [open]);

  const handleAssign = async () => {
    if (!selectedEditor) {
      toast({
        title: "Error",
        description: "Please select an editor first",
        variant: "destructive",
      });
      return;
    }

    try {
      await onAssign(videoId, selectedEditor);
      toast({
        title: "Success",
        description: "Editor assigned successfully",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign editor. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const getSelectedEditor = () => {
    return editors.find(editor => editor._id === selectedEditor);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-slate-50">
        <DialogHeader>
          <DialogTitle>Assign Editor</DialogTitle>
          <DialogDescription>
            Select an editor to assign to this video project.
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
          </div>
        ) : (
          <div className="py-4">
            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCombobox}
                  className="w-full justify-between"
                >
                  {selectedEditor ? (
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={getSelectedEditor()?.avatar} />
                        <AvatarFallback className="bg-slate-200 text-slate-700">
                          {getInitials(getSelectedEditor()?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{getSelectedEditor()?.name}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Select an editor...</span>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search editors..." />
                  <CommandList>
                    <CommandEmpty>No editors found.</CommandEmpty>
                    <CommandGroup>
                      <ScrollArea className="h-72">
                        {editors.map((editor) => (
                          <CommandItem
                            key={editor._id}
                            value={editor.name}
                            onSelect={() => {
                              setSelectedEditor(editor._id === selectedEditor ? "" : editor._id);
                              setOpenCombobox(false);
                            }}
                          >
                            <div className="flex items-center space-x-3 flex-1">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={editor.avatar} />
                                <AvatarFallback className="bg-slate-200 text-slate-700">
                                  {getInitials(editor.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="font-medium">{editor.name}</span>
                                <span className="text-sm text-muted-foreground">
                                  {editor.email}
                                </span>
                              </div>
                            </div>
                            <Check
                              className={cn(
                                "ml-auto h-4 w-4",
                                selectedEditor === editor._id ? "opacity-100" : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </ScrollArea>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        )}

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={loading || !selectedEditor}
          >
            Assign Editor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditorAssignmentModal;