import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, UserPlus, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export const EditorAssignmentModal = ({ 
  videoId, 
  open, 
  onClose 
}) => {
  const [editors, setEditors] = useState([]);
  const [selectedEditor, setSelectedEditor] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/videos/assign-editor', {
        method: 'POST',
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId,
          editorId: selectedEditor,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to assign editor');
      }

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Success",
          description: "Editor assigned successfully",
        });
        onClose();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to assign editor. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const filteredEditors = editors.filter(editor => 
    editor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    editor.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedEditorData = editors.find(editor => editor._id === selectedEditor);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Assign Editor to Video
          </DialogTitle>
          <DialogDescription>
            Select an editor from the list below to assign them to this video project.
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {selectedEditor && (
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedEditorData?.avatar} />
                      <AvatarFallback>
                        {getInitials(selectedEditorData?.name || '')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{selectedEditorData?.name}</h4>
                      <p className="text-sm text-muted-foreground">{selectedEditorData?.email}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Selected</Badge>
                </div>
              </Card>
            )}

            <div className="relative">
              <Input
                placeholder="Search editors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <ScrollArea className="h-[300px] rounded-md border">
              <div className="p-4 space-y-2">
                {filteredEditors.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No editors found matching your search.
                  </p>
                ) : (
                  filteredEditors.map((editor) => (
                    <div
                      key={editor._id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedEditor === editor._id
                          ? 'bg-primary/10 hover:bg-primary/15'
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => setSelectedEditor(editor._id)}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={editor.avatar} />
                          <AvatarFallback>
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
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        )}

        <DialogFooter className="flex space-x-2 justify-end sm:justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={loading || !selectedEditor}
            className="min-w-[100px]"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Assign Editor'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditorAssignmentModal;