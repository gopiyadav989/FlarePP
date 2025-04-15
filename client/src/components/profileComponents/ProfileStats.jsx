import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const ProfileStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="bg-black/40 backdrop-blur-sm border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`p-2 rounded-full bg-opacity-20 ${stat.color.replace('text-', 'bg-').replace('500', '900')}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ProfileStats; 