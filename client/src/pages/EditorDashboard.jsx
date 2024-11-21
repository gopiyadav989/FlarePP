import { Outlet, Link } from "react-router-dom";

const EditorDashboard = () => (
  <div>
    <nav>
      <Link to="tasks">Tasks</Link>
      <Link to="profile">Profile</Link>
      <button onClick={()=> navigate("/tasks")}>hi there</button>
      <button onClick={() => navigate("/creator-dashboard/tasks")}>Go to Tasks</button>

    </nav>
    <Outlet />
  </div>
);

export default EditorDashboard;