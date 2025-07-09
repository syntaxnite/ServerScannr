const { SlashCommandBuilder } = require('discord.js');
const {
  removeGuildFromSoftBlacklist,
  isGuildSoftBlacklisted,
} = require('../utils/softBlacklist');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verify-clear')
    .setDescription('Remove this server from the soft blacklist after manual verification.'),

  async execute(interaction) {
    const staffGuildId = '1388176318885138432';
    const requiredRoleId = '1391908898772090954';

    try {
      // Fetch the staff guild
      const staffGuild = await interaction.client.guilds.fetch(staffGuildId);
      if (!staffGuild) {
        return interaction.reply({
          content: '❌ Unable to verify your staff guild membership.',
          ephemeral: true,
        });
      }

      // Fetch member in the staff guild
      const staffMember = await staffGuild.members.fetch(interaction.user.id).catch(() => null);

      if (!staffMember) {
        return interaction.reply({
          content: '❌ You must be a member of the ServerSeek staff guild to use this command.',
          ephemeral: true,
        });
      }

      if (!staffMember.roles.cache.has(requiredRoleId)) {
        return interaction.reply({
          content: '❌ You do not have the required role to use this command.',
          ephemeral: true,
        });
      }

      const guildId = interaction.guild.id;

      if (!(await isGuildSoftBlacklisted(guildId))) {
        return interaction.reply({
          content: 'ℹ️ This server is not currently soft-blacklisted.',
          ephemeral: true,
        });
      }

      await removeGuildFromSoftBlacklist(guildId);

      return interaction.reply({
        content: '✅ This server has been removed from the soft blacklist.',
        ephemeral: true,
      });
    } catch (error) {
      console.error('Error in verify-clear command:', error);
      return interaction.reply({
        content: '❌ An error occurred while processing your request.',
        ephemeral: true,
      });
    }
  },
};
