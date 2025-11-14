// // config/api.js

// const NODE_BASE_URL =
//   process.env.NODE_ENV === "production"
//     ? "https://clinic-application-nodejs.onrender.com"
//     : "http://localhost:5000";

// const FLASK_BASE_URL =
//   process.env.NODE_ENV === "production"
//     ? "https://clinic-application.onrender.com"
//     : "http://localhost:3000";

// export { NODE_BASE_URL, FLASK_BASE_URL };


// config/api.js

// 🟢 Change these to your actual Render URLs:
// const PROD_NODE_URL = "https://clinic-application-nodejs.onrender.com";
const PROD_NODE_URL = "https://clinic-application-nodejs.up.railway.app"
const PROD_FLASK_URL = "https://clinic-application.onrender.com";

// 🧩 Local development ports
const DEV_NODE_URL = "http://localhost:5000";
const DEV_FLASK_URL = "http://localhost:3000";

// React Native doesn’t automatically know NODE_ENV
// So we’ll add a manual toggle:
const IS_PROD = true; // 🔴 Change to true when testing production build

export const NODE_BASE_URL = IS_PROD ? PROD_NODE_URL : DEV_NODE_URL;
export const FLASK_BASE_URL = IS_PROD ? PROD_FLASK_URL : DEV_FLASK_URL;
