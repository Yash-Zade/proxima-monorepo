import React, { useState, useContext, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Briefcase, MessageSquare, User, Home, ArrowUpRight, LogOut, Shield, ChevronDown, LayoutDashboard } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

/**
 * @title Proxima Navigation Bar
 * @notice Renders the responsive site header and handles navigation states.
 * @dev Conditionally serves personalized info, employer actions, and logout buttons.
 */
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDashboardsOpen, setIsDashboardsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout } = useContext(AuthContext);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDashboardsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsDashboardsOpen(false);
  }, [location.pathname]);

  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  const mainNavItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Job Listings', path: '/jobs', icon: Briefcase },
  ];

  const dashboardItems = [];

  if (user) {
    mainNavItems.push({ name: 'Direct Messages', path: '/messages', icon: MessageSquare });
    
    if (user.roles?.includes('EMPLOYER')) {
      dashboardItems.push({ name: 'Employer', path: '/employer', icon: Briefcase });
    }
    if (user.roles?.includes('ADMIN')) {
      dashboardItems.push({ name: 'Admin Panel', path: '/admin', icon: Shield });
    }
    dashboardItems.push({ name: 'Profile', path: '/profile', icon: User });
  }

  const confirmLogout = async () => {
    setShowSignOutConfirm(false);
    showToast('Signed out successfully!', 'success');
    await logout();
    setIsOpen(false);
    setTimeout(() => {
      navigate('/signin');
    }, 1000);
  };

  const isEmployer = user && user.roles && user.roles.includes('EMPLOYER');
  const firstName = user?.name ? user.name.split(' ')[0] : '';

  return (
    <>
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
              {mainNavItems.map((item) => (
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

              {/* Desktop Dashboards Dropdown */}
              {dashboardItems.length > 0 && (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDashboardsOpen(!isDashboardsOpen)}
                    className={`relative px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200 rounded-lg flex items-center gap-2 ${
                      isDashboardsOpen
                        ? 'text-[#241E1A] bg-[#F4ECE1]'
                        : 'text-stone-500 hover:text-[#241E1A] hover:bg-[#FDFBF7]'
                    }`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Available Dashboards
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isDashboardsOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isDashboardsOpen && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-[#EAE2D5] rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                      <div className="py-2">
                        {dashboardItems.map((item) => (
                          <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                              `flex items-center gap-3 px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${
                                isActive
                                  ? 'text-[#241E1A] bg-[#F4ECE1]'
                                  : 'text-stone-500 hover:text-[#241E1A] hover:bg-[#FAF6F0]'
                              }`
                            }
                          >
                            <item.icon className="w-4 h-4" />
                            {item.name}
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Action Buttons */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  {firstName && (
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#241E1A] border-r border-[#EAE2D5] pr-4">
                      Hi, {firstName}
                    </span>
                  )}
                  <button
                    onClick={() => setShowSignOutConfirm(true)}
                    className="text-xs font-semibold uppercase tracking-wider text-stone-600 hover:text-red-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  to="/signin"
                  className="inline-flex items-center gap-1 bg-[#241E1A] hover:bg-[#382F29] text-[#FDFBF7] text-xs font-semibold uppercase tracking-wider px-4 py-2.5 rounded-lg transition-all duration-200 shadow-sm"
                >
                  Sign In
                      <ArrowUpRight className="w-3 h-3" />
                </Link>
              )}
              
           
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
              {mainNavItems.map((item) => (
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

              {/* Mobile Dashboards Section */}
              {dashboardItems.length > 0 && (
                <div className="pt-2 pb-1">
                  <div className="flex items-center gap-3 px-3 py-2 text-xs font-bold uppercase tracking-widest text-stone-400">
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Available Dashboards
                  </div>
                  <div className="pl-4 space-y-1 mt-1 border-l-2 border-[#EAE2D5] ml-4">
                    {dashboardItems.map((item) => (
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
                  </div>
                </div>
              )}
              <div className="border-t border-[#EAE2D5] my-2 pt-2 px-3 flex flex-col gap-3">
                {user ? (
                  <div className="flex flex-col gap-3">
                    {firstName && (
                      <span className="text-sm font-semibold uppercase tracking-wider text-[#241E1A] pt-1 px-1">
                        Hi, {firstName}
                      </span>
                    )}
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        setShowSignOutConfirm(true);
                      }}
                      className="text-sm font-semibold uppercase tracking-wider text-stone-600 hover:text-red-700 py-1 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/signin"
                    onClick={() => setIsOpen(false)}
                    className="text-sm font-semibold uppercase tracking-wider text-stone-600 hover:text-[#241E1A] py-1 transition-colors"
                  >
                    Sign In
                  </Link>
                )}
                {(!user || isEmployer) && (
                  <Link
                    to="/jobs"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex justify-center items-center gap-1 bg-[#241E1A] hover:bg-[#382F29] text-[#FDFBF7] text-xs font-semibold uppercase tracking-wider py-2.5 px-4 rounded-lg transition-colors shadow-sm"
                  >
                    Post a Job
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Sign Out Confirmation Modal */}
      {showSignOutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-[#FDFBF7] border border-[#EAE2D5] rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-[#241E1A] mb-2">Sign Out</h3>
            <p className="text-sm text-stone-500 mb-6">
              Are you sure you want to sign out of your Proxima session?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowSignOutConfirm(false)}
                className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-stone-600 hover:text-[#241E1A] hover:bg-[#F4ECE1] transition-colors rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white transition-colors rounded-lg shadow-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}