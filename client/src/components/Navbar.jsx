import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Home, Bell, User, LogOut, Users, PlusCircle, Search } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import SearchBar from "./SearchBar";
import axios from "axios"; // Make sure axios is installed

const Navbar = () => {
  const { logout, currentUser } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  // 1. Logic to fetch unread count from your Flask backend
  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/notifications/unread_count", {
        withCredentials: true, // Required for Flask-Login session cookies
      });
      setUnreadCount(response.data.unread_count);
    } catch (error) {
      console.error("Error fetching notification count:", error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchUnreadCount();
      
      // Optional: Poll every 30 seconds to update the badge without refreshing
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  if (!currentUser) return null;

  return (
    <nav className="bg-gray-900 text-white px-4 h-16 flex items-center justify-between shadow-md mb-1">
      {/* Brand */}
      <div className="flex items-center space-x-2 text-xl font-bold text-white">
        <Link to="/" className="text-2xl">Acadlinker</Link>
      </div>

      {/* Search Bar */}
      <SearchBar />

      {/* Links */}
      <ul className="flex items-center space-x-4">
        <li>
          <Link to="/" className="hover:text-gray-300">Home</Link>
        </li>
        <li>
          <Link to={`/profile/${currentUser.id}`} className="hover:text-gray-300">Profile</Link>
        </li>
        <li>
          <Link to="/friends" className="hover:text-gray-300">Friends</Link>
        </li>
        <li>
          <Link to="/chat" className="hover:text-gray-300">Chat</Link>
        </li>

        {/* Notifications Icon with Badge */}
        <li className="relative">
          <Link to="/notifications" className="hover:text-gray-300 flex items-center">
            <Bell className="w-5 h-5 mr-1" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-600 text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full text-white animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
        </li>

        <li>
          <button
            onClick={logout}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md flex items-center transition-colors"
          >
            <LogOut className="w-4 h-4 mr-1" /> Logout
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;