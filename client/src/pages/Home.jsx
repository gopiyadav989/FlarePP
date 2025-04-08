import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Edit2,
  Youtube,
  Users,
  Globe,
  Shield,
  Zap,
  FileVideo,
  CheckCircle,
  Layers,
  PenTool,
  PlayCircle,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { SparklesCore } from "@/components/ui/sparkles";
import { CardHoverEffect } from "@/components/ui/card-hover-effect";
import { StickyScroll } from "@/components/ui/sticky-scroll-reveal";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { TracingBeam } from "@/components/ui/tracing-beam";

const Home = () => {
  const [activeTab, setActiveTab] = useState("creators");

  const userRole = useSelector((state) => state.user.role);
  const navigate = useNavigate();

  useEffect(() => {
    if (userRole == "editor") {
      navigate("/editor-dashboard");
    } else if (userRole == "creator") {
      navigate("/creator-dashboard");
    }
  }, []);

  const features = {
    creators: [
      {
        icon: Upload,
        title: "Seamless Uploads",
        description:
          "Instant video uploads with smart cloud integration and compression.",
      },
      {
        icon: Users,
        title: "Editor Collaboration",
        description:
          "Powerful matchmaking with editors tailored to your needs.",
      },
      {
        icon: Youtube,
        title: "Direct Publishing",
        description:
          "Advanced YouTube integration with smart scheduling and optimization.",
      },
    ],
    editors: [
      {
        icon: PenTool,
        title: "Advanced Editing",
        description:
          "Professional-grade editing tools with AI-powered suggestions.",
      },
      {
        icon: Layers,
        title: "Project Management",
        description:
          "Intuitive workflow tracking and client communication hub.",
      },
      {
        icon: CheckCircle,
        title: "Quality Control",
        description: "Automated quality checks and version control systems.",
      },
    ],
  };

  const platformContent = [
    {
      title: "Unified Content Hub",
      description:
        "Centralize all your videos, assets, and feedback in one powerful platform. Never lose a file again.",
      content: (
        <div className="h-full w-full bg-gradient-to-br from-indigo-900 to-purple-900 rounded-xl flex items-center justify-center">
          <div className="grid grid-cols-3 gap-4 p-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-black/20 backdrop-blur-sm rounded-lg p-2 aspect-video flex items-center justify-center">
                <FileVideo className="text-white/70" size={24} />
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "Seamless Collaboration",
      description:
        "Connect with your team in real-time. Comments, annotations, and revisions all in one place.",
      content: (
        <div className="h-full w-full bg-gradient-to-br from-blue-900 to-cyan-900 rounded-xl flex items-center justify-center">
          <div className="space-y-3 p-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-black/20 backdrop-blur-sm rounded-lg p-3 flex items-start">
                <div className="h-8 w-8 rounded-full bg-white/20 mr-3"></div>
                <div className="space-y-1">
                  <div className="h-2 w-24 bg-white/30 rounded"></div>
                  <div className="h-2 w-40 bg-white/20 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "Direct Publishing",
      description:
        "Publish directly to YouTube with advanced scheduling, thumbnails, and SEO optimization.",
      content: (
        <div className="h-full w-full bg-gradient-to-br from-red-900 to-orange-900 rounded-xl flex items-center justify-center">
          <Youtube className="text-white w-24 h-24 opacity-70" />
        </div>
      ),
    },
  ];

  const advancedFeatures = [
    {
      title: "Real-time Feedback",
      description: "Leave timestamped comments directly on videos",
      link: "#"
    },
    {
      title: "Asset Library",
      description: "Store and organize all your media files",
      link: "#"
    },
    {
      title: "Version Control",
      description: "Track changes and revert to previous versions",
      link: "#"
    },
    {
      title: "Team Management",
      description: "Assign roles and manage permissions",
      link: "#"
    },
    {
      title: "Analytics Integration",
      description: "Connect with YouTube analytics for insights",
      link: "#"
    },
    {
      title: "AI-Powered Tools",
      description: "Automatically generate captions and tags",
      link: "#"
    },
  ];

  return (
    <div className="bg-black text-white min-h-screen overflow-hidden">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <FileVideo className="text-blue-500" size={32} />
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Flare
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              className="text-zinc-300 hover:text-white hover:bg-white/10"
            >
              Features
            </Button>
            <Button
              variant="ghost"
              className="text-zinc-300 hover:text-white hover:bg-white/10"
            >
              Pricing
            </Button>
            <HoverBorderGradient
              containerClassName="rounded-full"
              as="button"
              onClick={() => navigate("/login")}
              className="group relative px-4 py-2 text-sm text-white font-medium rounded-full"
              gradient="radial-gradient(circle, rgba(59,130,246,0.8) 0%, rgba(147,51,234,0.8) 100%)"
            >
              <span className="z-10 relative">Login</span>
            </HoverBorderGradient>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative h-screen flex flex-col items-center justify-center text-center px-4">
        <BackgroundBeams className="absolute inset-0" />
        
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="w-full absolute inset-0 -z-10">
            <SparklesCore
              id="sparkles"
              background="transparent"
              minSize={0.6}
              maxSize={1.4}
              particleDensity={100}
              className="w-full h-full"
              particleColor="#8b5cf6"
            />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
            Revolutionize Your<br />Video Production Workflow
          </h1>
          
          <p className="text-xl md:text-2xl text-zinc-300 max-w-2xl mx-auto mt-5 mb-8">
            Streamline collaboration, editing, and publishing with our
            comprehensive video management platform.
          </p>

          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
            <Button 
              size="lg"
              onClick={() => navigate("/login")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full px-8 py-6 text-lg font-medium shadow-lg shadow-purple-500/20"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button 
              size="lg"
              variant="outline"
              className="border-white/20 bg-white/5 hover:bg-white/10 text-white rounded-full px-8 py-6 text-lg font-medium backdrop-blur-sm flex items-center"
            >
              <PlayCircle className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>
          
          <div className="absolute bottom-8 left-0 right-0 flex justify-center animate-bounce">
            <div className="w-8 h-8 border-2 border-white/30 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>

      {/* Feature Tabs */}
      <div className="bg-gradient-to-b from-black to-purple-950/20 py-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-center mb-10">
            <div className="bg-white/5 backdrop-blur-lg rounded-full p-1.5 border border-white/10 flex">
              <Button
                variant={activeTab === "creators" ? "default" : "ghost"}
                onClick={() => setActiveTab("creators")}
                className={`rounded-full text-sm px-6 ${
                  activeTab === "creators"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md shadow-purple-500/30"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                For Creators
              </Button>
              <Button
                variant={activeTab === "editors" ? "default" : "ghost"}
                onClick={() => setActiveTab("editors")}
                className={`rounded-full text-sm px-6 ${
                  activeTab === "editors"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md shadow-purple-500/30"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                For Editors
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features[activeTab].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 h-full overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  <div className="relative z-10">
                    <div className="mb-6 bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl inline-flex">
                      <feature.icon className="text-white" size={28} />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-white">
                      {feature.title}
                    </h3>
                    <p className="text-zinc-300">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Platform Capabilities with Sticky Scroll */}
      <div className="py-20 bg-black">
        <div className="container mx-auto px-4 mb-10">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Platform Capabilities
          </h2>
          <p className="text-zinc-400 text-xl text-center max-w-3xl mx-auto mb-16">
            Our comprehensive suite of tools makes video production and collaboration effortless
          </p>
        </div>
        
        <div className="max-w-5xl mx-auto">
          <StickyScroll content={platformContent} />
        </div>
      </div>

      {/* Advanced Features with Card Hover Effect */}
      <div className="py-20 bg-gradient-to-b from-purple-950/20 to-black">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Advanced Features
          </h2>
          <p className="text-zinc-400 text-xl text-center max-w-3xl mx-auto mb-16">
            Powerful tools designed for professional video production workflows
          </p>
          
          <CardHoverEffect items={advancedFeatures} className="max-w-5xl mx-auto" />
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Trusted by Creators
          </h2>
          <p className="text-zinc-400 text-xl text-center max-w-3xl mx-auto mb-16">
            See what creators and editors are saying about Flare
          </p>
          
          <TracingBeam className="px-4">
            <div className="max-w-5xl mx-auto space-y-12">
              {[
                {
                  quote: "Flare has completely transformed how I collaborate with my editing team. What used to take days now happens in hours.",
                  author: "Alex Johnson",
                  role: "YouTube Creator, 1.2M subscribers"
                },
                {
                  quote: "The direct publishing feature saves me so much time. No more downloading and uploading massive files just to get my content live.",
                  author: "Maya Williams",
                  role: "Travel Vlogger, 890K subscribers"
                },
                {
                  quote: "As an editor, the feedback system is a game-changer. I always know exactly what changes my clients want.",
                  author: "Daniel Kim",
                  role: "Professional Video Editor"
                }
              ].map((testimonial, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8">
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-xl font-bold">
                      {testimonial.author[0]}
                    </div>
                    <div>
                      <p className="text-xl italic mb-4 text-zinc-200">"{testimonial.quote}"</p>
                      <p className="font-semibold text-white">{testimonial.author}</p>
                      <p className="text-zinc-400 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TracingBeam>
        </div>
      </div>

      {/* Call to Action */}
      <div className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-purple-900/20"></div>
        <BackgroundBeams className="absolute inset-0" />
        
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
            Transform Your Video Production
          </h2>
          <p className="text-xl md:text-2xl text-zinc-300 mb-10 max-w-3xl mx-auto">
            Join thousands of creators and editors who have revolutionized their workflow.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Button 
              size="lg"
              onClick={() => navigate("/login")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full px-8 py-6 text-lg font-medium shadow-lg shadow-purple-500/20"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button 
              size="lg"
              variant="outline"
              className="border-white/20 bg-white/5 hover:bg-white/10 text-white rounded-full px-8 py-6 text-lg font-medium backdrop-blur-sm"
              onClick={() => navigate("/login")}
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-black border-t border-white/10 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <FileVideo className="text-blue-500" size={24} />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                Flare
              </span>
            </div>
            <div className="flex space-x-8 text-zinc-400">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-8 text-center text-zinc-500 text-sm">
            © {new Date().getFullYear()} Flare. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;