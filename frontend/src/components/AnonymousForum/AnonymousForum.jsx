import React, { useState, useEffect, useRef } from 'react';
import { Send, Users, Search, Plus, MessageSquare, MoreVertical, Terminal } from 'lucide-react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

const AnonymousForum = () => {
  const [selectedForum, setSelectedForum] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const stompClientRef = useRef(null);
  const [connected, setConnected] = useState(false);

  // Maintain local state for forum messages
  const [forums, setForums] = useState([
    {
      id: 1,
      name: "Engineering Discussions",
      description: "Architecture, patterns, and development",
      members: 234,
      messages: [
        {
          id: 1,
          content: "What orchestration tools are you relying on for microservices?",
          timestamp: "2024-01-20T10:30:00",
          author: "Node #1234"
        }
      ]
    },
    {
      id: 2,
      name: "Venture Ideation",
      description: "Brainstorming and early-stage validation",
      members: 156,
      messages: []
    },
    {
      id: 3,
      name: "Technical Screening",
      description: "Algorithm patterns and system design",
      members: 189,
      messages: []
    }
  ]);

  // Generate a steady random author identity for this session
  const [authorIdentity] = useState("Node #" + Math.floor(1000 + Math.random() * 9000));

  useEffect(() => {
    // Setup WebSocket connection
    const backendUrl = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:8080';
    // Remove trailing slash if exists
    const baseUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;

    // Using SockJS matching Spring backend
    const socket = new SockJS(`${baseUrl}/ws`);
    const stompClient = Stomp.over(socket);

    stompClient.debug = () => { }; // Disable debug logs to keep console clean

    stompClient.connect({}, () => {
      setConnected(true);

      // Subscribe to global messages
      stompClient.subscribe('/topic/messages', (messageOutput) => {
        try {
          const body = JSON.parse(messageOutput.body);
          if (body.type === 'FORUM_MSG') {
            setForums(prevForums => prevForums.map(f => {
              if (f.id === body.forumId) {
                // Check if message already exists locally
                if (f.messages.find(m => m.id === body.message.id)) return f;
                return { ...f, messages: [...f.messages, body.message] };
              }
              return f;
            }));

            // Need to update selectedForum if it matches to cause a re-render view correctly
            setSelectedForum(prev => {
              if (prev && prev.id === body.forumId) {
                if (prev.messages.find(m => m.id === body.message.id)) return prev;
                return { ...prev, messages: [...prev.messages, body.message] };
              }
              return prev;
            });
          }
        } catch (e) {
          // Normal message, ignore or handle differently
        }
      });
    }, (error) => {
      console.error("WebSocket Connection Error:", error);
      setConnected(false);
    });

    stompClientRef.current = stompClient;

    return () => {
      if (stompClient.connected) {
        stompClient.disconnect();
      }
    };
  }, []);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedForum || !connected) return;

    const newMessage = {
      id: Date.now(),
      content: messageInput,
      timestamp: new Date().toISOString(),
      author: authorIdentity
    };

    // Optimistically update UI
    setForums(prevForums => prevForums.map(f =>
      f.id === selectedForum.id ? { ...f, messages: [...f.messages, newMessage] } : f
    ));
    setSelectedForum(prev => ({ ...prev, messages: [...prev.messages, newMessage] }));

    // Broadcast to backend
    const payload = {
      type: 'FORUM_MSG',
      forumId: selectedForum.id,
      message: newMessage
    };

    try {
      stompClientRef.current.send("/app/sendMessage", {}, JSON.stringify(payload));
    } catch (err) {
      console.error("Failed to transmit over WebSocket:", err);
    }

    setMessageInput('');
  };

  const filteredForums = forums.filter(forum =>
    forum.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    forum.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen w-full bg-zinc-950 pt-20 pb-0 flex flex-col font-sans selection:bg-zinc-800 selection:text-white">
      <div className="flex-1 w-full max-w-7xl mx-auto bg-zinc-950 border-x border-t border-zinc-800/80 sm:rounded-tl-2xl sm:rounded-tr-2xl overflow-hidden flex shadow-2xl relative">

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden absolute top-4 left-4 z-50 p-2 bg-zinc-900 border border-zinc-800 rounded-md"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <MessageSquare className="w-5 h-5 text-zinc-400" />
        </button>

        {/* Forums List */}
        <div className={`w-80 bg-zinc-950 border-r border-zinc-800 flex flex-col
          ${isSidebarOpen ? 'translate-x-0 absolute inset-y-0 left-0 z-40 bg-zinc-950/95 backdrop-blur-md border-r-2' : '-translate-x-full absolute lg:relative'} 
          lg:translate-x-0 transition-transform duration-300 h-full`}>

          <div className="p-5 border-b border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Public Forums
                <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-red-500'} ml-2`}></span>
              </h1>
              <button className="p-1.5 hover:bg-zinc-900 rounded-md text-zinc-400 hover:text-zinc-200 transition-colors border border-transparent hover:border-zinc-800">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search queries..."
                className="w-full p-2.5 pl-9 bg-zinc-900 text-zinc-100 text-sm rounded-lg border border-zinc-800 focus:outline-none focus:border-zinc-600 placeholder-zinc-500 transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto hidden-scrollbar">
            {filteredForums.map((forum) => (
              <div
                key={forum.id}
                className={`p-4 border-b border-zinc-800/50 hover:bg-zinc-900/50 cursor-pointer transition-colors
                  ${selectedForum?.id === forum.id ? 'bg-zinc-900' : ''}`}
                onClick={() => {
                  setSelectedForum(forum);
                  setIsSidebarOpen(false);
                }}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="text-sm font-semibold text-zinc-100 truncate">{forum.name}</h3>
                      <div className="flex items-center text-zinc-500 text-[10px] uppercase font-bold tracking-wider ml-2">
                        <Users className="w-3 h-3 mr-1" />
                        {forum.members}
                      </div>
                    </div>
                    <p className="text-xs text-zinc-400 line-clamp-2">{forum.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Forum Messages */}
        <div className="flex-1 flex flex-col bg-zinc-950/50">
          {selectedForum ? (
            <>
              {/* Forum Header */}
              <div className="h-[73px] px-6 py-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center space-x-4 pl-10 lg:pl-0">
                  <div>
                    <h3 className="font-semibold text-zinc-100 leading-tight flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-zinc-500" />
                      {selectedForum.name}
                    </h3>
                    <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest">
                      {selectedForum.members} IDENTITIES
                    </span>
                  </div>
                </div>
                <div className="flex space-x-1 border-l border-zinc-800 pl-4">
                  <button className="p-2 hover:bg-zinc-900 rounded-md text-zinc-500 hover:text-zinc-200 transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {selectedForum.messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.author === authorIdentity ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-5 py-3 rounded-2xl text-[14px] leading-relaxed shadow-sm border ${msg.author === authorIdentity
                        ? 'bg-zinc-100 text-zinc-900 border-zinc-200 rounded-br-sm'
                        : 'bg-zinc-900 text-zinc-200 border-zinc-800 rounded-bl-sm'
                      }`}>
                      <div className={`text-[10px] uppercase tracking-wider font-bold mb-1 ${msg.author === authorIdentity ? 'text-zinc-500' : 'text-zinc-500'}`}>
                        {msg.author === authorIdentity ? 'You' : msg.author}
                      </div>
                      <p>{msg.content}</p>
                      <span className={`text-[10px] mt-2 block ${msg.author === authorIdentity ? 'text-zinc-500' : 'text-zinc-600'}`}>
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
                {selectedForum.messages.length === 0 && (
                  <div className="text-center py-20">
                    <p className="text-sm text-zinc-600">No transmissions in this channel yet.</p>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-5 bg-zinc-950 border-t border-zinc-800">
                <div className="flex items-center gap-2 max-w-4xl mx-auto">
                  <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden focus-within:border-zinc-600 transition-colors px-4 py-1.5 flex items-center">
                    <input
                      type="text"
                      placeholder="Broadcast message to channel..."
                      className="w-full bg-transparent p-2 text-zinc-100 text-sm focus:outline-none placeholder-zinc-600"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendMessage();
                      }}
                    />
                  </div>
                  <button
                    className="p-3 bg-zinc-100 hover:bg-zinc-300 text-zinc-900 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim() || !connected}
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </div>
                <div className="text-center mt-2 flex items-center justify-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${connected ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                  <span className="text-[10px] text-zinc-600 font-medium uppercase tracking-widest">
                    {connected ? 'Identities masked. Traffic is monitored.' : 'Connecting to secure stream...'}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center bg-zinc-950/30">
              <div className="text-center p-8 max-w-sm">
                <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <Users className="w-8 h-8 text-zinc-600" />
                </div>
                <h2 className="text-lg font-bold text-zinc-200 mb-2">
                  System Awaiting Protocol
                </h2>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  Select an active forum from the directory tree to inspect anonymous transmissions.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnonymousForum;