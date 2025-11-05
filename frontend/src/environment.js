const IS_PROD = window.location.hostname !== "localhost";

const server = IS_PROD
  ? "http://video-chat-app-production-d515.up.railway.app"
  : "http://localhost:8000";

export default server;
