import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bell, Trash2, Clock, CheckCircle } from "lucide-react";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/notifications/", {
          withCredentials: true,
        });
        setNotifications(response.data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const deleteNotif = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/notifications/delete/${id}`, {
        withCredentials: true,
      });
      setNotifications(notifications.filter((n) => n.id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  if (loading) return <div className="text-center p-10 text-white">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 bg-gray-900 rounded-lg shadow-xl border border-gray-800">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Bell className="text-blue-500" /> Your Notifications
      </h2>

      {notifications.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <CheckCircle className="mx-auto mb-2 opacity-20" size={48} />
          <p>No notifications yet!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n.id} className="bg-gray-800 p-4 rounded-md border border-gray-700 flex justify-between items-center group">
              <div>
                <p className="text-gray-200">{n.message}</p>
                <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                  <Clock size={12} /> {new Date(n.timestamp).toLocaleString()}
                </span>
              </div>
              <button 
                onClick={() => deleteNotif(n.id)}
                className="text-gray-500 hover:text-red-500 transition-colors p-2"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;