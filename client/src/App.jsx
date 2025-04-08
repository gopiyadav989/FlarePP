import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import EditorDashboard from "./pages/editorPages/EditorDashboard";

import ProtectedRoute from "./components/ProtectedRoute";
import RedirectAuthenticated from "./components/RedirectAuthenticated";

import SearchPage from "./components/creatorComponents/SearchPage";
// Pages for Editor Dashboard

import InProgress from "./pages/editorPages/InProgress";
import Revisions from "./pages/editorPages/Revisions";
import Completed from "./pages/editorPages/Completed";
import Messages from "./pages/editorPages/Messages";
import ProfilePage from "./components/Profile";
import CreatorVideoList from './components/creatorComponents/CreatorVideoList';
import EditorVideoList from './components/editorComponents/EditorVideoList';
import CreatorDashboard from './pages/creatorPages/CreatorDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route 
          path="login" 
          element={
            <RedirectAuthenticated>
              <Login />
            </RedirectAuthenticated>
          } 
        />
        <Route 
          path="signup" 
          element={
            <RedirectAuthenticated>
              <Signup />
            </RedirectAuthenticated>
          } 
        />
        
        {/* Role-Based Protected Routes */}
        <Route 
          path="editor-dashboard" 
          element={
            <ProtectedRoute role="editor">
              <EditorDashboard />
            </ProtectedRoute>
          }
        >
          <Route path="" element={<EditorVideoList />} />
          <Route path="in-progress" element={<InProgress />} />
          <Route path="revisions" element={<Revisions />} />
          <Route path="completed" element={<Completed />} />
          <Route path="messages" element={<Messages />} />
        </Route>
        
        <Route 
          path="creator-dashboard" 
          element={
            <ProtectedRoute role="creator">
              <CreatorDashboard />
            </ProtectedRoute>
          }
        >
          <Route path="" element={<CreatorVideoList />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}