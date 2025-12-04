require("dotenv").config();
const express = require("express");
const connectToDb = require("./config/connectToDb");
const { errorHandler, notFound } = require("./middlewares/error");
// Connection to Db
connectToDb();

// init app
const app = express();

// Middlewares
app.use(express.json());

// router
app.use("/api/auth", require("./routes/authRoute"));
app.use("/api/users", require("./routes/usersRoute"));
app.use("/api/posts", require("./routes/postsRoute"));
app.use("/api/comments", require("./routes/commentsRoute"));
app.use("/api/categories", require("./routes/categoriesRoute"));

// Error Handler Middleware
app.use(notFound);
app.use(errorHandler);

// running the server
const PORT = process.env.PORT || 8000;

app.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}`)
);
