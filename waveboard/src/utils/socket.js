import { io } from "socket.io-client";

const token = localStorage.getItem("token");
const BackendURL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const socket = io(`${BackendURL}`, {
    extraHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    autoConnect: true
});

socket.on('connect', () => {
    console.log('Connected to WebSocket server:', socket.id);
});
export default socket;