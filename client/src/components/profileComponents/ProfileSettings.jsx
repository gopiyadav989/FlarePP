import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Youtube, Github, Twitter, Bell, UserCircle, Shield } from 'lucide-react';

const ProfileSettings = ({ profileData, setProfileData, handleProfileUpdate, editMode, setEditMode }) => {
  return (
    <Tabs defaultValue="general" className="mt-8">
      <TabsList className="bg-zinc-900/50 mb-6">
        <TabsTrigger value="general" className="data-[state=active]:bg-zinc-800">
          <UserCircle className="h-4 w-4 mr-2" /> General
        </TabsTrigger>
        <TabsTrigger value="security" className="data-[state=active]:bg-zinc-800">
          <Shield className="h-4 w-4 mr-2" /> Security
        </TabsTrigger>
        <TabsTrigger value="notifications" className="data-[state=active]:bg-zinc-800">
          <Bell className="h-4 w-4 mr-2" /> Notifications
        </TabsTrigger>
      </TabsList>

      <TabsContent value="general">
        <Card className="bg-black/40 backdrop-blur-sm border border-white/10">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  disabled={!editMode}
                  className="bg-zinc-900/50 border-zinc-800"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="Your email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  disabled={!editMode}
                  className="bg-zinc-900/50 border-zinc-800"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself"
                value={profileData.bio}
                onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                disabled={!editMode}
                className="min-h-32 bg-zinc-900/50 border-zinc-800"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 backdrop-blur-sm border border-white/10 mt-6">
          <CardHeader>
            <CardTitle>Social Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="youtube" className="flex items-center">
                  <Youtube className="h-4 w-4 mr-2 text-red-500" /> YouTube
                </Label>
                <Input
                  id="youtube"
                  placeholder="YouTube channel URL"
                  value={profileData.socialLinks.youtube}
                  onChange={(e) => setProfileData({
                    ...profileData, 
                    socialLinks: {
                      ...profileData.socialLinks,
                      youtube: e.target.value
                    }
                  })}
                  disabled={!editMode}
                  className="bg-zinc-900/50 border-zinc-800"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter" className="flex items-center">
                  <Twitter className="h-4 w-4 mr-2 text-blue-500" /> Twitter
                </Label>
                <Input
                  id="twitter"
                  placeholder="Twitter URL"
                  value={profileData.socialLinks.twitter}
                  onChange={(e) => setProfileData({
                    ...profileData, 
                    socialLinks: {
                      ...profileData.socialLinks,
                      twitter: e.target.value
                    }
                  })}
                  disabled={!editMode}
                  className="bg-zinc-900/50 border-zinc-800"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="github" className="flex items-center">
                  <Github className="h-4 w-4 mr-2 text-purple-500" /> GitHub
                </Label>
                <Input
                  id="github"
                  placeholder="GitHub URL"
                  value={profileData.socialLinks.github}
                  onChange={(e) => setProfileData({
                    ...profileData, 
                    socialLinks: {
                      ...profileData.socialLinks,
                      github: e.target.value
                    }
                  })}
                  disabled={!editMode}
                  className="bg-zinc-900/50 border-zinc-800"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              {editMode ? (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => setEditMode(false)}
                    className="border-zinc-700 hover:bg-zinc-900"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleProfileUpdate}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={() => setEditMode(true)}
                  className="border-zinc-700 hover:bg-zinc-900"
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notifications">
        <Card className="bg-black/40 backdrop-blur-sm border border-white/10">
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-zinc-400">
                  Receive notifications about your videos via email
                </p>
              </div>
              <Switch 
                id="email-notifications" 
                checked={profileData.notifications.email}
                onCheckedChange={(checked) => setProfileData({
                  ...profileData,
                  notifications: {
                    ...profileData.notifications,
                    email: checked
                  }
                })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications">Push Notifications</Label>
                <p className="text-sm text-zinc-400">
                  Receive push notifications in the browser
                </p>
              </div>
              <Switch 
                id="push-notifications" 
                checked={profileData.notifications.push}
                onCheckedChange={(checked) => setProfileData({
                  ...profileData,
                  notifications: {
                    ...profileData.notifications,
                    push: checked
                  }
                })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="marketing-emails">Marketing Emails</Label>
                <p className="text-sm text-zinc-400">
                  Receive emails about new features and offers
                </p>
              </div>
              <Switch 
                id="marketing-emails" 
                checked={profileData.notifications.marketing}
                onCheckedChange={(checked) => setProfileData({
                  ...profileData,
                  notifications: {
                    ...profileData.notifications,
                    marketing: checked
                  }
                })}
              />
            </div>

            <Button 
              onClick={handleProfileUpdate}
              className="bg-blue-600 hover:bg-blue-700 mt-4"
            >
              Save Preferences
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="security">
        <Card className="bg-black/40 backdrop-blur-sm border border-white/10">
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                placeholder="••••••••"
                className="bg-zinc-900/50 border-zinc-800"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="••••••••"
                  className="bg-zinc-900/50 border-zinc-800"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  className="bg-zinc-900/50 border-zinc-800"
                />
              </div>
            </div>

            <Button 
              className="bg-blue-600 hover:bg-blue-700 mt-4"
            >
              Update Password
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default ProfileSettings; 