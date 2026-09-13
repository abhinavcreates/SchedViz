import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Navbar — responsive top navigation bar.
 *
 * Mobile behaviour (< md breakpoint):
 *   - Logo + hamburger button visible in the top bar
 *   - Nav links and auth buttons collapse into a full-width drawer that
 *     slides down when the hamburger is toggled
 *   - All tap targets are ≥ 44px tall per accessibility guidelines
 *
 * Desktop behaviour (≥ md):
 *   - Standard horizontal nav: logo | links | auth buttons
 */
export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinkClass = ({ isActive }) =>
    `min-h-[44px] flex items-center px-4 border-b-2 transition-colors ${
      isActive
        ? 'border-accent text-accent'
        : 'border-transparent text-text-primary hover:text-accent-hover'
    }`;

  // Mobile drawer link style — full width, generous tap area
  const mobileLinkClass = ({ isActive }) =>
    `flex items-center min-h-[44px] px-6 py-3 text-sm font-medium border-l-2 transition-colors ${
      isActive
        ? 'border-accent text-accent bg-accent/5'
        : 'border-transparent text-text-primary hover:text-accent-hover'
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-surface border-b border-border">
      {/* ── Main bar ──────────────────────────────────────────────────────── */}
      <div className="h-16 flex items-center justify-between px-4 md:px-6">

        {/* Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/"
            className="text-xl font-mono font-bold text-accent"
            onClick={() => setMenuOpen(false)}
          >
            SchedViz
          </Link>
          <span className="text-sm text-text-muted hidden sm:inline">OS Simulator</span>
        </div>

        {/* Desktop nav links — hidden on mobile */}
        <div className="hidden md:flex items-center h-full">
          <NavLink to="/cpu"    className={navLinkClass}>CPU Scheduling</NavLink>
          <NavLink to="/memory" className={navLinkClass}>Memory Management</NavLink>
          <NavLink to="/history" className={navLinkClass}>History</NavLink>
        </div>

        {/* Desktop auth — hidden on mobile */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <span
                className="text-sm text-text-muted truncate max-w-[150px]"
                title={user.email}
              >
                {user.email}
              </span>
              <button
                onClick={logout}
                className="text-sm text-error hover:text-red-400 min-h-[44px] px-2"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm hover:text-accent min-h-[44px] flex items-center px-2">
                Login
              </Link>
              <Link
                to="/signup"
                className="text-sm bg-accent hover:bg-accent-hover text-base px-4 py-2 font-medium min-h-[44px] flex items-center"
              >
                Signup
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger button */}
        <button
          className="md:hidden flex flex-col justify-center items-center w-11 h-11 gap-1.5"
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <span
            className={`block w-6 h-0.5 bg-text-primary transition-transform duration-200 ${
              menuOpen ? 'rotate-45 translate-y-2' : ''
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-text-primary transition-opacity duration-200 ${
              menuOpen ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-text-primary transition-transform duration-200 ${
              menuOpen ? '-rotate-45 -translate-y-2' : ''
            }`}
          />
        </button>
      </div>

      {/* ── Mobile drawer ─────────────────────────────────────────────────── */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-surface pb-2">
          <NavLink to="/cpu"     className={mobileLinkClass} onClick={() => setMenuOpen(false)}>CPU Scheduling</NavLink>
          <NavLink to="/memory"  className={mobileLinkClass} onClick={() => setMenuOpen(false)}>Memory Management</NavLink>
          <NavLink to="/history" className={mobileLinkClass} onClick={() => setMenuOpen(false)}>History</NavLink>

          {/* Divider */}
          <div className="my-2 mx-6 border-t border-border" />

          {user ? (
            <div className="px-6 flex items-center justify-between min-h-[44px]">
              <span className="text-sm text-text-muted truncate max-w-[180px]" title={user.email}>
                {user.email}
              </span>
              <button
                onClick={() => { logout(); setMenuOpen(false); }}
                className="text-sm text-error hover:text-red-400 py-2 px-2"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="px-6 flex gap-3 pt-1 pb-2">
              <Link
                to="/login"
                className="flex-1 text-center py-2.5 text-sm border border-border hover:border-accent"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="flex-1 text-center py-2.5 text-sm bg-accent hover:bg-accent-hover text-base font-medium"
                onClick={() => setMenuOpen(false)}
              >
                Signup
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
