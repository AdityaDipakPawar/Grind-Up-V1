// Serverless entry point for Vercel
require('dotenv').config();
const app = require('../app');

// For Vercel serverless functions
module.exports = app;