import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import EditorDashboard from "./pages/EditorDashboard";
import CreatorDashboard from "./pages/CreatorDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

import CreatorVideoList from "./components/CreatorVideoList";
import SearchPage from "./components/creatorComponents/SearchPage";

// Pages for Editor Dashboard
import EditorVideoList from "./components/EditorVideoList";
import InProgress from "./pages/editorPages/InProgress";
import Revisions from "./pages/editorPages/Revisions";
import Completed from "./pages/editorPages/Completed";
import Messages from "./pages/editorPages/Messages";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />

        {/* Role-Based Protected Routes */}
        <Route path="editor-dashboard" element={
          <ProtectedRoute role="editor">
            <EditorDashboard />
          </ProtectedRoute>}>
          <Route path="" element={<EditorVideoList />} />
          <Route path="in-progress" element={<InProgress />} />
          <Route path="revisions" element={<Revisions />} />
          <Route path="completed" element={<Completed />} />
          <Route path="messages" element={<Messages />} />
        </Route>

        <Route path="creator-dashboard" element={
          <ProtectedRoute role="creator">
            <CreatorDashboard />
          </ProtectedRoute>}>
          <Route path="" element={<CreatorVideoList />} />
          <Route path="search" element={<SearchPage />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
