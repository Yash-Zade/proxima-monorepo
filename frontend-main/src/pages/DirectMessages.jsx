import React, { useState, useEffect, useRef, useContext } from 'react';
import { Send, Phone, Video, Search, Info, Paperclip, MessageSquare, ShieldAlert } from 'lucide-react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import apiClient from '../lib/apiClient';
import { AuthContext } from '../context/AuthContext';

export default function DirectMessages() {
  const { user } = useContext(AuthContext);
  const currentUser = user;

  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  const stompClientRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Get Initials for User Avatars
  const getInitials = (name) => {
    return name ? name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase() : 'U';
  };

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 1. Fetch authenticated user contacts list
  useEffect(() => {
    if (!currentUser) return;

    const fetchContacts = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/users/all');
        const users = res.data?.data || res.data || [];

        // Exclude current logged in user
        const filteredUsers = users.filter(u => u.id !== currentUser.id);

        const mappedContacts = filteredUsers.map(u => ({
          id: u.id,
          name: u.name,
          role: u.roles?.join(', ') || 'USER',
          lastMessage: "System initialized. Secure link active.",
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

  // 2. Fetch past conversation history on contact selection
  useEffect(() => {
    if (!currentUser || !selectedContact) return;

    const fetchHistory = async () => {
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
            timestamp: timestampFormatted
          };
        });
        setMessages(mappedHistory);
      } catch (err) {
        console.error("[Dev Alert] Failed to load chat history", err);
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
      timestamp: localTimestamp
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-8rem)] min-h-[500px]">
      <div className="bg-[#FAF6F0] border border-[#EAE2D5] rounded-2xl overflow-hidden h-full flex shadow-sm">
        {/* Left column - Inbox Sidebar */}
        <div className="w-full md:w-80 lg:w-96 border-r border-[#EAE2D5] flex flex-col h-full bg-[#FAF6F0]">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-[#EAE2D5] bg-[#FCF9F3]">
            <div className="flex justify-between items-center">
              <h2 className="text-xs font-bold text-[#241E1A] uppercase tracking-wider">Inbox Channel</h2>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                <span className="text-[9px] text-stone-500 font-semibold uppercase tracking-wider">{connected ? 'Live' : 'Offline'}</span>
              </div>
            </div>
            <div className="mt-3 relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-stone-400" />
              <input
                type="text"
                placeholder="Search active chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#FDFBF7] border border-[#EAE2D5] rounded-lg py-2 pl-9 pr-4 text-xs outline-none focus:border-[#241E1A] transition-colors placeholder:text-stone-300 text-[#241E1A] font-semibold"
              />
            </div>
          </div>

          {/* Threads list */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest animate-pulse">Establishing secure handshake...</p>
              </div>
            ) : contacts.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center p-4">
                <MessageSquare className="w-6 h-6 text-stone-300 mb-2" />
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">No active channels found</p>
              </div>
            ) : (
              contacts
                .filter(contact => contact.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((contact) => (
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
                    <div className="w-9 h-9 rounded-lg bg-[#241E1A] text-[#FDFBF7] flex items-center justify-center font-bold text-sm flex-shrink-0 relative">
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
                      <p className="text-[10px] text-stone-500 font-semibold truncate">{contact.role}</p>
                      <p className="text-[11px] text-stone-400 truncate mt-1">{contact.lastMessage}</p>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Right column - Message Feed */}
        {selectedContact ? (
          <div className="flex flex-1 flex-col h-full bg-[#FCF9F3]">
            {/* Header */}
            <div className="p-4 border-b border-[#EAE2D5] flex justify-between items-center bg-[#FCF9F3]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#241E1A] text-[#FDFBF7] flex items-center justify-center font-bold text-xs">
                  {getInitials(selectedContact.name)}
                </div>
                <div>
                  <h2 className="text-xs font-bold text-[#241E1A]">{selectedContact.name}</h2>
                  <p className="text-[9px] text-stone-400 font-semibold">{selectedContact.role} &bull; {connected ? 'Online' : 'Offline'}</p>
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
              {/* Security Warning banner at the very top of message stream */}
              <div className="flex items-center justify-center text-center pb-4">
                <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FAF6F0] border border-[#EAE2D5] text-[10px] font-semibold text-stone-500 max-w-sm">
                  <ShieldAlert className="w-4 h-4 text-stone-400 flex-shrink-0" />
                  This is a secure verified communication channel.
                </div>
              </div>

              {messages.length > 0 ? (
                messages.map((message) => {
                  const isMe = message.sender === currentUser?.id;
                  return (
                    <div key={message.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs rounded-2xl ${
                        isMe 
                          ? 'rounded-br-none bg-[#241E1A] text-[#FDFBF7]' 
                          : 'rounded-bl-none border border-[#EAE2D5] bg-[#FDFBF7] text-stone-800'
                        } px-4 py-2.5 text-xs`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        <span className={`text-[8px] block mt-1 ${isMe ? 'text-stone-400' : 'text-stone-500'} font-semibold text-right`}>
                          {message.timestamp}
                        </span>
                      </div>
                    </div>
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
            <div className="p-4 border-t border-[#EAE2D5] bg-[#FCF9F3]">
              <div className="flex items-center bg-[#FDFBF7] border border-[#EAE2D5] rounded-xl p-1.5 focus-within:border-[#241E1A] transition-colors">
                <button disabled className="p-2 text-stone-300 cursor-not-allowed"><Paperclip className="w-4 h-4" /></button>
                <input
                  type="text"
                  placeholder="Transmit response to node..."
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
                      ? 'bg-[#241E1A] text-[#FDFBF7] hover:bg-[#382F29] cursor-pointer' 
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
        ) : (
          <div className="hidden md:flex flex-1 flex-col h-full bg-[#FCF9F3] items-center justify-center p-8 text-center">
            <div className="w-12 h-12 bg-[#FAF6F0] border border-[#EAE2D5] rounded-xl flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-stone-400" />
            </div>
            <h3 className="text-xs font-bold text-[#241E1A] uppercase tracking-wider">No active pipeline</h3>
            <p className="text-[11px] text-stone-400 mt-1 max-w-xs font-semibold">
              Select a verified node from the left channel list to initialize a secure communication handshake.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
