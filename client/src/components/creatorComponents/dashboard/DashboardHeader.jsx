import React from 'react';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { BarChart2, Upload, User } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const DashboardHeader = ({ handleUploadClick }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);

  // Navigate to profile
  const goToProfile = () => {
    navigate('/creator-dashboard/profile');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
          Creator Dashboard
        </h1>
        <p className="text-gray-400">
          Welcome back, {user?.name || 'Creator'}!
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={goToProfile}
          className="bg-black/40 border-white/10 text-white flex items-center gap-2 hover:bg-white/10"
        >
          <User className="h-4 w-4" />
          Profile
        </Button>
        <Button
          variant="outline"
          onClick={handleUploadClick}
          className="bg-black/40 border-white/10 text-white flex items-center gap-2 hover:bg-white/10"
        >
          <Upload className="h-4 w-4" />
          Upload Video
        </Button>
        <HoverBorderGradient
          containerClassName="rounded-full"
          className="bg-black/40 text-white border-0 px-4 py-2"
          gradient="linear-gradient(90deg, rgba(59,130,246,0.8) 0%, rgba(147,51,234,0.8) 100%)"
          as={Button}
          variant="default"
          onClick={() => navigate('/creator-dashboard/analytics')}
        >
          <BarChart2 className="h-4 w-4 mr-2" />
          Analytics
        </HoverBorderGradient>
      </div>
    </motion.div>
  );
};

export default DashboardHeader; 