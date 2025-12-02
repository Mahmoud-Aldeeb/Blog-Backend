require("dotenv").config();
const express = require("express");
const connectToDb = require("./config/connectToDb");
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

// running the server
const PORT = process.env.PORT || 8000;

app.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}`)
);
