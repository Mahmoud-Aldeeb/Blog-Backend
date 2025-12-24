require("dotenv").config();
const express = require("express");
const connectToDb = require("./config/connectToDb");
const { errorHandler, notFound } = require("./middlewares/error");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const hpp = require("hpp");

// init app
const app = express();

// Connection to Db
connectToDb();

// Middlewares
app.use(express.json());

// cors Policy
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173", // Vite dev server
      "https://blog-frontend-psi-beryl.vercel.app",
      "*",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  })
);

// app.use(
//   cors({
//     origin: "*",
//   })
// );

// Apply helmet middleware
app.use(helmet());

// Apply hpp middleware
app.use(hpp());

// Apply xss-clean middleware
// app.use(xss());

// Apply rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: {
    error: "Too many requests, please try again later.",
  },
});
app.use("/api/", limiter);

// Health check endpoint (مهم جداً لـ Vercel)
// app.get("/api/health", (req, res) => {
//   res.json({
//     status: "ok",
//     timestamp: new Date().toISOString(),
//     database: isDbConnected ? "connected" : "disconnected",
//     environment: process.env.NODE_ENV || "development",
//   });
// });
// app.use(async (req, res, next) => {
//   if (!isDbConnected && !req.path.includes("/health")) {
//     await initializeDb();
//   }
//   next();
// });

// router
app.use("/api/auth", require("./routes/authRoute"));
app.use("/api/users", require("./routes/usersRoute"));
app.use("/api/posts", require("./routes/postsRoute"));
app.use("/api/comments", require("./routes/commentsRoute"));
app.use("/api/categories", require("./routes/categoriesRoute"));
app.use("/api/password", require("./routes/passwordRoute"));

app.get("/", (req, res) => {
  res.json({
    message: "🚀 Blog API Server is Running!",
    version: "1.0.0",
    documentation: "Available at /api-docs (if configured)",
    endpoints: {
      auth: {
        login: "POST /api/auth/login",
        register: "POST /api/auth/register",
        logout: "POST /api/auth/logout",
      },
      users: "GET /api/users",
      posts: "GET /api/posts",
      comments: "GET /api/comments",
      categories: "GET /api/categories",
      password: {
        forgot: "POST /api/password/forgot",
        reset: "POST /api/password/reset/:token",
      },
    },
    health: "GET /api/health (uncomment to enable)",
    status: "active",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "✅ OK",
    service: "Blog API",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Error Handler Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
