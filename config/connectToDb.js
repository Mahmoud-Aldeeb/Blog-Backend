// const mongoose = require("mongoose");

// module.exports = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI);
//     console.log("DB is connected....");
//   } catch (error) {
//     console.log("Connection Faild To MongoDB!", error);
//   }
// };

const mongoose = require("mongoose");

/**
 * MongoDB connection helper.
 *
 * Notes:
 * - In serverless environments (مثل Vercel), نفس الـ runtime قد يُعاد استخدامه بين requests.
 *   لذلك نعمل caching للـ connection لتجنب فتح connections جديدة في كل request.
 */
let cached = global.__mongoose_cache;

if (!cached) {
  cached = global.__mongoose_cache = { conn: null, promise: null };
}

const connectToDb = async () => {
  if (cached.conn) return cached.conn;

  if (!process.env.MONGO_URI) {
    throw new Error(
      "MONGO_URI is not defined. Add it to your environment variables."
    );
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URI)
      .then((mongooseInstance) => mongooseInstance);
  }

  cached.conn = await cached.promise;

  if (process.env.NODE_ENV !== "production") {
    console.log("DB is connected....");
  }

  return cached.conn;
};

module.exports = connectToDb;
