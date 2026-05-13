const getDb = () => require('../config/db');

const ensureTable = async () => {
  const { sequelize } = getDb();
  try {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        "userId" INTEGER,
        "userName" VARCHAR(255),
        type VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        metadata JSONB DEFAULT '{}',
        "createdAt" TIMESTAMP DEFAULT NOW()
      )
    `);
  } catch (e) {
    try {
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS activity_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          "userId" INTEGER,
          "userName" VARCHAR(255),
          type VARCHAR(50) NOT NULL,
          message TEXT NOT NULL,
          metadata TEXT DEFAULT '{}',
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } catch (e2) {
      console.error('[activityLogger] Failed to create table:', e2.message);
    }
  }
};

const logActivity = async (userId, userName, type, message, metadata = {}) => {
  try {
    const { sequelize } = getDb();
    await ensureTable();
    const now = new Date().toISOString();
    const metaStr = typeof metadata === 'object' ? JSON.stringify(metadata) : metadata;
    const safeUserId = userId != null ? userId : null;
    const safeName = userName ? `'${String(userName).replace(/'/g, "''")}'` : null;
    const safeType = `'${String(type).replace(/'/g, "''")}'`;
    const safeMsg = `'${String(message).replace(/'/g, "''")}'`;
    const safeMeta = `'${String(metaStr).replace(/'/g, "''")}'`;

    await sequelize.query(`
      INSERT INTO activity_logs ("userId", "userName", type, message, metadata, "createdAt")
      VALUES (${safeUserId}, ${safeName}, ${safeType}, ${safeMsg}, ${safeMeta}, '${now}')
    `);

    const maxRows = 500;
    await sequelize.query(`
      DELETE FROM activity_logs WHERE id NOT IN (
        SELECT id FROM activity_logs ORDER BY "createdAt" DESC LIMIT ${maxRows}
      )
    `);
  } catch (error) {
    console.error('[activityLogger] Error logging activity:', error.message);
  }
};

const getRecentActivity = async (limit = 50) => {
  try {
    const { sequelize } = getDb();
    await ensureTable();
    const [rows] = await sequelize.query(`
      SELECT * FROM activity_logs ORDER BY "createdAt" DESC LIMIT ${limit}
    `);
    return rows || [];
  } catch (error) {
    console.error('[activityLogger] Error fetching activity:', error.message);
    return [];
  }
};

module.exports = { logActivity, getRecentActivity, ensureTable };
