const { isUserBlacklisted } = require('./blacklist');

const SUSPICIOUS_KEYWORDS = [
  'dating',
  'dm open',
  'dms open',
  'dm closed',
  'dms closed',
  'single',
  'looking',
  'relationship',
  'nsfw',
  '18+',
  'sex',
  'adult',
  'explicit',
  'nsfl',
];

function containsSuspiciousKeyword(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return SUSPICIOUS_KEYWORDS.some(keyword => lower.includes(keyword));
}

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

async function scanRolesForSuspicious(guild) {
  return guild.roles.cache
    .filter(role => containsSuspiciousKeyword(role.name))
    .map(role => role.name);
}

async function scanChannelsForSuspicious(guild) {
  const suspiciousChannels = [];

  guild.channels.cache.forEach(channel => {
    if (
      containsSuspiciousKeyword(channel.name) ||
      containsSuspiciousKeyword(channel.topic) ||
      (channel.parent && containsSuspiciousKeyword(channel.parent.name))
    ) {
      suspiciousChannels.push({
        name: channel.name,
        topic: channel.topic || '',
        category: channel.parent ? channel.parent.name : '',
      });
    }
  });

  return suspiciousChannels;
}

const pool = require('./db');

async function saveScanResult(guildId, result, flagged) {
  const sql = `INSERT INTO scans (guild_id, result, flagged) VALUES (?, ?, ?)`;
  await pool.execute(sql, [guildId, JSON.stringify(result), flagged ? 1 : 0]);
}

async function performFullScan(guild) {
  const adminScan = await scanAdminsCheckBlacklist(guild);
  const suspiciousRoles = await scanRolesForSuspicious(guild);
  const suspiciousChannels = await scanChannelsForSuspicious(guild);

  return {
    adminScan,
    suspiciousRoles,
    suspiciousChannels,
  };
}

module.exports = {
  scanAdminsCheckBlacklist,
  scanRolesForSuspicious,
  scanChannelsForSuspicious,
  saveScanResult,
  performFullScan,
};
