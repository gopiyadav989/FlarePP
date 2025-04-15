import React from 'react';
import { User, Camera, BadgeCheck, FileVideo, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { SparklesCore } from "@/components/ui/sparkles";

const ProfileHeader = ({ user, role, handleFileChange }) => {
  return (
    <div className="relative">
      {/* Banner */}
      <div className="h-48 bg-gradient-to-r from-blue-900/40 to-purple-900/40 relative overflow-hidden">
        <div className="absolute inset-0">
          <SparklesCore
            id="sparkles-banner"
            background="transparent"
            minSize={0.6}
            maxSize={1.4}
            particleDensity={20}
            className="w-full h-full"
            particleColor="#8b5cf6"
          />
        </div>
      </div>
      
      {/* Profile Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-24">
        <div className="flex flex-col md:flex-row items-start md:items-end">
          {/* Avatar */}
          <div className="relative flex-shrink-0 mb-4 md:mb-0 md:mr-6">
            <Avatar className="w-36 h-36 border-4 border-zinc-950 shadow-lg">
              <AvatarImage src={user.avatarUrl || ''} />
              <AvatarFallback className="bg-zinc-800 text-2xl">
                {user.name ? user.name.charAt(0).toUpperCase() : <User className="h-16 w-16 text-zinc-500" />}
              </AvatarFallback>
            </Avatar>
            
            <input 
              type="file" 
              id="avatar-upload" 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange}
            />
            
            <label htmlFor="avatar-upload">
              <Button 
                size="icon" 
                className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 shadow-md border border-zinc-800"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </label>
          </div>
          
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold">{user.name || 'User'}</h1>
                  <BadgeCheck className="h-6 w-6 text-blue-500" />
                </div>
                <div className="flex items-center mt-1">
                  <Badge variant="outline" className="mr-2 bg-zinc-900/60">
                    {role === 'creator' ? (
                      <div className="flex items-center gap-1.5">
                        <FileVideo className="h-3 w-3 text-blue-400 mr-1" />
                        Creator
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <Edit className="h-3 w-3 text-purple-400 mr-1" />
                        Editor
                      </div>
                    )}
                  </Badge>
                  <p className="text-zinc-400 text-sm">{user.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader; 