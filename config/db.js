const moongose = require("mongoose");

const connectDB = async () => {
  try {
    const mongodbConnect = await moongose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${mongodbConnect.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // Exit if connection fails.
  }
};

module.exports = connectDB;
