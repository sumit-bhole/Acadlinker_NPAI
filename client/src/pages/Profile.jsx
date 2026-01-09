import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import UserPosts from "../components/UserPosts";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const Profile = () => {
  const { currentUser } = useAuth();
  const { userId } = useParams();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isCurrentUser =
    currentUser && currentUser.id === parseInt(userId);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/profile/${userId}`);
        setUser(res.data);
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  /* ---------------- Friend Actions ---------------- */

  const sendFriendRequest = async () => {
    await axios.post(`/api/friends/send/${user.id}`, {}, { withCredentials: true });
    setUser((p) => ({ ...p, request_sent: true }));
  };

  const acceptFriendRequest = async () => {
    await axios.post(`/api/friends/accept/${user.request_id}`, {}, { withCredentials: true });
    setUser((p) => ({ ...p, is_friend: true, request_received: false }));
  };

  const rejectFriendRequest = async () => {
    await axios.post(`/api/friends/reject/${user.request_id}`, {}, { withCredentials: true });
    setUser((p) => ({ ...p, request_received: false }));
  };

  /* ---------------- Button Renderer ---------------- */

  const renderFriendButton = () => {
    const base =
      "px-6 py-2.5 rounded-full font-medium transition shadow-sm";

    if (isCurrentUser) {
      return (
        <Link
          to="/edit-profile"
          className={`${base} bg-white border border-gray-300 hover:bg-gray-50`}
        >
          Edit Profile
        </Link>
      );
    }

    if (user.is_friend) {
      return (
        <Link
          to={`/messages/${user.id}`}
          className={`${base} bg-indigo-600 text-white hover:bg-indigo-700`}
        >
          Message
        </Link>
      );
    }

    if (user.request_sent) {
      return (
        <button className={`${base} bg-gray-100 text-gray-400 cursor-not-allowed`}>
          Request Sent
        </button>
      );
    }

    if (user.request_received) {
      return (
        <div className="flex gap-2">
          <button
            onClick={acceptFriendRequest}
            className={`${base} bg-indigo-600 text-white hover:bg-indigo-700`}
          >
            Accept
          </button>
          <button
            onClick={rejectFriendRequest}
            className={`${base} bg-white border border-red-200 text-red-600 hover:bg-red-50`}
          >
            Reject
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={sendFriendRequest}
        className={`${base} bg-indigo-600 text-white hover:bg-indigo-700`}
      >
        Add Friend
      </button>
    );
  };

  /* ---------------- States ---------------- */

  if (loading) {
    return (
      <div className="text-center py-40 text-gray-500">
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-40 text-red-500">
        User not found
      </div>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">

      {/* ---------------- HEADER ---------------- */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

          {/* Cover */}
          <div className="h-48 w-full bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100">
            {user.cover_photo_url && (
              <img
                src={user.cover_photo_url}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Info */}
          <div className="px-6 pb-6 relative">
            <div className="-mt-16">
              <img
                src={user.profile_pic_url || "/default-profile.png"}
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover"
              />
            </div>

            <div className="mt-4 flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {user.full_name}
                </h1>
                <p className="text-gray-500 mt-1">
                  {user.education || "Engineering Student"}
                </p>

                <div className="flex flex-wrap gap-2 mt-4">
                  {user.skills ? (
                    user.skills.split(",").map((s, i) => (
                      <span
                        key={i}
                        className="px-4 py-1.5 rounded-full bg-gray-100 border text-sm"
                      >
                        {s.trim()}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400 italic">
                      No skills listed
                    </span>
                  )}
                </div>
              </div>

              <div>{renderFriendButton()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- CONTENT ---------------- */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT SIDEBAR */}
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">

            {/* About */}
            <div className="bg-white rounded-2xl border shadow-sm relative overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-2">About</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {user.description ||
                    "This user hasn’t added a bio yet."}
                </p>
              </div>
            </div>

            {/* Intro */}
            <div className="bg-white rounded-2xl border shadow-sm relative overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
              <div className="p-6 space-y-3">
                <h3 className="font-semibold text-lg">Intro</h3>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Education</span>
                  <span className="font-medium text-gray-800">
                    {user.education || "—"}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Email</span>
                  <span className="font-medium text-gray-800">
                    {user.email}
                  </span>
                </div>

                {user.mobile_no && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Phone</span>
                    <span className="font-medium text-gray-800">
                      {user.mobile_no}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* POSTS */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h3 className="text-xl font-semibold">Activity</h3>
                <p className="text-sm text-gray-500">
                  Recent posts and updates
                </p>
              </div>

              <div className="p-6">
                <UserPosts
                  userId={userId}
                  isCurrentUser={isCurrentUser}
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
