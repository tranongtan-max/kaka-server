import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

// cấu hình CORS cho phép mọi origin (để web controller và player đều kết nối được)
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("⚡ Client connected:", socket.id);

  // Nhận lệnh phát video từ controller
  socket.on("play-video", (videoId) => {
    console.log("▶️ Yêu cầu phát:", videoId);
    io.emit("play-video", videoId); // broadcast đến tất cả client
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Karaoke socket server running on port ${PORT}`);
});
