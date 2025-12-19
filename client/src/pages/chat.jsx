import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Send, Paperclip, X, MessageSquare, Loader2, MoreVertical, Search } from "lucide-react";

const API_BASE = "http://localhost:5000/api"; 

const ChatApp = () => {
  const [friends, setFriends] = useState([]);
  const [currentFriend, setCurrentFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessageContent, setNewMessageContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea like ChatGPT
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "inherit";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(scrollHeight, 200) + "px";
    }
  }, [newMessageContent]);

  // FETCH FRIEND LIST (Using your original working URL)
  useEffect(() => {
    axios
      .get("/api/friends/list", { withCredentials: true })
      .then((res) => setFriends(res.data))
      .catch(() => console.log("Failed to fetch friends"))
      .finally(() => setLoadingFriends(false));
  }, []);

  // FETCH CHAT HISTORY
// --- Updated loadChat Function ---
  const loadChat = async (friendId) => {
    if (!friendId) return; // Guard clause
    setLoadingChat(true);
    try {
      const res = await axios.get(`${API_BASE}/messages/chat/${friendId}`, {
        withCredentials: true,
      });
      // Set messages from the backend response
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error("Failed to load chat history:", err);
      // Optional: Set messages to empty if fetch fails to avoid showing old friend's chat
      setMessages([]); 
    } finally {
      // finally runs whether the try succeeds OR the catch runs
      setLoadingChat(false);
    }
  };

  // --- Updated useEffect Watcher ---
  useEffect(() => {
    // We watch for the specific ID change
    if (currentFriend?.id) {
      loadChat(currentFriend.id);
    }
  }, [currentFriend?.id]); // Using .id here is the key to fixing your "refresh" issue

  // SEND MESSAGE
  const sendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!currentFriend || (!newMessageContent.trim() && !selectedFile)) return;

    const formData = new FormData();
    if (newMessageContent.trim()) formData.append("content", newMessageContent);
    if (selectedFile) formData.append("file", selectedFile);

    const oldText = newMessageContent;
    const oldFile = selectedFile;

    setNewMessageContent("");
    setSelectedFile(null);

    try {
      const res = await axios.post(
        `${API_BASE}/messages/send/${currentFriend.id}`,
        formData,
        { withCredentials: true }
      );
      setMessages((prev) => [...prev, res.data]);
    } catch (err) {
      console.log("Message sending failed");
      setNewMessageContent(oldText);
      setSelectedFile(oldFile);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-800 antialiased font-sans">
      
      {/* LEFT SIDEBAR */}
      <div className="w-80 lg:w-96 flex flex-col bg-white border-r border-slate-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent flex items-center">
            <MessageSquare className="w-6 h-6 mr-2 text-indigo-600" />
            Chats
          </h1>
        </div>

        <div className="p-4 border-b border-slate-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              placeholder="Search friends..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingFriends ? (
            <div className="flex justify-center p-10"><Loader2 className="animate-spin text-indigo-500" /></div>
          ) : friends.length === 0 ? (
            <p className="text-slate-500 text-center mt-10 text-sm">No friends found.</p>
          ) : (
            friends.map((f) => (
              <div
              key={f.id}
              onClick={() => {
                if (currentFriend?.id === f.id) {
                  // If clicking the SAME friend, just refresh the data without clearing the screen
                  loadChat(f.id);
                } else {
                  // If clicking a DIFFERENT friend, clear chat and switch
                  setMessages([]); 
                  setCurrentFriend(f);
                }
              }}
              className={`flex items-center px-5 py-4 cursor-pointer transition-all border-l-4 ${
                currentFriend?.id === f.id 
                  ? "bg-indigo-50 border-indigo-600 shadow-sm" 
                  : "border-transparent hover:bg-slate-50"
              }`}
            >
                <img 
                  src={f.profile_image || "/default-profile.png"} 
                  className="w-12 h-12 rounded-full object-cover shadow-sm" 
                  alt="profile" 
                />
                <div className="ml-4 overflow-hidden">
                  <h3 className="font-semibold text-slate-900 truncate">{f.name}</h3>
                  <p className="text-xs text-slate-500 truncate">{f.email}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT CHAT AREA */}
      <div className="flex-1 flex flex-col bg-[#f1f5f9]">
        {!currentFriend ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm mb-4">
              <MessageSquare className="w-10 h-10 text-indigo-200" />
            </div>
            <p className="text-sm font-medium">Select a friend to start chatting</p>
          </div>
        ) : (
          <>
            {/* HEADER */}
            <div className="h-16 px-6 bg-white border-b border-slate-200 flex items-center justify-between z-10">
              <div className="flex items-center">
                <img src={currentFriend.profile_image || "/default-profile.png"} className="w-10 h-10 rounded-full object-cover" alt="avatar" />
                <div className="ml-3">
                  <h3 className="font-bold text-sm text-slate-900 leading-tight">{currentFriend.name}</h3>
                  <span className="text-[11px] text-green-500 font-medium italic">Active now</span>
                </div>
              </div>
              <button className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition">
                <MoreVertical size={20}/>
              </button>
            </div>

            {/* CHAT MESSAGES */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingChat ? (
                <div className="flex justify-center pt-10"><Loader2 className="animate-spin text-indigo-500" /></div>
              ) : messages.length === 0 ? (
                <div className="text-center pt-10">
                   <p className="text-slate-400 text-sm italic">Say hello to {currentFriend.name}!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isSender = msg.is_sender; // This depends on your backend serializer
                  return (
                    <div key={msg.id} className={`flex ${isSender ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm text-sm ${
                        isSender ? "bg-indigo-600 text-white rounded-br-none" : "bg-white text-slate-800 border border-slate-100 rounded-bl-none"
                      }`}>
                        {msg.file_url && (
                          <div className="mb-2 rounded-lg overflow-hidden">
                            {msg.file_url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                              <img src={msg.file_url} className="max-h-60 rounded-md" alt="upload" />
                            ) : (
                              <a href={msg.file_url} target="_blank" className="underline text-xs block py-1">Download Attachment</a>
                            )}
                          </div>
                        )}
                        <p className="leading-relaxed">{msg.content}</p>
                        <p className={`text-[10px] mt-1 opacity-70 ${isSender ? "text-right" : "text-left"}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* INPUT AREA (CHATGPT STYLE) */}
            <div className="p-4">
              <div className="max-w-4xl mx-auto relative">
                
                {selectedFile && (
                  <div className="absolute bottom-full left-0 mb-3 p-2 bg-white border rounded-xl shadow-lg flex items-center animate-in fade-in slide-in-from-bottom-2">
                    <span className="text-xs font-medium px-2 text-indigo-600 truncate max-w-[200px]">{selectedFile.name}</span>
                    <button onClick={() => setSelectedFile(null)} className="p-1 hover:bg-slate-100 rounded-full text-slate-400"><X size={14}/></button>
                  </div>
                )}

                <div className="relative bg-white border border-slate-200 rounded-2xl shadow-xl focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all overflow-hidden">
                  <textarea
                    ref={textareaRef}
                    rows="1"
                    value={newMessageContent}
                    onChange={(e) => setNewMessageContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    className="w-full pl-4 pr-24 py-4 bg-transparent border-none focus:ring-0 resize-none text-sm leading-relaxed max-h-[200px]"
                  />
                  
                  <div className="absolute right-3 bottom-3 flex items-center gap-2">
                    <input type="file" id="file-upload" className="hidden" onChange={(e) => setSelectedFile(e.target.files[0])} />
                    <label htmlFor="file-upload" className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl cursor-pointer transition">
                      <Paperclip size={20} />
                    </label>
                    <button
                      onClick={sendMessage}
                      disabled={!newMessageContent.trim() && !selectedFile}
                      className={`p-2.5 rounded-xl transition-all ${
                        newMessageContent.trim() || selectedFile 
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 hover:scale-105" 
                        : "bg-slate-100 text-slate-300"
                      }`}
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-center text-slate-400 mt-2">Press Enter to send, Shift + Enter for new line</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatApp;