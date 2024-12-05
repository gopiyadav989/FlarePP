import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/editorComponents/Navbar";
import Dock from "../components/editorComponents/Dock";

const EditorDashboard = () => (
  <div className="flex min-h-screen flex-col h-screen bg-zinc-950 text-white">
    <Navbar />
    <main className="flex-1 overflow-y-auto p-6">
      <Outlet />
      <div className="text-center text-gray-500">Content will be rendered here</div>
    </main>
    <Dock />
  </div>
);

export default EditorDashboard;
