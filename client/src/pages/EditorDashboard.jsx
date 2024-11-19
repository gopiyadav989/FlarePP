import { Outlet, Link } from "react-router-dom";

const EditorDashboard = () => (
  <div>
    <nav>
      <Link to="tasks">Tasks</Link>
      <Link to="profile">Profile</Link>
    </nav>
    <Outlet />
  </div>
);

export default EditorDashboard;
