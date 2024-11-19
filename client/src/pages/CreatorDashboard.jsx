import React from 'react'
import { Link, Outlet } from 'react-router-dom'

export default function CreatorDashboard() {
  return (
    <div>
      fv
    <nav>
      <Link to="tasks">Tasks</Link>
      <Link to="profile">Profile</Link>
    </nav>
    <Outlet />
  </div>
  )
}
