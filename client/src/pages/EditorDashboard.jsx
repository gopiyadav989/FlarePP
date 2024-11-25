import { useState } from "react";
import { PanelRightOpen } from 'lucide-react';
import { Sidebar } from "../components/editorComponents/Sidebar";
import { Button } from "@/components/ui/button";

const EditorDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-zinc-950 text-white">

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main Section */}
      <main className="flex-1 flex flex-col">

        {/* Header */}
        <header className={`flex justify-between items-center px-8 py-4 border-b h-[7%] border-zinc-400`}>

          <div className={`cursor-pointer ${!sidebarOpen && "rotate-180"}`} onClick={() => setSidebarOpen(!sidebarOpen)}>
          <PanelRightOpen strokeWidth={1} />
          </div>

          
        </header>


        <Button>hi there</Button>

      </main>


    </div>
  );
};

export default EditorDashboard;
