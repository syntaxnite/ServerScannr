const pool = require('./db');

async function isGuildSoftBlacklisted(guildId) {
  const [rows] = await pool.execute(
    'SELECT 1 FROM soft_blacklist WHERE guild_id = ? LIMIT 1',
    [guildId]
  );
  return rows.length > 0;
}

async function addGuildToSoftBlacklist(guildId) {
  await pool.execute(
    'INSERT IGNORE INTO soft_blacklist (guild_id) VALUES (?)',
    [guildId]
  );
}

async function removeGuildFromSoftBlacklist(guildId) {
  await pool.execute(
    'DELETE FROM soft_blacklist WHERE guild_id = ?',
    [guildId]
  );
}

module.exports = {
  isGuildSoftBlacklisted,
  addGuildToSoftBlacklist,
  removeGuildFromSoftBlacklist,
};
