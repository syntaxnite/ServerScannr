const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('scan-help')
    .setDescription('Learn about how ServerScannr scans your server and interprets results.'),

  async execute(interaction) {
    const helpEmbed = new EmbedBuilder()
      .setTitle('<a:ServerSeek:1388938812427862077> ServerScannr Help & Scan Overview')
      .setDescription('Here is what ServerScannr scans and how to understand the results:')
      .addFields(
        {
          name: '🔎 What We Scan',
          value:
            '• **Channels**: Names, types, categories, and permissions\n' +
            '• **Users with Administrator Permissions**: Who has elevated rights\n' +
            '• **Channel Topics**: Text channel descriptions and potential sensitive info\n' +
            '• **Role Names**: Detect suspicious or risky roles based on names and permissions\n' +
            '• **Suspicious Keywords**: Bot scans for keywords like "dating", "NSFW", "DMs open", etc.\n\n' +
            '**Note:** This scan is non-intrusive and does not make any changes to your server.',
        },
        {
          name: '📋 Interpreting Results',
          value:
            '• ✅ **Passed**: No suspicious content detected.\n' +
            '• ⚠️ **Flagged**: Some roles, channels, or admins may be suspicious.\n' +
            '• 🚫 **Soft Blacklisted**: Your server requires manual review before rescanning.\n\n' +
            'If flagged, please review the report carefully and consider joining ServerSeek’s Discord for support: http://discord.serverseek.xyz/',
        },
        {
          name: '❓ Need More Help?',
          value: 'Contact ServerSeek support via our Discord http://discord.serverseek.xyz/ ',
        }
      )
      .setColor(0x1f8b4c)
      .setFooter({ text: 'ServerScannr by syntax@serverseek.xyz' })
      .setTimestamp();

    await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
  },
};
