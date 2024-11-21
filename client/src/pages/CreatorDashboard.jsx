import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';

export default function CreatorDashboard() {
  const navigate = useNavigate();

  return (
    
    <div className="flex h-screen bg-gray-900 text-white">
      
      {/* Sidebar */}
      <aside className="w-1/5 bg-gray-800 flex flex-col justify-between border-2">
        <div>
          <h1 className="text-2xl font-bold p-6">Video Collab Hub</h1>
          <nav className="mt-10">
            <ul>
              <li className="px-6 py-3 hover:bg-gray-700 cursor-pointer flex items-center gap-2">
                <span className="material-icons">Dashboard</span>
              </li>
              <li className="px-6 py-3 hover:bg-gray-700 cursor-pointer flex items-center gap-2">
                <span className="material-icons">Settings</span>
              </li>
            </ul>
          </nav>
        </div>
        <div className="p-6">
          <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded">
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <Outlet/>
        <header className="flex justify-end px-8 py-4 bg-gray-800 border-2">
          <button className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded flex items-center gap-2">
            <span className="material-icons">Upload Video</span>
          </button>
        </header>

        {/* Content Section */}
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <img
              src="https://via.placeholder.com/400" // Replace with the image URL or import locally
              alt="Placeholder"
              className="w-64 h-auto mx-auto rounded"
            />
            <p className="text-gray-400 mt-4 italic">Get started by uploading a video</p>
          </div>
        </div>
      </main>
    </div>
  );
}