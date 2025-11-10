import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const ChatLayout = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const socket = useRef(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);


  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:1000/api";
  const SOCKET_URL = "http://localhost:1000";

  const currentUser = JSON.parse(localStorage.getItem("user")); // { id, email }

  // 🔌 Connect socket once on mount
useEffect(() => {
  if (!currentUser?.id) return;

  socket.current = io(SOCKET_URL, { transports: ["websocket"] });

  socket.current.on("connect", () => {
    console.log("🟢 Connected to backend:", socket.current.id);
    setIsSocketConnected(true);

    // Register user after successful connection
    socket.current.emit("addUser", currentUser.id);

    // Optional: test handshake
    socket.current.emit("clientTest", "Hello from frontend!");
  });

  socket.current.on("disconnect", () => {
    console.log("🔴 Socket disconnected");
    setIsSocketConnected(false);
  });

  // Optional test reply
  socket.current.on("serverTest", (msg) => {
    console.log("💬 Backend says:", msg);
  });

  socket.current.on("receiveMessage", (message) => {
    console.log("📩 Received:", message);
    if (
      message.senderId === selectedUser?._id ||
      message.receiverId === selectedUser?._id
    ) {
      setMessages((prev) => [...prev, message]);
    }
  });

  return () => {
    socket.current.disconnect();
  };
}, [currentUser?.id, selectedUser]);

  // 🧠 Fetch all users except current one
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/auth/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          // Exclude self from list
          const filtered = res.data.users.filter(
            (u) => u._id !== currentUser.id
          );
          setUsers(filtered);
          if (filtered.length > 0) setSelectedUser(filtered[0]);
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

 const handleSendMessage = () => {
  if (!newMessage.trim() || !selectedUser) return;

  if (!isSocketConnected) {
    console.warn("⚠️ Socket not connected yet!");
    return;
  }

  const messageData = {
    senderId: currentUser.id,
    receiverId: selectedUser._id,
    message: newMessage.trim(),
  };

  console.log("📤 Sending:", messageData);
  socket.current.emit("sendMessage", messageData);

  setMessages((prev) => [...prev, { ...messageData, fromSelf: true }]);
  setNewMessage("");
};


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
              onClick={() => {
                setSelectedUser(user);
                setMessages([]); // Clear old chat when new user is selected
              }}
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
            messages.map((msg, index) => (
              <div
                key={index}
                className={`flex mb-3 ${
                  msg.senderId === currentUser.id
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-2xl max-w-xs ${
                    msg.senderId === currentUser.id
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-white text-gray-800 rounded-bl-none shadow-sm"
                  }`}
                >
                  <p>{msg.message}</p>
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
        {selectedUser && (
          <div className="p-4 bg-white border-t flex items-center">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSendMessage}
              className="ml-3 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700"
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatLayout;
