import React, { useEffect, useState } from "react";
import api from "../api/axios"; // your global axios instance

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const res = await api.get("/api/posts/home");   // ✅ Correct URL
      setPosts(res.data);
    } catch (error) {
      console.error("Failed to load posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="w-full flex justify-center py-10">
        <span className="text-gray-600 text-lg">Loading posts...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-6 space-y-6">
      {posts.length === 0 ? (
        <div className="text-center text-gray-500">No posts yet.</div>
      ) : (
        posts.map((post) => (
          <div
            key={post.id}
            className="bg-white shadow-md rounded-xl p-5 border border-gray-100"
          >
            {/* Author */}
            <div className="flex items-center gap-3 mb-3">
              <img
                src={post.author.profile_pic || "/default-user.png"}
                alt="profile"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold">{post.author.name}</p>
                <p className="text-xs text-gray-500">
                  {new Date(post.date_posted).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold">{post.title}</h2>

            {/* Description */}
            {post.description && (
              <p className="text-gray-700 mt-1">{post.description}</p>
            )}

            {/* Image */}
            {post.file_url && (
              <img
                src={
                  post.file_url.startsWith("http")
                    ? post.file_url
                    : `http://localhost:5000${post.file_url}`
                }
                alt="Post"
                className="rounded-xl mt-4 w-full object-cover"
              />
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default PostList;
