const { EmbedBuilder } = require('discord.js');
const { performFullScan, saveScanResult } = require('./scanLogic');
const { addGuildToSoftBlacklist, isGuildSoftBlacklisted } = require('./softBlacklist');

async function performServerScan(buttonInteraction) {
  if (await isGuildSoftBlacklisted(buttonInteraction.guild.id)) {
    return buttonInteraction.followUp({
      content:
        '🚫 This server is soft-blacklisted. Please contact staff for manual verification.',
      ephemeral: true,
    });
  }

  const loadingEmbed = new EmbedBuilder()
    .setTitle('🛡️ ServerScan in Progress')
    .setDescription('<a:loading:1392602037946159285> Scanning... 0% complete')
    .setColor(0x1f8b4c)
    .setTimestamp();

  const loadingMessage = await buttonInteraction.followUp({
    embeds: [loadingEmbed],
    fetchReply: true,
  });

  const totalSteps = 5;
  for (let step = 1; step <= totalSteps; step++) {
    await new Promise(res => setTimeout(res, 1500));

    const percent = Math.floor((step / totalSteps) * 100);

    const progressEmbed = new EmbedBuilder()
      .setTitle('🛡️ ServerScan in Progress')
      .setDescription(`<a:loading:1392602037946159285> Scanning... ${percent}% complete`)
      .setColor(0x1f8b4c)
      .setTimestamp();

    await loadingMessage.edit({ embeds: [progressEmbed] });
  }

  const { adminScan, suspiciousRoles, suspiciousChannels } = await performFullScan(buttonInteraction.guild);

  const suspiciousCount = adminScan.flaggedAdmins.length + suspiciousRoles.length + suspiciousChannels.length;

  const passed = suspiciousCount === 0;

  if (!passed) {
    await addGuildToSoftBlacklist(buttonInteraction.guild.id);
  }

  await saveScanResult(buttonInteraction.guild.id, { adminScan, suspiciousRoles, suspiciousChannels }, !passed);

  const footerText = suspiciousCount > 3
    ? 'This server requires manual review. Please join ServerSeek’s Discord: https://discord.gg/serverseek'
    : 'This is a preliminary automated scan.';

  const resultEmbed = new EmbedBuilder()
    .setTitle(`📝 Scan Complete: ${buttonInteraction.guild.name}`)
    .setColor(passed ? 0x00ff00 : 0xff0000)
    .setDescription(
      passed
        ? '✅ No suspicious admins, roles, or channels detected.'
        : '⚠️ Suspicious content detected! Please review below.'
    )
    .addFields(
      {
        name: '🚫 Blacklisted Admins',
        value: adminScan.flaggedAdmins.length > 0 ? adminScan.flaggedAdmins.join(', ') : 'None',
        inline: true,
      },
      {
        name: '⚠️ Suspicious Roles',
        value: suspiciousRoles.length > 0 ? suspiciousRoles.join(', ') : 'None',
        inline: true,
      },
      {
        name: '⚠️ Suspicious Channels',
        value: suspiciousChannels.length > 0
          ? suspiciousChannels
              .map(c => `**${c.name}** (Category: ${c.category || 'None'}) - Topic: ${c.topic || 'None'}`)
              .join('\n')
          : 'None',
        inline: false,
      }
    )
    .setFooter({ text: footerText })
    .setTimestamp();

  await loadingMessage.edit({ embeds: [resultEmbed] });
}

module.exports = { performServerScan };
