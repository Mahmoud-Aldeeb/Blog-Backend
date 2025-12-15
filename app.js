require("dotenv").config();
const express = require("express");
const connectToDb = require("./config/connectToDb");
const { errorHandler, notFound } = require("./middlewares/error");
const cors = require("cors");
// const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const hpp = require("hpp");

// Connection to Db
connectToDb();

// init app
const app = express();

// Middlewares
app.use(express.json());

// cors Policy
app.use(
  cors({
    origin: "*",
  })
);

// Apply helmet middleware
app.use(helmet());

// Apply hpp middleware
app.use(hpp());

// Apply xss-clean middleware
// app.use(xss());

// Apply rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
});
app.use(limiter);

// router
app.use("/api/auth", require("./routes/authRoute"));
app.use("/api/users", require("./routes/usersRoute"));
app.use("/api/posts", require("./routes/postsRoute"));
app.use("/api/comments", require("./routes/commentsRoute"));
app.use("/api/categories", require("./routes/categoriesRoute"));
app.use("/api/password", require("./routes/passwordRoute"));

// Error Handler Middleware
app.use(notFound);
app.use(errorHandler);

// running the server
const PORT = process.env.PORT || 8000;

app.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}`)
);
