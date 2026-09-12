import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  const linkClass = ({ isActive }) =>
    `px-4 py-2 border-b-2 ${
      isActive ? 'border-accent text-accent' : 'border-transparent text-text-primary hover:text-accent-hover'
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-surface border-b border-border z-50 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <Link to="/" className="text-xl font-mono font-bold text-accent">
          SchedViz
        </Link>
        <span className="text-sm text-text-muted hidden sm:inline">OS Simulator</span>
      </div>

      <div className="flex items-center h-full">
        <NavLink to="/cpu" className={linkClass}>CPU Scheduling</NavLink>
        <NavLink to="/memory" className={linkClass}>Memory Management</NavLink>
        <NavLink to="/history" className={linkClass}>History</NavLink>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-sm text-text-muted truncate max-w-[150px]" title={user.email}>
              {user.email}
            </span>
            <button
              onClick={logout}
              className="text-sm text-error hover:text-red-400"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm hover:text-accent">Login</Link>
            <Link to="/signup" className="text-sm bg-accent hover:bg-accent-hover text-base px-3 py-1 font-medium">
              Signup
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
