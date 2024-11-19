import { Link, redirect, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";

const Home = () => {

  const userRole = useSelector((state) => state.user.role);
  const navigate = useNavigate();

  useEffect(() => {

    if (userRole == "editor") {
      navigate("/editor-dashboard");
    }
    else if (userRole == "creator") {
      navigate("/creator-dashboard");
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">

      <h1 className="text-4xl font-bold mb-6 text-gray-800">Welcome to Our App</h1>
      <div className="flex space-x-4">
        <Link to={"login"} className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400">
          Login
        </Link>
        <Link to={"signup"} className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400">
          Sign Up
        </Link>

        <Link to={"creator-dashboard"} className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400">
          Creator dashboard
        </Link>
        <Link to={"editor-dashboard"} className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400">
          Editor Dashboard
        </Link>

      </div>
    </div>
  );
};

export default Home;
