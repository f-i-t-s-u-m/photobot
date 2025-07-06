const { createClient } = require('@libsql/client');

// Initialize Turso client
const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Initialize database with required tables
async function initializeDatabase() {
  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS users (
        user_id TEXT PRIMARY KEY,
        watermark_file_id TEXT,
        watermark_position TEXT DEFAULT 'bottom',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Get user from database
async function getUser(userId) {
  try {
    const result = await client.execute({
      sql: 'SELECT * FROM users WHERE user_id = ?',
      args: [userId.toString()]
    });
    return result.rows[0];
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
}

// Create or update user watermark
async function setUserWatermark(userId, watermarkFileId, position = 'bottom') {
  try {
    await client.execute({
      sql: `
        INSERT INTO users (user_id, watermark_file_id, watermark_position, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id) DO UPDATE SET
          watermark_file_id = excluded.watermark_file_id,
          watermark_position = excluded.watermark_position,
          updated_at = CURRENT_TIMESTAMP
      `,
      args: [userId.toString(), watermarkFileId, position]
    });
    console.log(`Watermark set for user ${userId}`);
  } catch (error) {
    console.error('Error setting user watermark:', error);
    throw error;
  }
}

// Update watermark position
async function updateWatermarkPosition(userId, position) {
  try {
    await client.execute({
      sql: 'UPDATE users SET watermark_position = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
      args: [position, userId.toString()]
    });
    console.log(`Position updated for user ${userId} to ${position}`);
  } catch (error) {
    console.error('Error updating watermark position:', error);
    throw error;
  }
}

// Check if user exists and has watermark
async function hasWatermark(userId) {
  try {
    const user = await getUser(userId);
    return user && user.watermark_file_id;
  } catch (error) {
    console.error('Error checking watermark:', error);
    return false;
  }
}

module.exports = {
  initializeDatabase,
  getUser,
  setUserWatermark,
  updateWatermarkPosition,
  hasWatermark
}; 