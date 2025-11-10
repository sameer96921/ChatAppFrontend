import React, { useEffect, useState } from "react";
import axios from "axios";

const ChatLayout = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9090/api";

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token"); // ✅ get saved JWT token
        const res = await axios.get(`${API_URL}/auth/users`, {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ send token in headers
          },
        });

        if (res.data.success) {
          setUsers(res.data.users);
          setSelectedUser(res.data.users[0]);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load users. Please login again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [API_URL]);

  const dummyMessages = [
    { sender: "You", text: "Hey there!" },
    { sender: "Friend", text: "Hi! How are you?" },
    { sender: "You", text: "Doing great, thanks 😄" },
  ];

  if (loading) return <p className="text-center mt-10">Loading users...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar */}
      <div className="w-1/4 bg-white shadow-md border-r">
        <h2 className="text-xl font-semibold p-4 border-b">Chats</h2>
        <ul>
          {users.map((user) => (
            <li
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`p-4 cursor-pointer hover:bg-gray-100 ${
                selectedUser?._id === user._id ? "bg-blue-100" : ""
              }`}
            >
              <h3 className="font-medium text-gray-800">{user.username}</h3>
              <p className="text-sm text-gray-500 truncate">{user.email}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Right Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 bg-white shadow-sm border-b flex items-center">
          <h2 className="text-lg font-semibold text-gray-800">
            {selectedUser ? selectedUser.username : "Select a user"}
          </h2>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
          {selectedUser ? (
            dummyMessages.map((msg, index) => (
              <div
                key={index}
                className={`flex mb-3 ${
                  msg.sender === "You" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-2xl max-w-xs ${
                    msg.sender === "You"
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-white text-gray-800 rounded-bl-none shadow-sm"
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center mt-20">
              Select a user to start chatting
            </p>
          )}
        </div>

        {/* Message Input */}
        <div className="p-4 bg-white border-t flex items-center">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="ml-3 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700">
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatLayout;
