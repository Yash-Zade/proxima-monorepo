import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare, Users, ChevronDown, User, LogOut, Settings } from 'lucide-react';
import { Button } from "../ui/button";
import { AuthContext } from '../Auth/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "../ui/navigation-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { logout, user } = useContext(AuthContext);
  const isAuthenticated = !!localStorage.getItem('accessToken') || !!user;
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Jobs', path: '/jobs' },
    { name: 'Mentors', path: '/mentors' },
  ];

  const isActive = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path + '/'));

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${scrolled ? 'bg-zinc-950/80 backdrop-blur-md border-zinc-800 shadow-sm' : 'bg-zinc-950 border-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-zinc-50">
                Proxima.
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              <NavigationMenu>
                <NavigationMenuList>
                  {navLinks.map((link) => (
                    <NavigationMenuItem key={link.name}>
                      <NavigationMenuLink asChild>
                        <Link
                          to={link.path}
                          className={`group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-800/50 hover:text-zinc-50 focus:bg-zinc-800/50 focus:text-zinc-50 outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-zinc-800 data-[state=open]:bg-zinc-800/50 ${isActive(link.path) ? 'bg-zinc-800 text-zinc-50' : 'text-zinc-400 bg-transparent'
                            }`}
                        >
                          {link.name}
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}

                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800/50 focus:bg-zinc-800/50 focus:text-zinc-50 data-[state=open]:bg-zinc-800/50 data-[state=open]:text-zinc-50 bg-transparent h-9 px-4">
                      Engage
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[200px] gap-2 p-3 bg-zinc-950 border-zinc-800">
                        <li>
                          <NavigationMenuLink asChild>
                            <Link
                              to="/chat"
                              className="flex items-center select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-zinc-800 hover:text-zinc-50 focus:bg-zinc-800 focus:text-zinc-50"
                            >
                              <MessageSquare className="w-5 h-5 mr-3 text-zinc-400 group-hover:text-zinc-50" />
                              <div className="text-sm font-medium leading-none text-zinc-300">Direct Messages</div>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                        <li>
                          <NavigationMenuLink asChild>
                            <Link
                              to="/forum"
                              className="flex items-center select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-zinc-800 hover:text-zinc-50 focus:bg-zinc-800 focus:text-zinc-50"
                            >
                              <Users className="w-5 h-5 mr-3 text-zinc-400 group-hover:text-zinc-50" />
                              <div className="text-sm font-medium leading-none text-zinc-300">Community Forum</div>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>

          <div className="flex flex-1 justify-end items-center">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:ring-offset-2 focus:ring-offset-zinc-950 transition-transform active:scale-95">
                      <Avatar className="h-8 w-8 border border-zinc-800 bg-zinc-900 transition-opacity hover:opacity-80">
                        <AvatarImage src="" alt="User" />
                        <AvatarFallback className="bg-zinc-800 text-zinc-300 text-xs font-semibold">A</AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-zinc-950 border-zinc-800 text-zinc-300 shadow-xl" align="end">
                    <div className="flex items-center justify-start gap-2 p-3">
                      <div className="flex flex-col space-y-0.5 leading-none">
                        <p className="font-semibold text-zinc-50 text-sm">Alex Profile</p>
                        <p className="w-[200px] truncate text-xs text-zinc-500 font-medium">
                          alex@proxima.test
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator className="bg-zinc-800" />
                    <DropdownMenuItem className="focus:bg-zinc-800 focus:text-zinc-50 cursor-pointer rounded-md my-0.5" onSelect={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="focus:bg-zinc-800 focus:text-zinc-50 cursor-pointer rounded-md my-0.5" onSelect={() => navigate('/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-zinc-800" />
                    <DropdownMenuItem className="text-red-400 focus:bg-red-950/50 focus:text-red-300 cursor-pointer rounded-md my-0.5" onSelect={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button variant="ghost" className="text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800/50 h-9 font-medium" onClick={() => navigate('/login')}>
                  Log in
                </Button>
                <Button className="bg-zinc-50 text-zinc-950 hover:bg-zinc-200 h-9 font-medium" onClick={() => navigate('/signup')}>
                  Sign up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}