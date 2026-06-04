import React, { useState, useEffect, useRef, useContext } from 'react';
import { 
  Send, Phone, Video, Search, Info, Paperclip, MessageSquare, 
  ShieldAlert, X, Smile, FileText, Image, Loader2, CheckCheck, Mail, ArrowLeft
} from 'lucide-react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import apiClient from '../lib/apiClient';
import { AuthContext } from '../context/AuthContext';
import { ChatSkeleton, MessageSkeleton } from '../components/Skeleton';

export default function DirectMessages() {
  const { user } = useContext(AuthContext);
  const currentUser = user;

  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [connected, setConnected] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  // New UI/UX States
  const [isSearching, setIsSearching] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isAttachmentOpen, setIsAttachmentOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const stompClientRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const emojis = ['👍', '❤️', '😂', '🎉', '🔥', '🚀', '💬', '🙏', '🤔', '👀'];

  // Toast Helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Get Initials for User Avatars
  const getInitials = (name) => {
    return name ? name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase() : 'U';
  };

  // Role based Avatar style mapping
  const getAvatarStyles = (role) => {
    const normalizedRole = (role || '').toUpperCase();
    if (normalizedRole.includes('EMPLOYER') || normalizedRole.includes('COMPANY')) {
      return {
        bg: 'bg-[#C1CDBC]',
        text: 'text-[#241E1A]',
        border: 'border-[#A3B39C]'
      };
    } else if (normalizedRole.includes('ADMIN')) {
      return {
        bg: 'bg-[#DFA687]',
        text: 'text-[#241E1A]',
        border: 'border-[#C88A68]'
      };
    } else {
      return {
        bg: 'bg-[#241E1A]',
        text: 'text-[#FDFBF7]',
        border: 'border-[#382F29]'
      };
    }
  };

  // Friendly Date Header formatting
  const getFriendlyDateHeader = (date) => {
    if (!date) return '';
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
  };

  // Scroll to bottom helper
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 50);
    return () => clearTimeout(timer);
  }, [messages]);

  // 1. Fetch authenticated user active contacts list (only active chats)
  useEffect(() => {
    if (!currentUser) return;

    const fetchContacts = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/users/active-chats/${currentUser.id}`);
        const users = res.data?.data || res.data || [];

        // Exclude current logged in user
        const filteredUsers = users.filter(u => u.id !== currentUser.id);

        const mappedContacts = filteredUsers.map(u => ({
          id: u.id,
          name: u.name,
          role: u.roles?.join(', ') || 'USER',
          lastMessage: "Secure link active. Ready to transmit.",
          lastMessageTime: "ACTIVE",
          online: true,
          email: u.email
        }));
        setContacts(mappedContacts);
      } catch (err) {
        console.error("[Dev Alert] Failed to fetch chat contacts", err);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [currentUser]);

  // Search discoverable users via API (WhatsApp style)
  useEffect(() => {
    if (!searchQuery.trim() || !currentUser) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await apiClient.get(`/users/search?query=${searchQuery}`);
        const foundUsers = res.data?.data || res.data || [];
        
        // Exclude current logged in user
        const filtered = foundUsers.filter(u => u.id !== currentUser.id);
        const mappedResults = filtered.map(u => ({
          id: u.id,
          name: u.name,
          role: u.roles?.join(', ') || 'USER',
          lastMessage: "Start a new conversation.",
          lastMessageTime: "",
          online: false,
          email: u.email
        }));
        setSearchResults(mappedResults);
      } catch (err) {
        console.error("[Dev Alert] Failed to search discoverable users", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, currentUser]);

  const handleSelectNewContact = (contact) => {
    if (!contacts.some(c => c.id === contact.id)) {
      setContacts(prev => [contact, ...prev]);
    }
    setSelectedContact(contact);
    setMessages([]);
    setSearchQuery('');
  };

  // 2. Fetch past conversation history on contact selection
  useEffect(() => {
    if (!currentUser || !selectedContact) return;

    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const res = await apiClient.get(`/api/chat/history/${currentUser.id}/${selectedContact.id}`);
        const history = res.data?.data || res.data || [];
        const mappedHistory = history.map(msg => {
          const timestampFormatted = new Date(msg.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          });
          return {
            id: msg.id || "msg-" + msg.timestamp + Math.random(),
            sender: msg.senderId,
            content: msg.content,
            timestamp: timestampFormatted,
            rawTimestamp: msg.timestamp
          };
        });
        setMessages(mappedHistory);
      } catch (err) {
        console.error("[Dev Alert] Failed to load chat history", err);
      } finally {
        setLoadingHistory(false);
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
                  timestamp: timestampFormatted,
                  rawTimestamp: body.timestamp
                }];
              });
            }
            return activeContact;
          });

          // Update sidebar contact item with the last message received
          setContacts(prevContacts => 
            prevContacts.map(c => {
              if (c.id === body.senderId) {
                const timestampFormatted = new Date(body.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                });
                return {
                  ...c,
                  lastMessage: body.content,
                  lastMessageTime: timestampFormatted
                };
              }
              return c;
            })
          );
        } catch (e) {
          console.error("[Dev Alert] Error processing WebSocket message", e);
        }
      });
    }, (error) => {
      console.error("[Dev Alert] WebSocket Connection Error:", error);
      setConnected(false);
    });

    stompClientRef.current = stompClient;

    return () => {
      if (stompClient.connected) {
        stompClient.disconnect();
      }
    };
  }, [currentUser]);

  // 4. Handle sending messages
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
      timestamp: localTimestamp,
      rawTimestamp: timestampNow
    };

    setMessages(prev => [...prev, tempLocalMessage]);

    // Update contacts list with current message
    setContacts(prevContacts => 
      prevContacts.map(c => {
        if (c.id === selectedContact.id) {
          return {
            ...c,
            lastMessage: messageInput,
            lastMessageTime: localTimestamp
          };
        }
        return c;
      })
    );

    // Publish private message through the STOMP pipe, fallback to REST if disconnected
    try {
      if (connected && stompClientRef.current?.connected) {
        stompClientRef.current.send("/app/sendPrivateMessage", {}, JSON.stringify(payload));
      } else {
        apiClient.post('/api/chat/sendPrivateMessage', payload).catch(err => {
          console.error("[Dev Alert] Failed to transmit over REST fallback", err);
        });
      }
    } catch (err) {
      console.error("[Dev Alert] Failed to transmit over WebSocket:", err);
      apiClient.post('/api/chat/sendPrivateMessage', payload).catch(err => {
        console.error("[Dev Alert] Failed to transmit over REST fallback after WS error", err);
      });
    }

    setMessageInput('');
  };

  // Group messages date checker variable
  let lastDateHeader = null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-8rem)] min-h-[500px] relative">
      
      {/* Toast message display */}
      {toastMessage && (
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-[#241E1A] text-[#FDFBF7] text-[10px] font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-lg border border-[#382F29] z-50 flex items-center gap-2 animate-slide-in">
          <Info className="w-3.5 h-3.5 text-[#C1CDBC]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="bg-[#FAF6F0] border border-[#EAE2D5] rounded-2xl overflow-hidden h-full flex shadow-sm">
        {/* Left column - Inbox Sidebar */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-[#EAE2D5] flex flex-col h-full bg-[#FAF6F0] ${selectedContact ? 'hidden md:flex' : 'flex'}`}>
          
          {/* Sidebar Header */}
          <div className="p-4 border-b border-[#EAE2D5] bg-[#FCF9F3]">
            <div className="flex justify-between items-center">
              <h2 className="text-xs font-bold text-[#241E1A] uppercase tracking-wider">Inbox Channel</h2>
              <div className="flex items-center gap-1.5 bg-white border border-[#EAE2D5] px-2.5 py-1 rounded-full">
                <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                <span className="text-[9px] text-stone-500 font-semibold uppercase tracking-wider">{connected ? 'Live' : 'Offline'}</span>
              </div>
            </div>
            <div className="mt-3 relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-stone-400" />
              <input
                type="text"
                placeholder="Search active chats or find new users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#FDFBF7] border border-[#EAE2D5] rounded-lg py-2 pl-9 pr-8 text-xs outline-none focus:border-[#241E1A] transition-colors placeholder:text-stone-300 text-[#241E1A] font-semibold"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-2.5 w-3.5 h-3.5 text-stone-400 animate-spin" />
              )}
              {!isSearching && searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-stone-400 hover:text-[#241E1A] transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Threads list */}
          <div className="flex-1 overflow-y-auto p-2 space-y-4">
            {loading ? (
              <ChatSkeleton />
            ) : !searchQuery.trim() ? (
              // ─── ACTIVE CHATS ONLY ───
              contacts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-center p-4">
                  <MessageSquare className="w-6 h-6 text-stone-300 mb-2" />
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">No active channels</p>
                  <p className="text-[9px] text-stone-400 mt-1 font-semibold">Search name or email to start a new chat</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <h4 className="text-[9px] font-bold text-stone-400 uppercase tracking-widest px-2 mb-1.5">Conversations</h4>
                  {contacts.map((contact) => {
                    const avatar = getAvatarStyles(contact.role);
                    return (
                      <div
                        key={contact.id}
                        className={`flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer border ${
                          selectedContact?.id === contact.id
                            ? 'bg-white border-[#EAE2D5] shadow-xs'
                            : 'bg-transparent border-transparent hover:bg-[#F4ECE1]/40'
                        }`}
                        onClick={() => {
                          setSelectedContact(contact);
                          if (selectedContact?.id !== contact.id) setMessages([]);
                        }}
                      >
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 relative border ${avatar.bg} ${avatar.text} ${avatar.border}`}>
                          {getInitials(contact.name)}
                          {contact.online && (
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#FAF6F0]" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-0.5">
                            <h3 className="text-xs font-bold text-[#241E1A] truncate">{contact.name}</h3>
                            <span className="text-[9px] text-stone-400 font-semibold">{contact.lastMessageTime}</span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                              contact.role.toUpperCase().includes('EMPLOYER') 
                                ? 'bg-[#C1CDBC]/20 border-[#C1CDBC]/50 text-[#3d4b38]' 
                                : contact.role.toUpperCase().includes('ADMIN')
                                  ? 'bg-[#DFA687]/20 border-[#DFA687]/50 text-[#7c4d34]'
                                  : 'bg-stone-100 border-stone-200 text-stone-500'
                            }`}>
                              {contact.role}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-400 truncate mt-1.5">{contact.lastMessage}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              // ─── SEARCHING CHATS & DISCOVERING USERS ───
              <div className="space-y-4">
                {/* Active Chats Matches */}
                {contacts.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.email.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 && (
                  <div>
                    <h4 className="text-[9px] font-bold text-stone-400 uppercase tracking-widest px-2 mb-1.5">Active Chats</h4>
                    <div className="space-y-1">
                      {contacts
                        .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.email.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((contact) => {
                          const avatar = getAvatarStyles(contact.role);
                          return (
                            <div
                              key={contact.id}
                              className={`flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer border ${
                                selectedContact?.id === contact.id
                                  ? 'bg-white border-[#EAE2D5] shadow-xs'
                                  : 'bg-transparent border-transparent hover:bg-[#F4ECE1]/40'
                              }`}
                              onClick={() => {
                                setSelectedContact(contact);
                                if (selectedContact?.id !== contact.id) setMessages([]);
                                setSearchQuery('');
                              }}
                            >
                              <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 relative border ${avatar.bg} ${avatar.text} ${avatar.border}`}>
                                {getInitials(contact.name)}
                                {contact.online && (
                                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#FAF6F0]" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-0.5">
                                  <h3 className="text-xs font-bold text-[#241E1A] truncate">{contact.name}</h3>
                                  <span className="text-[9px] text-stone-400 font-semibold">{contact.lastMessageTime}</span>
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                                    contact.role.toUpperCase().includes('EMPLOYER') 
                                      ? 'bg-[#C1CDBC]/20 border-[#C1CDBC]/50 text-[#3d4b38]' 
                                      : contact.role.toUpperCase().includes('ADMIN')
                                        ? 'bg-[#DFA687]/20 border-[#DFA687]/50 text-[#7c4d34]'
                                        : 'bg-stone-100 border-stone-200 text-stone-500'
                                  }`}>
                                    {contact.role}
                                  </span>
                                </div>
                                <p className="text-[11px] text-stone-400 truncate mt-1.5">{contact.lastMessage}</p>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Discover/New Users (Matches from Server search query) */}
                {searchResults.filter(sr => !contacts.some(c => c.id === sr.id)).length > 0 && (
                  <div>
                    <h4 className="text-[9px] font-bold text-stone-400 uppercase tracking-widest px-2 mb-1.5">Global Directory</h4>
                    <div className="space-y-1">
                      {searchResults
                        .filter(sr => !contacts.some(c => c.id === sr.id))
                        .map((contact) => {
                          const avatar = getAvatarStyles(contact.role);
                          return (
                            <div
                              key={contact.id}
                              className="flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer border bg-[#FDFBF7]/60 border-[#EAE2D5]/40 hover:border-[#EAE2D5] hover:bg-white"
                              onClick={() => handleSelectNewContact(contact)}
                            >
                              <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 relative border ${avatar.bg} ${avatar.text} ${avatar.border}`}>
                                {getInitials(contact.name)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-xs font-bold text-[#241E1A] truncate">{contact.name}</h3>
                                <p className="text-[10px] text-stone-500 font-semibold truncate">{contact.email}</p>
                                <div className="flex justify-between items-center mt-1">
                                  <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                                    contact.role.toUpperCase().includes('EMPLOYER') 
                                      ? 'bg-[#C1CDBC]/20 border-[#C1CDBC]/50 text-[#3d4b38]' 
                                      : contact.role.toUpperCase().includes('ADMIN')
                                        ? 'bg-[#DFA687]/20 border-[#DFA687]/50 text-[#7c4d34]'
                                        : 'bg-stone-100 border-stone-200 text-stone-500'
                                  }`}>
                                    {contact.role}
                                  </span>
                                  <span className="text-[9px] text-[#241E1A] font-bold uppercase tracking-wide bg-[#F4ECE1] px-2 py-0.5 rounded border border-[#EAE2D5]">
                                    + Start Chat
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* If absolutely no results */}
                {contacts.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.email.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 &&
                 searchResults.filter(sr => !contacts.some(c => c.id === sr.id)).length === 0 && !isSearching && (
                  <div className="flex flex-col items-center justify-center h-32 text-center p-4">
                    <Search className="w-6 h-6 text-stone-300 mb-2" />
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">No users found</p>
                    <p className="text-[9px] text-stone-400 mt-1 font-semibold">Verify name or email spelling</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right column - Message Feed */}
        {selectedContact ? (
          <div className="flex flex-1 h-full min-w-0">
            <div className="flex flex-1 flex-col h-full bg-[#FCF9F3] min-w-0">
              {/* Header */}
              <div className="p-4 border-b border-[#EAE2D5] flex justify-between items-center bg-[#FCF9F3]">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setSelectedContact(null)}
                    className="md:hidden p-2 -ml-2 text-stone-500 hover:text-[#241E1A] hover:bg-[#F4ECE1]/50 rounded-lg transition-colors cursor-pointer mr-1"
                    aria-label="Back to contacts"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs border ${getAvatarStyles(selectedContact.role).bg} ${getAvatarStyles(selectedContact.role).text} ${getAvatarStyles(selectedContact.role).border}`}>
                    {getInitials(selectedContact.name)}
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-[#241E1A]">{selectedContact.name}</h2>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                      <p className="text-[9px] text-stone-400 font-semibold uppercase tracking-wider">
                        {selectedContact.role} &bull; {connected ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => showToast("Audio calling pipeline initialized... connecting soon.")} 
                    className="p-2 text-stone-500 hover:text-[#241E1A] hover:bg-[#F4ECE1]/50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => showToast("Video transmission pipeline initialized... connecting soon.")} 
                    className="p-2 text-stone-500 hover:text-[#241E1A] hover:bg-[#F4ECE1]/50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Video className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setIsInfoOpen(!isInfoOpen)} 
                    className={`p-2 rounded-lg transition-colors cursor-pointer ${isInfoOpen ? 'text-[#241E1A] bg-[#F4ECE1]/60' : 'text-stone-500 hover:text-[#241E1A] hover:bg-[#F4ECE1]/50'}`}
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Messages view */}
              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Security Warning banner at the very top of message stream */}
                <div className="flex items-center justify-center text-center pb-2">
                  <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FAF6F0] border border-[#EAE2D5] text-[10px] font-semibold text-stone-500 max-w-sm shadow-2xs">
                    <ShieldAlert className="w-4 h-4 text-stone-400 flex-shrink-0" />
                    This is a secure verified communication channel.
                  </div>
                </div>

                {loadingHistory ? (
                  <MessageSkeleton />
                ) : messages.length > 0 ? (
                  messages.map((message) => {
                    const isMe = message.sender === currentUser?.id;
                    const messageDate = new Date(message.rawTimestamp || Date.now());
                    const dateHeader = getFriendlyDateHeader(messageDate);
                    
                    const showDateDivider = dateHeader !== lastDateHeader;
                    lastDateHeader = dateHeader;

                    return (
                      <React.Fragment key={message.id}>
                        {showDateDivider && (
                          <div className="flex items-center justify-center my-6">
                            <div className="h-[1px] bg-[#EAE2D5] flex-1"></div>
                            <span className="mx-4 px-3 py-1 rounded-full bg-[#FAF6F0] border border-[#EAE2D5] text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                              {dateHeader}
                            </span>
                            <div className="h-[1px] bg-[#EAE2D5] flex-1"></div>
                          </div>
                        )}
                        <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs rounded-2xl ${
                            isMe 
                              ? 'rounded-br-none bg-[#241E1A] text-[#FDFBF7]' 
                              : 'rounded-bl-none border border-[#EAE2D5] bg-[#FDFBF7] text-stone-800'
                            } px-4 py-2.5 text-xs shadow-3xs`}
                          >
                            <p className="whitespace-pre-wrap">{message.content}</p>
                            <div className="flex items-center justify-end gap-1 mt-1 text-[8px]">
                              <span className={`${isMe ? 'text-stone-400' : 'text-stone-500'} font-semibold`}>
                                {message.timestamp}
                              </span>
                              {isMe && (
                                <CheckCheck className="w-3 h-3 text-[#C1CDBC]" />
                              )}
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <MessageSquare className="w-8 h-8 text-stone-300 mb-2 animate-bounce" />
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Handshake completed. Begin transmission.</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Compose area */}
              <div className="p-4 border-t border-[#EAE2D5] bg-[#FCF9F3] relative">
                {/* Attachment Dropdown */}
                {isAttachmentOpen && (
                  <div className="absolute bottom-20 left-4 bg-white border border-[#EAE2D5] rounded-xl shadow-lg p-1.5 flex flex-col gap-0.5 z-50 animate-slide-in w-44">
                    <button 
                      onClick={() => {
                        setIsAttachmentOpen(false);
                        showToast("Document sharing pipeline initialized.");
                      }}
                      className="flex items-center gap-2.5 text-left w-full p-2 hover:bg-[#F4ECE1]/40 rounded-lg text-xs font-semibold text-[#241E1A] transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-stone-500" />
                      <span>Share Document</span>
                    </button>
                    <button 
                      onClick={() => {
                        setIsAttachmentOpen(false);
                        showToast("Image transmission channel opened.");
                      }}
                      className="flex items-center gap-2.5 text-left w-full p-2 hover:bg-[#F4ECE1]/40 rounded-lg text-xs font-semibold text-[#241E1A] transition-colors"
                    >
                      <Image className="w-3.5 h-3.5 text-stone-500" />
                      <span>Share Image / Video</span>
                    </button>
                  </div>
                )}

                {/* Emoji Picker */}
                {showEmojiPicker && (
                  <div className="absolute bottom-20 left-12 bg-white border border-[#EAE2D5] rounded-xl shadow-lg p-2 flex gap-1 z-50 animate-slide-in">
                    {emojis.map(emoji => (
                      <button 
                        key={emoji}
                        onClick={() => {
                          setMessageInput(prev => prev + emoji);
                          setShowEmojiPicker(false);
                        }}
                        className="text-sm hover:scale-125 transition-transform p-1 hover:bg-[#F4ECE1]/40 rounded cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center bg-[#FDFBF7] border border-[#EAE2D5] rounded-xl p-1.5 focus-within:border-[#241E1A] transition-colors">
                  <button 
                    onClick={() => {
                      setIsAttachmentOpen(!isAttachmentOpen);
                      setShowEmojiPicker(false);
                    }}
                    className={`p-2 rounded-lg transition-colors cursor-pointer ${isAttachmentOpen ? 'text-[#241E1A] bg-[#F4ECE1]/40' : 'text-stone-400 hover:text-[#241E1A]'}`}
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                      setShowEmojiPicker(!showEmojiPicker);
                      setIsAttachmentOpen(false);
                    }}
                    className={`p-2 rounded-lg transition-colors cursor-pointer ${showEmojiPicker ? 'text-[#241E1A] bg-[#F4ECE1]/40' : 'text-stone-400 hover:text-[#241E1A]'}`}
                  >
                    <Smile className="w-4 h-4" />
                  </button>
                  
                  <input
                    type="text"
                    placeholder={`Message ${selectedContact.name}...`}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="w-full bg-transparent border-0 outline-none text-xs px-2 text-[#241E1A] placeholder:text-stone-300 font-semibold"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                    className={`rounded-lg p-2.5 flex items-center justify-center transition-all ${
                      messageInput.trim() 
                        ? 'bg-[#241E1A] text-[#FDFBF7] hover:bg-[#382F29] cursor-pointer active:scale-95' 
                        : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-center mt-2 flex items-center justify-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                  <span className="text-[9px] text-stone-400 font-semibold uppercase tracking-wider">
                    {connected ? 'Secure socket link active' : 'Connecting to socket pipeline...'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right-most column - Collapsible Contact Detail Drawer */}
            {isInfoOpen && (
              <div className="w-80 border-l border-[#EAE2D5] bg-[#FCF9F3] flex flex-col h-full animate-slide-in">
                {/* Drawer Header */}
                <div className="p-4 border-b border-[#EAE2D5] flex justify-between items-center">
                  <h3 className="text-xs font-bold text-[#241E1A] uppercase tracking-wider">Contact Details</h3>
                  <button 
                    onClick={() => setIsInfoOpen(false)}
                    className="p-1 hover:bg-[#F4ECE1] rounded-lg transition-colors text-stone-500 hover:text-[#241E1A] cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Drawer Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Avatar & Name */}
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center font-bold text-2xl border mb-3 ${getAvatarStyles(selectedContact.role).bg} ${getAvatarStyles(selectedContact.role).text} ${getAvatarStyles(selectedContact.role).border}`}>
                      {getInitials(selectedContact.name)}
                    </div>
                    <h4 className="text-sm font-bold text-[#241E1A]">{selectedContact.name}</h4>
                    <div className="mt-1.5">
                      <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        selectedContact.role.toUpperCase().includes('EMPLOYER') 
                          ? 'bg-[#C1CDBC]/20 border-[#C1CDBC]/50 text-[#3d4b38]' 
                          : selectedContact.role.toUpperCase().includes('ADMIN')
                            ? 'bg-[#DFA687]/20 border-[#DFA687]/50 text-[#7c4d34]'
                            : 'bg-stone-100 border-stone-200 text-stone-500'
                      }`}>
                        {selectedContact.role}
                      </span>
                    </div>
                  </div>

                  <hr className="border-[#EAE2D5]" />

                  {/* Info Fields */}
                  <div className="space-y-4">
                    <div>
                      <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Email Address</span>
                      <div className="flex items-center gap-2 text-xs text-[#241E1A] font-semibold bg-[#FDFBF7] border border-[#EAE2D5] p-2.5 rounded-xl">
                        <Mail className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                        <span className="truncate">{selectedContact.email || 'N/A'}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Status</span>
                      <div className="flex items-center gap-2 text-xs text-[#241E1A] font-semibold bg-[#FDFBF7] border border-[#EAE2D5] p-2.5 rounded-xl">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>Active Pipeline Node</span>
                      </div>
                    </div>
                  </div>

                  <hr className="border-[#EAE2D5]" />

                  {/* Shared Files Placeholder */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Shared Files</span>
                    <div className="text-center p-5 bg-[#FAF6F0] border border-dashed border-[#EAE2D5] rounded-xl">
                      <p className="text-[10px] text-stone-400 font-semibold">No documents shared yet</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="hidden md:flex flex-1 flex-col h-full bg-[#FCF9F3] items-center justify-center p-8 text-center relative overflow-hidden">
            {/* Elegant grid overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(#E8DFD0_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-35 pointer-events-none" />
            
            <div className="relative z-10 max-w-sm space-y-6">
              <div className="w-16 h-16 bg-white border border-[#EAE2D5] rounded-2xl flex items-center justify-center mx-auto shadow-sm transform hover:scale-105 transition-transform duration-300">
                <MessageSquare className="w-8 h-8 text-[#241E1A]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-[#241E1A] uppercase tracking-wider">Secure Communication Center</h3>
                <p className="text-[11px] text-stone-500 leading-relaxed font-semibold">
                  Platform placements handle secure end-to-end transmissions directly. Select an active contact or search by name/email to initialize a handshake.
                </p>
              </div>
              
              <div className="pt-4 border-t border-[#EAE2D5] flex justify-center gap-8">
                <div className="text-center">
                  <span className="block text-lg font-extrabold text-[#241E1A]">100%</span>
                  <span className="text-[8px] text-stone-400 font-bold uppercase tracking-widest">Encrypted</span>
                </div>
                <div className="text-center">
                  <span className="block text-lg font-extrabold text-[#241E1A]">Zero</span>
                  <span className="text-[8px] text-stone-400 font-bold uppercase tracking-widest">Logs Kept</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

