import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, UserPlus, X, Search, CheckCircle2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { HoverBorderGradient } from '@/components/ui/hover-border-gradient';

export const EditorAssignmentModal = ({ 
  videoId, 
  open, 
  onClose 
}) => {
  const [editors, setEditors] = useState([]);
  const [selectedEditor, setSelectedEditor] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [assigningEditor, setAssigningEditor] = useState(false);

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
      setAssigningEditor(true);
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
      setAssigningEditor(false);
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
      <DialogContent className="sm:max-w-lg w-full max-h-[90vh] bg-black/90 backdrop-blur-xl border border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="bg-blue-500/20 p-2 rounded-full">
              <UserPlus className="h-5 w-5 text-blue-400" />
            </div>
            Assign Editor to Video
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Select an editor from the list below to assign them to this video project.
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-purple-500 border-l-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-blue-400 animate-pulse" />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {selectedEditor && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12 ring-2 ring-blue-500/50">
                          <AvatarImage src={selectedEditorData?.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-700 text-white">
                            {getInitials(selectedEditorData?.name || '')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-0.5">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-100">{selectedEditorData?.name}</h4>
                        <p className="text-sm text-black-200">{selectedEditorData?.email}</p>
                      </div>
                    </div>
                    <Badge className="bg-blue-500/20 text-gray-200 border border-blue-500/30">Selected</Badge>
                  </div>
                </Card>
              </motion.div>
            )}

            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search className="h-4 w-4" />
              </div>
              <Input
                placeholder="Search editors by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 bg-black/40 border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20 text-white placeholder:text-gray-500"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-white/10 text-gray-400"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <ScrollArea className="h-[300px] rounded-md border border-white/10 bg-black/20 backdrop-blur-sm">
              <div className="p-2 space-y-1">
                {filteredEditors.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <Search className="h-12 w-12 mb-3 opacity-50" />
                    <p className="text-center font-medium">
                      No editors found matching your search.
                    </p>
                    <p className="text-sm">Try adjusting your search query.</p>
                  </div>
                ) : (
                  filteredEditors.map((editor, index) => (
                    <motion.div
                      key={editor._id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        selectedEditor === editor._id
                          ? 'bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/30'
                          : 'hover:bg-white/5 border border-transparent'
                      }`}
                      onClick={() => setSelectedEditor(editor._id)}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className={`h-10 w-10 ${selectedEditor === editor._id ? 'ring-2 ring-blue-500' : ''}`}>
                          <AvatarImage src={editor.avatar} />
                          <AvatarFallback className={`${
                            selectedEditor === editor._id 
                              ? 'bg-gradient-to-br from-blue-600 to-purple-700' 
                              : 'bg-gray-700'
                          } text-white`}>
                            {getInitials(editor.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium text-white">{editor.name}</span>
                          <span className="text-sm text-gray-400">
                            {editor.email}
                          </span>
                        </div>
                        {selectedEditor === editor._id && (
                          <div className="ml-auto">
                            <CheckCircle2 className="h-5 w-5 text-blue-400" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        )}

        <DialogFooter className="flex space-x-2 justify-end pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading || assigningEditor}
            className="border-white/10 text-black hover:bg-white/25"
          >
            Cancel
          </Button>
          <HoverBorderGradient
            containerClassName={`rounded-md ${!selectedEditor || loading || assigningEditor ? 'opacity-50' : ''}`}
            className="px-4 py-2 text-white font-medium cursor-pointer"
            gradient="linear-gradient(90deg, rgba(59,130,246,0.8) 0%, rgba(147,51,234,0.8) 100%)"
            as={Button}
            onClick={handleAssign}
            disabled={loading || assigningEditor || !selectedEditor}
          >
            {assigningEditor ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Assigning...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Assign Editor
              </>
            )}
          </HoverBorderGradient>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditorAssignmentModal;