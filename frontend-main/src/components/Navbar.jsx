import React, { useState, useContext } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Menu, X, Briefcase, MessageSquare, User, Home, ArrowUpRight, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

/**
 * @title Proxima Navigation Bar
 * @notice Renders the responsive site header and handles navigation states.
 * @dev Inspects the AuthContext session to conditionally serve login actions vs logout buttons.
 */
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Job Listings', path: '/jobs', icon: Briefcase },
    { name: 'Direct Messages', path: '/messages', icon: MessageSquare },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    navigate('/signin');
  };

  return (
    <nav className="sticky top-0 z-50 w-full glassmorphism border-b border-[#EAE2D5] backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-[#241E1A] flex items-center justify-center transition-transform group-hover:rotate-6">
                <span className="text-[#FDFBF7] font-black text-sm tracking-tighter">P</span>
              </div>
              <span className="font-extrabold text-lg tracking-tight text-[#241E1A] group-hover:text-amber-800 transition-colors">
                proxima
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `relative px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200 rounded-lg flex items-center gap-2 ${
                    isActive
                      ? 'text-[#241E1A] bg-[#F4ECE1]'
                      : 'text-stone-500 hover:text-[#241E1A] hover:bg-[#FDFBF7]'
                  }`
                }
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.name}
              </NavLink>
            ))}
          </div>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <button
                onClick={handleLogout}
                className="text-xs font-semibold uppercase tracking-wider text-stone-600 hover:text-red-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            ) : (
              <Link
                to="/signin"
                className="text-xs font-semibold uppercase tracking-wider text-stone-600 hover:text-[#241E1A] transition-colors"
              >
                Sign In
              </Link>
            )}
            <Link
              to="/jobs"
              className="inline-flex items-center gap-1 bg-[#241E1A] hover:bg-[#382F29] text-[#FDFBF7] text-xs font-semibold uppercase tracking-wider px-4 py-2.5 rounded-lg transition-all duration-200 shadow-sm"
            >
              Post a Job
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-stone-500 hover:text-[#241E1A] hover:bg-[#F4ECE1] transition-colors"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-[#EAE2D5] bg-[#FDFBF7]" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-semibold uppercase tracking-wider transition-colors ${
                    isActive
                      ? 'text-[#241E1A] bg-[#F4ECE1]'
                      : 'text-stone-500 hover:text-[#241E1A] hover:bg-stone-50'
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </NavLink>
            ))}
            <div className="border-t border-[#EAE2D5] my-2 pt-2 px-3 flex flex-col gap-3">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="text-sm font-semibold uppercase tracking-wider text-stone-600 hover:text-red-700 py-1 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              ) : (
                <Link
                  to="/signin"
                  onClick={() => setIsOpen(false)}
                  className="text-sm font-semibold uppercase tracking-wider text-stone-600 hover:text-[#241E1A] py-1 transition-colors"
                >
                  Sign In
                </Link>
              )}
              <Link
                to="/jobs"
                onClick={() => setIsOpen(false)}
                className="inline-flex justify-center items-center gap-1 bg-[#241E1A] hover:bg-[#382F29] text-[#FDFBF7] text-xs font-semibold uppercase tracking-wider py-2.5 px-4 rounded-lg transition-colors shadow-sm"
              >
                Post a Job
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
