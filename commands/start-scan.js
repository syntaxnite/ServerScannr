const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionFlagsBits,
} = require('discord.js');

const { performServerScan } = require('../utils/scanHandler');
const { isGuildSoftBlacklisted } = require('../utils/softBlacklist');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('start-scan')
    .setDescription('Initiate a security scan of the server.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const guildId = interaction.guild.id;

    if (await isGuildSoftBlacklisted(guildId)) {
      return interaction.reply({
        content:
          '🚫 Your server is currently soft-blacklisted due to previous suspicious scan results. Please contact a ServerSeek moderator for manual verification.',
        ephemeral: true,
      });
    }

    const guild = interaction.guild;

    const infoEmbed = new EmbedBuilder()
      .setTitle('🛡️ ServerScan: Permission Request')
      .setDescription(`Before we begin, please review what the scan will cover:`)
      .addFields(
        {
          name: '🔎 What We Scan',
          value:
            '• **Channels**: Names, types, and permissions\n' +
            '• **Users with Admin Permissions**: Identify users with elevated rights\n' +
            '• **Channel Topics**: Review text channel topics for sensitive info\n' +
            '• **Role Names & Permissions**: Detect suspicious roles and privileges',
        },
        {
          name: '📋 How It Works',
          value:
            'The scan analyzes your server configuration *without* making any changes.\n' +
            'Results will be summarized clearly, highlighting any concerns.\n\n' +
            'Click **Start Scan** to proceed or **Cancel** to abort.',
        },
        {
          name: '📜 Legal',
          value:
            '[Terms of Service](https://serverseekv2.onrender.com/terms) | [Privacy Policy](https://serverseekv2.onrender.com/privacy)',
        }
      )
      .setColor(0x1f8b4c)
      .setThumbnail(guild.iconURL({ extension: 'png', size: 256 }) || null)
      .setFooter({ text: 'ServerScannr by YourName' })
      .setTimestamp();

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('scan_agree')
        .setLabel('Start Scan')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('scan_cancel')
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Danger)
    );

    await interaction.reply({
      embeds: [infoEmbed],
      components: [buttons],
      ephemeral: true,
    });

    const filter = (i) =>
      ['scan_agree', 'scan_cancel'].includes(i.customId) &&
      i.user.id === interaction.user.id;

    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 60000,
      max: 1,
    });

    collector.on('collect', async (i) => {
      if (i.customId === 'scan_cancel') {
        await i.update({ content: 'Scan cancelled.', embeds: [], components: [] });
        return;
      }

      if (i.customId === 'scan_agree') {
        await i.update({ content: 'Starting scan...', embeds: [], components: [] });
        await performServerScan(i);
      }
    });

    collector.on('end', (collected) => {
      if (collected.size === 0) {
        interaction.editReply({
          content: 'No response received. Scan cancelled.',
          embeds: [],
          components: [],
        });
      }
    });
  },
};
