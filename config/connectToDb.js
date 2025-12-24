const mongoose = require("mongoose");

module.exports = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB is connected....");
  } catch (error) {
    console.log("Connection Faild To MongoDB!", error);
  }
};

// const mongoose = require("mongoose");

// let cachedConnection = null;

// const connectToDb = async () => {
//   // إذا فيه اتصال موجود بالفعل، ارجعه
//   if (cachedConnection && mongoose.connection.readyState === 1) {
//     return cachedConnection;
//   }

//   try {
//     // أغلق أي اتصال قديم
//     if (mongoose.connection.readyState !== 0) {
//       await mongoose.disconnect();
//     }

//     const connection = await mongoose.connect(process.env.MONGO_URI, {
//       serverSelectionTimeoutMS: 5000, // خفض الـ timeout
//       socketTimeoutMS: 45000,
//       maxPoolSize: 10,
//       minPoolSize: 1,
//     });

//     console.log("MongoDB connected successfully");
//     cachedConnection = connection;
//     return connection;
//   } catch (error) {
//     console.error("MongoDB connection error:", error.message);

//     // في Vercel Serverless، لا ترمي error
//     // فقط سجل الخطأ وأرجع null
//     return null;
//   }
// };

// // Handle connection events
// mongoose.connection.on("error", (err) => {
//   console.error("MongoDB connection error:", err);
// });

// mongoose.connection.on("disconnected", () => {
//   console.log("MongoDB disconnected");
//   cachedConnection = null;
// });

// // For Vercel Serverless - أغلق الاتصال عند انتهاء الـ function
// if (process.env.VERCEL) {
//   process.on("SIGTERM", async () => {
//     try {
//       await mongoose.disconnect();
//       console.log("MongoDB connection closed due to Vercel shutdown");
//     } catch (err) {
//       console.error("Error closing MongoDB connection:", err);
//     }
//   });
// }

// module.exports = connectToDb;
