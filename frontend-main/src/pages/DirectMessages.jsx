import React from 'react';
import { Send, Phone, Video, Search, Info, Paperclip, MessageSquare, ShieldAlert } from 'lucide-react';

export default function DirectMessages() {
  const dummyThreads = [
    { name: 'Sarah Jenkins', role: 'Recruiter @ Linear', initial: 'S', active: true, msg: 'Great, let’s schedule a call tomorrow!' },
    { name: 'Devon Miller', role: 'VP of Eng @ Stripe', initial: 'D', active: false, msg: 'Your coding submission looked spectacular.' },
    { name: 'Supabase Bot', role: 'Platform Notifications', initial: 'B', active: false, msg: 'Your developer credentials have been verified.' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-8rem)] min-h-[500px]">
      <div className="bg-[#FAF6F0] border border-[#EAE2D5] rounded-2xl overflow-hidden h-full flex shadow-sm">
        {/* Left column - dummy inbox sidebar */}
        <div className="w-full md:w-80 lg:w-96 border-r border-[#EAE2D5] flex flex-col h-full bg-[#FAF6F0]">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-[#EAE2D5] bg-[#FCF9F3]">
            <h2 className="text-xs font-bold text-[#241E1A] uppercase tracking-wider">Inbox Channel</h2>
            <div className="mt-3 relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-stone-400" />
              <input
                type="text"
                placeholder="Search active chats..."
                disabled
                className="w-full bg-[#FDFBF7] border border-[#EAE2D5] rounded-lg py-2 pl-9 pr-4 text-xs outline-none cursor-not-allowed placeholder:text-stone-300"
              />
            </div>
          </div>

          {/* Threads list */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {dummyThreads.map((thread, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer border ${
                  thread.active
                    ? 'bg-white border-[#EAE2D5] shadow-xs'
                    : 'bg-transparent border-transparent hover:bg-[#F4ECE1]/40'
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-[#241E1A] text-[#FDFBF7] flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {thread.initial}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className="text-xs font-bold text-[#241E1A] truncate">{thread.name}</h3>
                    <span className="text-[9px] text-stone-400 font-semibold">14:23</span>
                  </div>
                  <p className="text-[10px] text-stone-500 font-semibold truncate">{thread.role}</p>
                  <p className="text-[11px] text-stone-400 truncate mt-1">{thread.msg}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column - dummy messaging feed */}
        <div className="hidden md:flex flex-1 flex-col h-full bg-[#FCF9F3]">
          {/* Header */}
          <div className="p-4 border-b border-[#EAE2D5] flex justify-between items-center bg-[#FCF9F3]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#241E1A] text-[#FDFBF7] flex items-center justify-center font-bold text-xs">
                S
              </div>
              <div>
                <h2 className="text-xs font-bold text-[#241E1A]">Sarah Jenkins</h2>
                <p className="text-[9px] text-stone-400 font-semibold">Recruiter @ Linear Labs &bull; Online</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button disabled className="p-1.5 text-stone-300 rounded-lg cursor-not-allowed"><Phone className="w-4 h-4" /></button>
              <button disabled className="p-1.5 text-stone-300 rounded-lg cursor-not-allowed"><Video className="w-4 h-4" /></button>
              <button disabled className="p-1.5 text-stone-300 rounded-lg cursor-not-allowed"><Info className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Messages view */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="flex justify-start">
              <div className="max-w-xs rounded-2xl rounded-bl-none border border-[#EAE2D5] bg-[#FDFBF7] px-4 py-2.5 text-xs text-stone-800">
                Hi there! I saw your elite placement credentials on Proxima. Are you open to new roles?
              </div>
            </div>
            
            <div className="flex justify-end">
              <div className="max-w-xs rounded-2xl rounded-br-none bg-[#241E1A] text-[#FDFBF7] px-4 py-2.5 text-xs">
                Hello Sarah! Yes, I am exploring frontend lead or system architect placements.
              </div>
            </div>

            <div className="flex justify-start">
              <div className="max-w-xs rounded-2xl rounded-bl-none border border-[#EAE2D5] bg-[#FDFBF7] px-4 py-2.5 text-xs text-stone-800">
                Great, let’s schedule a call tomorrow!
              </div>
            </div>

            {/* Muted Warning */}
            <div className="pt-8 flex items-center justify-center text-center">
              <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FAF6F0] border border-[#EAE2D5] text-[10px] font-semibold text-stone-500 max-w-sm">
                <ShieldAlert className="w-4 h-4 text-stone-400 flex-shrink-0" />
                This is a secure mock communications channel interface.
              </div>
            </div>
          </div>

          {/* Dummy compose area */}
          <div className="p-4 border-t border-[#EAE2D5] bg-[#FCF9F3]">
            <div className="flex items-center bg-[#FDFBF7] border border-[#EAE2D5] rounded-xl p-1.5">
              <button disabled className="p-2 text-stone-300 cursor-not-allowed"><Paperclip className="w-4 h-4" /></button>
              <input
                type="text"
                placeholder="Type a secure message..."
                disabled
                className="w-full bg-transparent border-0 outline-none text-xs px-2 text-[#241E1A] placeholder:text-stone-300 cursor-not-allowed"
              />
              <button
                disabled
                className="bg-[#241E1A] opacity-40 text-white rounded-lg p-2.5 cursor-not-allowed flex items-center justify-center"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
