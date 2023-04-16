import express from "express";
import { createServer } from "http";
import { PeerServer } from "peer";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);

PeerServer({ port: 9000, path: "/peerjs" });
const io = new Server(server, {
  cors: { origin: "http://localhost:5000", credentials: true },
});

app.get("/", (_req: any, res: any) => {
  res.send("Hello World!");
});

let queue: any[] = [];
let activeSockets = new Set<string>();

io.on("connection", socket => {
  console.log("connected", socket.id, activeSockets);
  const existingSocket = activeSockets.has(socket.id);
  if (!existingSocket) {
    activeSockets.add(socket.id);
    socket.on("find-match", data => {
      console.log("find-match", data);

      data.socketId = socket.id;
      if (queue.length > 0) {
        const match = queue.pop();
        socket.to(match.socketId).emit("match-made", data, true);
        console.log("match-made");
        socket.emit("match-made", match, false);
      } else {
        console.log("pushing");

        queue.push(data);
      }
      console.log("find-match", queue);
    });
    socket.on("chat", (socketId, message) => {
      socket.to(socketId).emit("chat", message);
    });
    socket.on("update", (socketId, data) => {
      socket.to(socketId).emit("update", data);
    });
    // socket.on("leave", otherId => {
    //   socket.to(otherId).emit("leave");
    //   queue = queue.filter(q => q.socketId !== socket.id);
    //   activeSockets.delete(socket.id);
    //   console.log(socket.id + " has left", queue);
    // });
    socket.on("disconnect", () => {
      queue = queue.filter(q => q.socketId !== socket.id);
      activeSockets.delete(socket.id);
      console.log(socket.id + " has disconnected", queue);
    });
  }
});

server.listen(4000, () => console.log("listening on port 4000"));
