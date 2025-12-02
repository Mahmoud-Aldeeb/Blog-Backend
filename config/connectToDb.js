const mongoose = require("mongoose");

module.exports = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB is connected....");
  } catch (error) {
    console.log("Connection Faild To MongoDB!", error);
  }
};
