import React from 'react';
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import EditorDashboard from "./pages/editorPages/EditorDashboard";
import CreatorDashboard from './pages/creatorPages/CreatorDashboard';

import ProtectedRoute from "./components/ProtectedRoute";
import RedirectAuthenticated from "./components/RedirectAuthenticated";
import SearchPage from "./components/creatorComponents/SearchPage";
import InProgress from "./pages/editorPages/InProgress";
import Revisions from "./pages/editorPages/Revisions";
import Completed from "./pages/editorPages/Completed";
import ChatInterface from "./components/Chat/ChatInterface";
import ProfilePage from './components/Profile';
import CreatorVideoList from './components/creatorComponents/CreatorVideoList';
import EditorVideoList from './components/editorComponents/EditorVideoList';
import VideoDetailPage from './pages/creatorPages/VideoDetailPage';

export default function App() {
  return (
    <Routes>
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

      <Route
        path="videos/:videoId"
        element={
          <ProtectedRoute role="creator">
            <VideoDetailPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="chat"
        element={
          <ProtectedRoute role="any">
            <ChatInterface />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}