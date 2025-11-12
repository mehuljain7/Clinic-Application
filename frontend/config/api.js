// config/api.js

const NODE_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://clinic-application-nodejs.onrender.com"
    : "http://localhost:5000";

const FLASK_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://clinic-application.onrender.com"
    : "http://localhost:3000";

export { NODE_BASE_URL, FLASK_BASE_URL };
