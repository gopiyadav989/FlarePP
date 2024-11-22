import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FormPage } from '../components/FormPage.jsx';

export default function CreatorDashboard() {
  const navigate = useNavigate();
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-zinc-950 text-white">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <main className="flex-1 flex flex-col">
        <header className="flex justify-between px-8 py-4 border-b border-zinc-400">
          <div>
            <MdMenuOpen
              size={34}
              className={`cursor-pointer ${!sidebarOpen && 'rotate-180'}`}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            />
          </div>
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="bg-zinc-50 text-zinc-950 px-4 py-2 rounded"
          >
            <span>Upload Video</span>
          </button>
        </header>

        <div className="flex-1 flex justify-center items-center">
          {showUploadForm ? (
            <FormPage setShowUploadForm={setShowUploadForm} />
          ) : (
            <div className="text-center">
              <img
                src="https://via.placeholder.com/400"
                alt="Placeholder"
                className="w-64 h-auto mx-auto rounded"
              />
              <p className="text-gray-400 mt-4 italic">Get started by uploading a video</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}







import { MdMenuOpen } from "react-icons/md";
import { IoHomeOutline } from "react-icons/io5";
import { FaProductHunt } from "react-icons/fa";
import { FaUserCircle } from "react-icons/fa";
import { TbReportSearch } from "react-icons/tb";
import { IoLogoBuffer } from "react-icons/io";
import { CiSettings } from "react-icons/ci";
import { MdOutlineDashboard } from "react-icons/md";



const menuItems = [
  {
    icons: <IoHomeOutline size={30} />,
    label: 'Home'
  },
  {
    icons: <FaProductHunt size={30} />,
    label: 'Products'
  },
  {
    icons: <MdOutlineDashboard size={30} />,
    label: 'Dashboard'
  },
  {
    icons: <CiSettings size={30} />,
    label: 'Setting'
  },
  {
    icons: <IoLogoBuffer size={30} />,
    label: 'Log'
  },
  {
    icons: <TbReportSearch size={30} />,
    label: 'Report'
  }
]



function Sidebar({ open, setOpen }) {
  return (
    <nav className={`shadow-md h-screen p-2 flex flex-col duration-500 bg-zinc-900 text-zinc-50 border-r border-zinc-400 ${open ? 'w-60' : 'w-16'}`}>
      {/* Header */}
      <div className={` h-20 flex justify-between items-center  px-2 py-2`}>
        <div className={"rounded-md w-10"}>
          <img src={`https://www.youtube.com/s/desktop/208496d9/img/logos/favicon_144x144.png`} alt="Logo"  className={`${open ? 'w-10' : 'w-16'} rounded-md`}/>
        </div>
      </div>

      {/* Body */}
      <ul className='flex-1 text-zinc-50'>
        {menuItems.map((item, index) => (
          <li key={index} className='px-3 py-2 my-2 hover:bg-blue-800 rounded-md duration-300 cursor-pointer flex gap-2 items-center relative group'>
            <div>{item.icons}</div>
            <p className={`${!open && 'w-0 -translate-x-4'} duration-500 overflow-hidden`}>{item.label}</p>
            <p className={`${open && 'hidden'} absolute shadow-md rounded-md w-0 p-0 text-zinc-50 duration-100 overflow-hidden group-hover:w-fit group-hover:p-2 group-hover:left-16`}>
              {item.label}
            </p>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className='flex items-center gap-2 px-3 py-2'>
        <div><FaUserCircle size={30} /></div>
        <div className={`leading-5 ${!open && 'w-0 -translate-x-4'} duration-500 overflow-hidden`}>
          <p>Saheb</p>
          <span className='text-xs'>saheb@gmail.com</span>
        </div>
      </div>
    </nav>
  );
}
