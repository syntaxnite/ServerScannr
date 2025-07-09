module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`✅ Logged in as ${client.user.tag}`);
    console.log(`📡 Connected to ${client.guilds.cache.size} guild(s)`);

    try {
      client.user.setPresence({
        activities: [{ name: 'ServerScannr scans', type: 'WATCHING' }],
        status: 'dnd',
      });
      console.log('🔔 Presence set successfully!');
    } catch (error) {
      console.error('Error setting presence:', error);
    }
  },
};
