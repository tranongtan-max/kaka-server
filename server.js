import express from "express";
import http from "http";
import { Server } from "socket.io";
import fetch from "node-fetch";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const PORT = process.env.PORT || 3000;
const YT_API_KEY = process.env.YT_API_KEY || "PUT_YOUR_KEY_HERE";

// --- Socket.IO ---
io.on("connection", (socket) => {
  socket.on("room:join", ({ roomId }) => {
    if (roomId) socket.join(roomId);
  });

  const forward = (event) => {
    socket.on(event, (payload) => {
      const roomId = payload?.roomId;
      if (roomId) socket.to(roomId).emit(event, payload);
    });
  };

  [
    "queue:add",
    "queue:remove",
    "queue:move",
    "player:play",
    "player:pause",
    "player:next",
    "player:prev",
    "player:seek",
    "player:volume"
  ].forEach(forward);
});

// --- API YouTube search ---
app.get("/api/search", async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) return res.json({ items: [] });

    const searchUrl = `https://www.googleapis.com/youtube/v3/search?key=${YT_API_KEY}&part=snippet&type=video&maxResults=10&q=${encodeURIComponent(q)}`;
    const s = await fetch(searchUrl);
    const data = await s.json();

    const items = (data.items || []).map((it) => ({
      id: it.id.videoId,
      title: it.snippet.title,
      channel: it.snippet.channelTitle
    }));

    res.json({ items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ items: [] });
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
