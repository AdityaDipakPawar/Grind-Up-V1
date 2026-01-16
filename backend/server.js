// start server
require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/database');
const { verifyConnection } = require('./services/emailService');

const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    
    // Connect to database
    await connectDB();
    
    // Verify email connection (non-blocking, just logs status)
    setTimeout(async () => {
        await verifyConnection();
    }, 2000); // Wait 2 seconds for server to fully start
});