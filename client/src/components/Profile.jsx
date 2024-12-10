import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Mail, 
  User, 
  Camera, 
  BadgeCheck, 
  Settings, 
  LogOut, 
  Edit 
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { logout } from '@/redux/reducers/userSlice';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, role, googleToken } = useSelector((state) => state.user);

  // If no user is logged in, redirect to login
  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
            <p className=" text-black">
              Manage your personal information and account settings
            </p>
          </div>
          <Button className="text-black" variant="outline" onClick={() => {}}>
            <Camera className="mr-2 h-4 w-4" />
            Change Avatar
          </Button>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Main Profile Card */}
          <Card className="shadow-md">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.avatarUrl || ''} />
                  <AvatarFallback className="bg-primary/10">
                    <User className="h-10 w-10 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {user.name || 'User'}
                    <BadgeCheck className="h-5 w-5 text-blue-500" />
                  </CardTitle>
                  <CardDescription>{role || 'No Role Assigned'}</CardDescription>
                  <Badge variant="secondary" className="mt-2">
                    {googleToken ? 'Google Authenticated' : 'Local Account'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Separator className="my-4" />
              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Email</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{user.email || 'No email'}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Account Type</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-medium">{role || 'Unassigned'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Settings Card */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Profile Information
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                      <DialogDescription>
                        Update your profile details
                      </DialogDescription>
                    </DialogHeader>
                    {/* Add edit profile form here */}
                  </DialogContent>
                </Dialog>

                <Button variant="outline" className="w-full justify-start">
                  <Mail className="mr-2 h-4 w-4" />
                  Update Email Preferences
                </Button>

                <Separator />

                <Button 
                  variant="destructive" 
                  className="w-full justify-start"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                Authentication: {googleToken ? 'Google' : 'Local'}
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;