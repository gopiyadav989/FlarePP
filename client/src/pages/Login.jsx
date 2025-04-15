import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../redux/reducers/userSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { SparklesCore } from "@/components/ui/sparkles";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { motion, AnimatePresence } from "framer-motion";
import { FileVideo, LogIn, User, Shield } from "lucide-react";
import OAuth from "../components/OAuth";
import axios from "axios";

export default function Login() {
    const [formData, setFormData] = useState({ role: "creator" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value,
        });
    };

    function handleRoleChange(role) {
        setFormData((prev) => ({ ...prev, role }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            setError("Fill all the fields");
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Configure axios to use credentials
            const response = await axios.post("http://localhost:3000/api/auth/login", 
                formData, 
                { 
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json",
                    }
                }
            );

            const data = response.data;

            if (!data.success) {
                setError(data.message || "Login failed");
                return;
            }
            
            dispatch(login({
                user: data.user,
                role: data.user.role
            }));
            
            navigate("/");
        } catch (error) {
            console.error("Login error:", error);
            setError(error.response?.data?.message || "Error connecting to server");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-black text-white min-h-screen relative flex items-center justify-center overflow-hidden">
            {/* Background Effects */}
            <BackgroundBeams className="absolute inset-0 opacity-50" />
            
            <div className="container relative z-10 flex flex-col md:flex-row items-center justify-center gap-6 px-4 py-8">
                {/* Brand Section */}
                <div className="w-full md:w-1/2 max-w-md space-y-6 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start space-x-3">
                        <FileVideo className="text-blue-500" size={32} />
                        <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                            Flare
                        </span>
                    </div>
                    
                    <div className="relative">
                        <SparklesCore
                            id="sparkles-login"
                            background="transparent"
                            minSize={0.4}
                            maxSize={1.0}
                            particleDensity={windowWidth < 768 ? 40 : 70}
                            className="w-full h-40"
                            particleColor="#8b5cf6"
                        />
                        
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
                            Welcome Back
                        </h1>
                    </div>
                    
                    <p className="text-lg text-zinc-300">
                        Continue your journey in revolutionizing your video production workflow
                    </p>

                    <div className="hidden md:block mt-8">
                        <div className="grid grid-cols-2 gap-4">
                            <div className={`bg-white/5 backdrop-blur-sm p-4 rounded-lg border transition-all duration-300 ${formData.role === "creator" ? "border-blue-500/30 ring-1 ring-blue-500/20" : "border-white/10"}`}>
                                <User className="text-blue-400 mb-2" />
                                <h3 className="font-medium mb-1">For Creators</h3>
                                <p className="text-sm text-zinc-400">Upload and manage your content</p>
                            </div>
                            <div className={`bg-white/5 backdrop-blur-sm p-4 rounded-lg border transition-all duration-300 ${formData.role === "editor" ? "border-purple-500/30 ring-1 ring-purple-500/20" : "border-white/10"}`}>
                                <Shield className="text-purple-400 mb-2" />
                                <h3 className="font-medium mb-1">For Editors</h3>
                                <p className="text-sm text-zinc-400">Edit and enhance video projects</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full md:w-1/2 max-w-md"
                >
                    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl">
                        <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>

                        {/* Role Selector */}
                        <div className="mb-8">
                            <div className="relative bg-black/30 rounded-full p-1 flex">
                                <motion.div 
                                    className="absolute h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600"
                                    initial={{ width: "50%", x: formData.role === "creator" ? 0 : "100%" }}
                                    animate={{ 
                                        x: formData.role === "creator" ? 0 : "100%",
                                    }}
                                    transition={{ 
                                        type: "spring", 
                                        stiffness: 300, 
                                        damping: 30 
                                    }}
                                    style={{ width: "50%" }}
                                />
                                <button 
                                    className={`relative z-10 w-1/2 py-2 rounded-full font-medium transition-colors duration-300 ${
                                        formData.role === "creator" ? "text-white" : "text-gray-400"
                                    }`}
                                    onClick={() => handleRoleChange("creator")}
                                >
                                    Creator
                                </button>
                                <button 
                                    className={`relative z-10 w-1/2 py-2 rounded-full font-medium transition-colors duration-300 ${
                                        formData.role === "editor" ? "text-white" : "text-gray-400"
                                    }`}
                                    onClick={() => handleRoleChange("editor")}
                                >
                                    Editor
                                </button>
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            {formData.role === "editor" ? (
                                <motion.div
                                    key="editor-form"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-zinc-200">Email</Label>
                                            <Input
                                                type="email"
                                                id="email"
                                                placeholder="Enter your email address"
                                                onChange={handleChange}
                                                className="bg-black/30 border-white/10 text-white h-11"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="password" className="text-zinc-200">Password</Label>
                                            <Input
                                                type="password"
                                                id="password"
                                                placeholder="Enter your password"
                                                onChange={handleChange}
                                                className="bg-black/30 border-white/10 text-white h-11"
                                            />
                                        </div>

                                        <div className="pt-2">
                                            <HoverBorderGradient
                                                containerClassName="w-full rounded-full"
                                                as="button"
                                                type="submit"
                                                disabled={loading}
                                                className="w-full group relative h-11 text-white font-medium rounded-full"
                                                gradient="radial-gradient(circle, rgba(59,130,246,0.8) 0%, rgba(147,51,234,0.8) 100%)"
                                            >
                                                <span className="z-10 relative flex items-center justify-center">
                                                    {loading ? "Signing In..." : "Sign In"} 
                                                    {!loading && <LogIn className="ml-2 h-4 w-4" />}
                                                </span>
                                            </HoverBorderGradient>
                                        </div>
                                        
                                        {error && (
                                            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">
                                                {error}
                                            </div>
                                        )}
                                        
                                        <div className="relative my-6">
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="w-full border-t border-white/10"></div>
                                            </div>
                                            <div className="relative flex justify-center text-sm">
                                                <span className="px-2 bg-black/40 text-zinc-400">Or continue with</span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex justify-center">
                                            <OAuth role={formData.role} />
                                        </div>
                                    </form>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="creator-form"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex flex-col items-center w-full"
                                >
                                    <div className="w-full space-y-6">
                                        <div className="relative p-6 bg-gradient-to-br from-blue-900/40 via-indigo-900/40 to-purple-900/40 rounded-xl border border-white/10 shadow-lg overflow-hidden">
                                            <div className="absolute inset-0 bg-grid-white/5 bg-grid-8"></div>
                                            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-50 blur-xl"></div>
                                            
                                            <div className="relative">
                                                <div className="flex items-center justify-center mb-5">
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                                                        <User className="text-white h-6 w-6" />
                                                    </div>
                                                </div>
                                                
                                                <h3 className="text-xl font-medium text-center mb-3 text-white">Creator Account</h3>
                                                
                                                <div className="space-y-3 mb-6">
                                                    <div className="flex items-center p-3 bg-white/5 rounded-lg">
                                                        <div className="flex-shrink-0 bg-blue-500/20 p-2 rounded-full">
                                                            <FileVideo className="h-5 w-5 text-blue-400" />
                                                        </div>
                                                        <p className="ml-3 text-sm text-zinc-300">Upload and manage videos</p>
                                                    </div>
                                                    
                                                    <div className="flex items-center p-3 bg-white/5 rounded-lg">
                                                        <div className="flex-shrink-0 bg-purple-500/20 p-2 rounded-full">
                                                            <Shield className="h-5 w-5 text-purple-400" />
                                                        </div>
                                                        <p className="ml-3 text-sm text-zinc-300">Access your creator dashboard</p>
                                                    </div>
                                                </div>

                                                <div className="relative">
                                                    <div className="absolute inset-0 flex items-center">
                                                        <div className="w-full border-t border-white/10"></div>
                                                    </div>
                                                    <div className="relative flex justify-center text-sm">
                                                        <span className="px-2 bg-black/30 text-zinc-400">Continue with</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="mt-6 flex justify-center">
                                                    <motion.div 
                                                        whileHover={{ scale: 1.05 }}
                                                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                                    >
                                                        <OAuth role={formData.role} />
                                                    </motion.div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="mt-6 text-center">
                            <p className="text-zinc-400 text-sm">
                                Don't have an account?{" "}
                                <Link to="/signup" className="text-blue-400 hover:underline font-medium">
                                    Sign Up
                                </Link>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
