import React, { useState, useEffect, useRef } from 'react';
import { Search, MessageSquare, Phone, Video, Send, MoreVertical, Terminal } from 'lucide-react';
import apiClient from '../Auth/ApiClient';
import { Avatar, AvatarFallback } from "../ui/avatar";
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

const ChatMessages = () => {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const stompClientRef = useRef(null);
  const [connected, setConnected] = useState(false);

  // 1. Fetch current user and contacts list
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Load authenticated profile
        const meRes = await apiClient.get('/users/me');
        const me = meRes.data.data;
        setCurrentUser({ id: me.id, name: me.name });

        // Load all users
        const res = await apiClient.get('/users/all');
        const users = res.data.data || [];

        // Exclude current logged in user
        const filteredUsers = users.filter(u => u.id !== me.id);

        const mappedContacts = filteredUsers.map(u => ({
          id: u.id,
          name: u.name,
          role: u.roles?.join(', ') || 'USER',
          lastMessage: "System initialized. Secure link active.",
          lastMessageTime: "ACTIVE",
          unreadCount: 0,
          online: true,
          email: u.email
        }));
        setContacts(mappedContacts);
      } catch (err) {
        console.error("Failed to fetch chat contacts", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 2. Fetch past conversation history on contact selection
  useEffect(() => {
    if (!currentUser || !selectedContact) return;

    const fetchHistory = async () => {
      try {
        const res = await apiClient.get(`/api/chat/history/${currentUser.id}/${selectedContact.id}`);
        const history = res.data.data || [];
        const mappedHistory = history.map(msg => {
          const timestampFormatted = new Date(msg.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          });
          return {
            id: msg.id,
            sender: msg.senderId,
            content: msg.content,
            timestamp: timestampFormatted
          };
        });
        setMessages(mappedHistory);
      } catch (err) {
        console.error("Failed to load chat history", err);
      }
    };

    fetchHistory();
  }, [selectedContact, currentUser]);

  // 3. Connect to WebSocket & subscribe to private message queue
  useEffect(() => {
    if (!currentUser) return;

    const backendUrl = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:8080';
    const baseUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;

    const socket = new SockJS(`${baseUrl}/ws`);
    const stompClient = Stomp.over(socket);

    stompClient.debug = () => {}; // Disable debug logs to keep console clean

    stompClient.connect({}, () => {
      setConnected(true);

      // Subscribe to private absolute topic destination
      stompClient.subscribe(`/topic/private-messages/${currentUser.id}`, (messageOutput) => {
        try {
          const body = JSON.parse(messageOutput.body);
          
          setSelectedContact(activeContact => {
            // Append message only if it belongs to the currently active conversation
            if (activeContact && (body.senderId === activeContact.id || body.receiverId === activeContact.id)) {
              setMessages(prev => {
                // Prevent duplicate message rendering
                if (prev.find(m => m.id === body.id)) return prev;

                const timestampFormatted = new Date(body.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return [...prev, {
                  id: body.id,
                  sender: body.senderId,
                  content: body.content,
                  timestamp: timestampFormatted
                }];
              });
            }
            return activeContact;
          });
        } catch (e) {
          console.error("Error processing WebSocket message", e);
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
  }, [currentUser]);

  const getInitials = (name) => {
    return name ? name.split(' ').map(word => word[0]).join('').toUpperCase() : 'U';
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedContact || !currentUser) return;

    const timestampNow = Date.now();
    const payload = {
      senderId: currentUser.id,
      receiverId: selectedContact.id,
      content: messageInput,
      timestamp: timestampNow
    };

    // Optimistic UI updates
    const localTimestamp = new Date(timestampNow).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

    const tempLocalMessage = {
      id: "temp-" + Date.now(),
      sender: currentUser.id,
      content: messageInput,
      timestamp: localTimestamp
    };

    setMessages(prev => [...prev, tempLocalMessage]);

    // Publish private message through the pipeline
    try {
      if (connected && stompClientRef.current?.connected) {
        stompClientRef.current.send("/app/sendPrivateMessage", {}, JSON.stringify(payload));
      } else {
        apiClient.post('/api/chat/sendPrivateMessage', payload).catch(err => {
          console.error("Failed to transmit over REST fallback", err);
        });
      }
    } catch (err) {
      console.error("Failed to transmit over WebSocket:", err);
      apiClient.post('/api/chat/sendPrivateMessage', payload).catch(err => {
        console.error("Failed to transmit over REST fallback after WS error", err);
      });
    }

    setMessageInput('');
  };

  if (loading) {
    return (
      <div className="h-screen w-full bg-zinc-950 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-zinc-800 border-t-zinc-100 rounded-full animate-spin"></div>
        <p className="mt-4 text-zinc-500 font-mono text-xs uppercase tracking-widest">Synchronizing Neural Network...</p>
      </div>
    );
  }

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

        {/* Sidebar */}
        <div className={`w-80 bg-zinc-950 border-r border-zinc-800 flex flex-col transition-transform duration-300 h-full
          ${isSidebarOpen ? 'translate-x-0 absolute inset-y-0 left-0 z-40 bg-zinc-950/95 backdrop-blur-md' : '-translate-x-full absolute lg:relative lg:translate-x-0'}`}>

          <div className="p-5 border-b border-zinc-800">
            <h1 className="text-xl font-bold text-white mb-4 tracking-tight flex items-center gap-2">
              Communications
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-red-500'} ml-2`}></span>
            </h1>
            <div className="relative">
              <input
                type="text"
                placeholder="Search nodes..."
                className="w-full p-2.5 pl-9 bg-zinc-900 text-zinc-100 text-sm rounded-lg border border-zinc-800 focus:outline-none focus:border-zinc-600 placeholder-zinc-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto hidden-scrollbar">
            {contacts
              .filter(contact => contact.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(contact => (
                <div
                  key={contact.id}
                  className={`p-4 border-b border-zinc-800/50 hover:bg-zinc-900/50 cursor-pointer transition-colors
                    ${selectedContact?.id === contact.id ? 'bg-zinc-900 border-l-2 border-l-zinc-100' : ''}`}
                  onClick={() => {
                    setSelectedContact(contact);
                    setIsSidebarOpen(false);
                    if (selectedContact?.id !== contact.id) setMessages([]);
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative pt-1">
                      <Avatar className="w-10 h-10 border border-zinc-800">
                        <AvatarFallback className="bg-zinc-800 text-zinc-300 text-xs font-semibold">
                          {getInitials(contact.name)}
                        </AvatarFallback>
                      </Avatar>
                      {contact.online && (
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-zinc-950" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h3 className="text-sm font-semibold text-zinc-100 truncate">{contact.name}</h3>
                        <span className="text-[10px] text-zinc-500 ml-2">{contact.lastMessageTime}</span>
                      </div>
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500 mb-1">{contact.role}</p>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-zinc-400 truncate max-w-[180px]">{contact.lastMessage}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-zinc-950/50">
          {selectedContact ? (
            <>
              {/* Chat Header */}
              <div className="h-[73px] px-6 py-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center space-x-4 pl-10 lg:pl-0">
                  <div className="relative">
                    <Avatar className="w-10 h-10 border border-zinc-800">
                      <AvatarFallback className="bg-zinc-800 text-zinc-300 font-semibold">
                        {getInitials(selectedContact.name)}
                      </AvatarFallback>
                    </Avatar>
                    {selectedContact.online && (
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-zinc-950" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-100 leading-tight">{selectedContact.name}</h3>
                    <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest">
                      {selectedContact.role}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-1 border-l border-zinc-800 pl-4">
                  <button className="p-2 hover:bg-zinc-900 rounded-md text-zinc-500 hover:text-zinc-200 transition-colors">
                    <Phone className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-zinc-900 rounded-md text-zinc-500 hover:text-zinc-200 transition-colors">
                    <Video className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-zinc-900 rounded-md text-zinc-500 hover:text-zinc-200 transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length > 0 ? messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === currentUser.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] px-5 py-3 rounded-2xl text-[14px] leading-relaxed shadow-sm ${message.sender === currentUser.id
                          ? 'bg-zinc-100 text-zinc-900 rounded-br-sm'
                          : 'bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-bl-sm'
                        }`}
                    >
                      <p>{message.content}</p>
                      <span className="text-[10px] mt-2 block text-zinc-500">
                        {message.timestamp}
                      </span>
                    </div>
                  </div>
                )) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-zinc-600 font-mono text-[10px] uppercase tracking-widest">Handshake completed. Begin transmission.</p>
                  </div>
                )}
              </div>

              {/* Message Input Area */}
              <div className="p-5 bg-zinc-950 border-t border-zinc-800">
                <div className="flex items-end gap-2 max-w-4xl mx-auto">
                  <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden focus-within:border-zinc-600 transition-colors">
                    <textarea
                      rows="1"
                      placeholder="Transmit response to node..."
                      className="w-full max-h-32 p-3.5 bg-transparent text-zinc-100 text-sm focus:outline-none resize-none placeholder-zinc-500"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                  </div>
                  <button
                    className="p-3.5 h-fit bg-zinc-100 hover:bg-zinc-300 text-zinc-900 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-center mt-2 flex items-center justify-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${connected ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                  <span className="text-[10px] text-zinc-600 font-medium uppercase tracking-widest">
                    {connected ? 'Transmissions are encrypted point-to-point. Use Shift+Enter for line breaks.' : 'Connecting to secure stream...'}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center bg-zinc-950/30">
              <div className="text-center p-8 max-w-sm">
                <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <Terminal className="w-8 h-8 text-zinc-600" />
                </div>
                <h2 className="text-lg font-bold text-zinc-200 mb-2">
                  System Awaiting Connection
                </h2>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  Select a registered node from the left channel list to initialize a secure communication handshake.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessages;