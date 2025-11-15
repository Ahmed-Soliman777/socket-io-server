const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db.js');
const cors = require("cors");
const http = require("http");

const userRoute = require("./routes/user.routes.js");
const chatRoute = require("./routes/chat.routes.js");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

app.get('/', (_, res) => {
    res.send(`Server runs at port ${port}`);
});

app.use('/api/user', userRoute);
app.use('/api/chat', chatRoute);

// Create HTTP server
const server = http.createServer(app);

// Socket.io setup
const io = require("socket.io")(server, {
    pingTimeout: 60000,
    cors: {
        origin: "http://localhost:5173", // your frontend URL
        credentials: true,
    },
});

io.on("connection", (socket) => {
    console.log("Connected to socket.io");

    socket.on("setup", (userData) => {
        socket.join(userData._id);
        socket.emit("connected");
    });

    socket.on("join chat", (room) => {
        socket.join(room);
        console.log("User Joined Room: " + room);
    });

    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    socket.on("new message", (newMessageReceived) => {
        const chat = newMessageReceived.chat;

        if (!chat.users) return console.log("chat.users not defined");

        chat.users.forEach((user) => {
            if (user._id === newMessageReceived.sender._id) return;
            socket.in(user._id).emit("message received", newMessageReceived);
        });
    });

    socket.on("disconnect", () => {
        console.log("USER DISCONNECTED");
    });
});

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
