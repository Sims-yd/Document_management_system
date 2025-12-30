// 🔴 THIS MUST BE FIRST – NO IMPORTS ABOVE IT
require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

// Debug check (temporary)
console.log('ENV CHECK:', {
  cloud: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY ? 'LOADED' : 'MISSING',
  apiSecret: process.env.CLOUDINARY_API_SECRET ? 'LOADED' : 'MISSING',
});

// Connect to Database
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
