import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ role, children }) => {
  const userRole = useSelector((state) => state.user.role);
  
  if (!userRole) {
    return <Navigate to="/login" />;
  }
  
  if (role === "any") {
    return children;
  }
  
  if (userRole !== role) {
    if (role === "creator" || role === "editor") {
      return <Navigate to={`/${userRole}-dashboard`} />;
    }
    return <Navigate to="/login" />;
  }
  
  return children;
};

export default ProtectedRoute;