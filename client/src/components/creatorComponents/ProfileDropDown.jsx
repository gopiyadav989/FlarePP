import React from 'react';
import { LogOut, Settings, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/reducers/userSlice';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import ProfilePage from '../Profile';

const ProfileDropdown = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  function handleLogout() {
    dispatch(logout());
    navigate('/login');
  }

  function handleProfileClick() {
    navigate('profile');
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56"
        align="end"
        sideOffset={5}
      >
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer"
            onClick={handleProfileClick}
          >
            <User className="h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/settings')}
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer text-red-500 focus:text-red-500"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;