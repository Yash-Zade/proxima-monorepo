import React, { useState, useEffect } from 'react';
import { Send, X, User, Phone, Video, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const Chat = ({ contact, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [currentUser] = useState({ id: 1 });

  // Dummy messages data remains the same
  const dummyMessages = [
    {
      messageId: 1,
      sender: 1,
      receiver: 2,
      messageContent: "Hey, how's your job search going?",
      timestamp: "2024-01-12T10:30:00"
    },
    // ... other messages
  ];

  useEffect(() => {
    setMessages(dummyMessages);
  }, []);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    const newMessage = {
      messageId: Date.now(),
      sender: currentUser.id,
      receiver: contact?.id,
      messageContent: messageInput,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMessage]);
    setMessageInput('');
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(word => word[0]).join('').toUpperCase() : 'U';
  };

  return (
    <motion.div
      className="w-full flex flex-col h-[545px] bg-zinc-950/90 backdrop-blur-xl rounded-lg border border-zinc-800 shadow-2xl overflow-hidden font-sans"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      {/* Chat Header */}
      <div className="p-4 bg-zinc-900/80 border-b border-zinc-800 flex justify-between items-center z-10">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar className="w-10 h-10 border border-zinc-700">
              <AvatarFallback className="bg-zinc-800 text-zinc-300 font-semibold">
                {contact ? getInitials(contact.name) : <User className="w-5 h-5 mx-auto" />}
              </AvatarFallback>
            </Avatar>
            {contact?.online && (
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-zinc-900" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-zinc-100 text-sm tracking-wide">{contact?.name || 'Network Terminal'}</h3>
            <span className="text-xs text-zinc-500">{contact?.online ? 'Connected' : 'Offline'}</span>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          {contact && (
            <>
              <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors">
                <Phone className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors">
                <Video className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            className="p-2 hover:bg-zinc-800 hover:text-red-400 rounded-lg text-zinc-400 transition-colors ml-2"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-950/50">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.messageId}
              className={`flex ${msg.sender === currentUser.id ? 'justify-end' : 'justify-start'}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.sender === currentUser.id
                    ? 'bg-zinc-100 text-zinc-900 rounded-br-sm'
                    : 'bg-zinc-800 text-zinc-100 border border-zinc-700 rounded-bl-sm'
                  }`}
              >
                <p>{msg.messageContent}</p>
                <span className={`text-[10px] mt-1.5 block ${msg.sender === currentUser.id ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Message Input */}
      {contact && (
        <div className="p-3 bg-zinc-900/80 border-t border-zinc-800 z-10">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Transmit message..."
              className="flex-1 px-4 py-2.5 bg-zinc-950 text-zinc-100 text-sm rounded-xl border border-zinc-800 focus:outline-none focus:border-zinc-600 placeholder-zinc-500"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
            />
            <button
              className="p-2.5 bg-zinc-100 hover:bg-zinc-300 text-zinc-900 rounded-xl transition-colors disabled:opacity-50"
              onClick={handleSendMessage}
              disabled={!messageInput.trim()}
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Chat;