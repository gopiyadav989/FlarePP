import React from 'react';
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

const ErrorDisplay = ({ error, onRetry }) => (
  <div className="bg-red-900/20 border border-red-800 text-red-100 p-6 rounded-lg max-w-xl mx-auto">
    <div className="flex items-center mb-4">
      <AlertCircle className="h-6 w-6 mr-2" />
      <h3 className="text-xl font-semibold">Error Loading Videos</h3>
    </div>
    <p className="mb-4">{error}</p>
    <Button 
      variant="outline" 
      className="border-red-500 text-red-100 hover:bg-red-800/30"
      onClick={onRetry}
    >
      <RefreshCw className="mr-2 h-4 w-4" /> Try Again
    </Button>
  </div>
);

export default ErrorDisplay; 