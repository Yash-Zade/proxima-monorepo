import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Github, Linkedin, DiscIcon as Discord } from 'lucide-react';
import { Separator } from '../ui/separator';

export default function Footer() {
    return (
        <footer className="bg-zinc-950 border-t border-zinc-900 mt-20">
            <div className="mx-auto w-full max-w-7xl px-6 lg:px-8 py-12 lg:py-16">
                <div className="md:flex md:justify-between">
                    <div className="mb-8 md:mb-0">
                        <Link to="/" className="flex items-center gap-2">
                            <span className="text-2xl font-bold tracking-tight text-white">
                                Proxima.
                            </span>
                        </Link>
                        <p className="mt-4 max-w-sm text-sm text-zinc-400 leading-relaxed">
                            Building the intelligent career infrastructure. Connect with top-tier mentors and opportunities in one unified ecosystem.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-8 sm:gap-12 sm:grid-cols-3">
                        <div>
                            <h2 className="mb-4 text-sm font-semibold text-zinc-100 tracking-wider">Platform</h2>
                            <ul className="text-zinc-400 space-y-3">
                                <li>
                                    <Link to="/" className="hover:text-zinc-50 transition-colors text-sm">
                                        Home
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/about" className="hover:text-zinc-50 transition-colors text-sm">
                                        About
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/jobs" className="hover:text-zinc-50 transition-colors text-sm">
                                        Jobs
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h2 className="mb-4 text-sm font-semibold text-zinc-100 tracking-wider">Resources</h2>
                            <ul className="text-zinc-400 space-y-3">
                                <li>
                                    <Link to="/mentors" className="hover:text-zinc-50 transition-colors text-sm">
                                        Mentors
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/forum" className="hover:text-zinc-50 transition-colors text-sm">
                                        Community Forum
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/chat" className="hover:text-zinc-50 transition-colors text-sm">
                                        Messages
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h2 className="mb-4 text-sm font-semibold text-zinc-100 tracking-wider">Legal</h2>
                            <ul className="text-zinc-400 space-y-3">
                                <li>
                                    <Link to="#" className="hover:text-zinc-50 transition-colors text-sm">
                                        Privacy Policy
                                    </Link>
                                </li>
                                <li>
                                    <Link to="#" className="hover:text-zinc-50 transition-colors text-sm">
                                        Terms & Conditions
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <Separator className="my-8 bg-zinc-900" />

                <div className="sm:flex sm:items-center sm:justify-between">
                    <span className="text-sm text-zinc-500 sm:text-center block">
                        © {new Date().getFullYear()} <Link to="/" className="hover:text-zinc-300 transition-colors">Proxima</Link>. All Rights Reserved.
                    </span>
                    <div className="flex mt-6 space-x-6 sm:justify-center sm:mt-0">
                        <Link to="#" className="text-zinc-500 hover:text-zinc-300 transition-colors">
                            <Discord className="w-5 h-5" />
                            <span className="sr-only">Discord community</span>
                        </Link>
                        <Link to="#" className="text-zinc-500 hover:text-zinc-300 transition-colors">
                            <Twitter className="w-5 h-5" />
                            <span className="sr-only">Twitter page</span>
                        </Link>
                        <Link to="#" className="text-zinc-500 hover:text-zinc-300 transition-colors">
                            <Github className="w-5 h-5" />
                            <span className="sr-only">GitHub account</span>
                        </Link>
                        <Link to="#" className="text-zinc-500 hover:text-zinc-300 transition-colors">
                            <Linkedin className="w-5 h-5" />
                            <span className="sr-only">LinkedIn profile</span>
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}