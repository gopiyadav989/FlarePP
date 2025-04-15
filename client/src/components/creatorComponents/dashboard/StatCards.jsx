import React from 'react';
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, FileVideo, Users, MessageSquareIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Helper function for formatting numbers
const formatNumber = (num) => {
  if (num === null || num === undefined) return "0";
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  } else {
    return num.toString();
  }
};

// Individual stat card component
const StatCard = ({ title, value, icon, trend = null }) => {
  return (
    <Card className="bg-black/40 backdrop-blur-xl border border-white/10 overflow-hidden group transition-all duration-300 hover:border-white/20">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="bg-blue-500/20 p-2 rounded-full">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend !== null && (
          <p className={`text-xs flex items-center mt-1 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend >= 0 ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1" />
            )}
            {Math.abs(trend)}% {trend >= 0 ? 'increase' : 'decrease'}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

// Main component for the stats section
const StatCards = ({ loading, videos, cardVariants }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="col-span-3"
    >
      <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? (
          // Skeleton loaders for the cards during loading state
          Array(4).fill().map((_, i) => (
            <Card key={i} className="overflow-hidden bg-black/40 backdrop-blur-xl border border-white/10">
              <CardHeader className="pb-2">
                <div className="h-4 w-1/2 bg-white/5 rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-3/4 mb-2 bg-white/5 rounded" />
                <div className="h-4 w-1/2 bg-white/5 rounded" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <StatCard 
              title="Total Views" 
              value={formatNumber(videos?.totalViews || 0)}
              icon={<TrendingUp className="h-4 w-4" />}
              trend={+(videos?.viewsTrend || 0)}
            />
            <StatCard 
              title="Total Subscribers" 
              value={formatNumber(videos?.subscriberCount || 0)}
              icon={<Users className="h-4 w-4" />}
              trend={+(videos?.subscribersTrend || 0)}
            />
            <StatCard 
              title="Total Videos" 
              value={formatNumber(videos?.videoCount || 0)}
              icon={<FileVideo className="h-4 w-4" />}
            />
            <StatCard 
              title="Total Comments" 
              value={formatNumber(videos?.commentCount || 0)}
              icon={<MessageSquareIcon className="h-4 w-4" />}
              trend={+(videos?.commentsTrend || 0)}
            />
          </>
        )}
      </div>
    </motion.div>
  );
};

export default StatCards; 