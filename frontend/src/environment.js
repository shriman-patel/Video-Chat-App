const IS_PROD = window.location.hostname !== "localhost";

const server = IS_PROD
  ? "https://video-chat-app-yhfy.onrender.com"
  : "http://localhost:8000";

export default server;
