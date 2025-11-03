// Serverless entry point for Vercel
require('dotenv').config();
const app = require('../app');

// Export the Express app as a serverless function
module.exports = app;