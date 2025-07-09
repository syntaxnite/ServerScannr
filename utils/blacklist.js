const pool = require('./db');
const { isUserBlacklisted } = require('./blacklist');

async function scanAdminsCheckBlacklist(guild) {
  const adminMembers = guild.members.cache.filter(member =>
    member.permissions.has('Administrator')
  );

  const flaggedAdmins = [];

  for (const member of adminMembers.values()) {
    if (await isUserBlacklisted(member.id)) {
      flaggedAdmins.push(member.user.tag);
    }
  }

  return {
    totalAdmins: adminMembers.size,
    flaggedAdmins,
  };
}

async function saveScanResult(guildId, result, flagged) {
  const sql = `INSERT INTO scans (guild_id, result, flagged) VALUES (?, ?, ?)`;
  await pool.execute(sql, [guildId, JSON.stringify(result), flagged ? 1 : 0]);
}

module.exports = {
  scanAdminsCheckBlacklist,
  saveScanResult,
};
