import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  FileVideo, 
  Upload, 
  Calendar, 
  Clock, 
  LogOut,
} from 'lucide-react';
import { BackgroundBeams } from "@/components/ui/background-beams";
import { useToast } from "../hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import { logout } from '@/redux/reducers/userSlice';
import { Button } from '@/components/ui/button';

// Import our new component files
import ProfileHeader from './profileComponents/ProfileHeader';
import ProfileStats from './profileComponents/ProfileStats';
import ProfileSettings from './profileComponents/ProfileSettings';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, role, googleToken } = useSelector((state) => state.user);
  const [avatarFile, setAvatarFile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || 'No bio yet.',
    socialLinks: {
      youtube: user?.socialLinks?.youtube || '',
      twitter: user?.socialLinks?.twitter || '',
      github: user?.socialLinks?.github || ''
    },
    notifications: {
      email: true,
      push: true,
      marketing: false
    }
  });

  // If no user is logged in, redirect to login
  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleProfileUpdate = () => {
    // Here would go the API call to update the profile
    setEditMode(false);
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully.",
      variant: "default",
    });
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return;
    
    // Here would go the API call to upload the avatar
    toast({
      title: "Avatar updated",
      description: "Your profile picture has been updated successfully.",
      variant: "default",
    });
  };

  // Profile Stats
  const stats = [
    { label: 'Videos', value: 12, icon: FileVideo, color: 'text-blue-500' },
    { label: 'Uploads', value: 24, icon: Upload, color: 'text-green-500' },
    { label: 'Member Since', value: '2022', icon: Calendar, color: 'text-purple-500' },
    { label: 'Editor Hours', value: 48, icon: Clock, color: 'text-yellow-500' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20">
      {/* Background Effects */}
      <BackgroundBeams className="absolute inset-0 opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 via-zinc-950/50 to-purple-950/10 pointer-events-none"></div>
      
      {/* Header */}
      <ProfileHeader 
        user={user} 
        role={role} 
        handleFileChange={handleFileChange} 
      />
      
      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats */}
        <ProfileStats stats={stats} />
        
        {/* Settings */}
        <ProfileSettings 
          profileData={profileData}
          setProfileData={setProfileData}
          handleProfileUpdate={handleProfileUpdate}
          editMode={editMode}
          setEditMode={setEditMode}
        />
        
        {/* Logout Button */}
        <div className="mt-8 flex justify-end">
          <Button 
            variant="destructive" 
            onClick={handleLogout}
            className="bg-red-600/40 hover:bg-red-700/60 text-white"
          >
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;