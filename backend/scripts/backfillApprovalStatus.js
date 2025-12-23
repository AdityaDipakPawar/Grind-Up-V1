require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const { connectDB, College, Company } = require('../config/database');

// One-time script to ensure every college and company has an approvalStatus
(async () => {
  try {
    await connectDB();

    const query = { $or: [ { approvalStatus: { $exists: false } }, { approvalStatus: null }, { approvalStatus: '' } ] };
    const update = { $set: { approvalStatus: 'pending' } };

    const [collegeResult, companyResult] = await Promise.all([
      College.updateMany(query, update),
      Company.updateMany(query, update)
    ]);

    console.log('Backfill complete:', {
      collegesModified: collegeResult.modifiedCount,
      companiesModified: companyResult.modifiedCount
    });
  } catch (err) {
    console.error('Backfill error:', err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
})();
