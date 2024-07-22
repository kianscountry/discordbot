const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { WebhookClient } = require('discord.js');

const webhookId = 'WEBHOK_ID';
const webhookToken = 'WEBHOOK_TOKEN';
const webhookClient = new WebhookClient({ id: webhookId, token: webhookToken });

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warn a user')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to warn')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('The reason for the warning')
                .setRequired(true)),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const warnTime = new Date().toLocaleString();
        const serverIcon = interaction.guild.iconURL();
        const serverName = interaction.guild.name;

        const dmEmbed = new EmbedBuilder()
            .setTitle('You have been warned')
            .setDescription(`**Reason:** ${reason}`)
            .addFields(
                { name: 'By', value: interaction.user.tag, inline: true },
                { name: 'Time', value: warnTime, inline: true }
            )
            .setThumbnail(serverIcon)
            .setFooter({ text: serverName, iconURL: serverIcon })
            .setColor('#00FF00')
            .setTimestamp();

        const logEmbed = new EmbedBuilder()
            .setTitle('User Warned')
            .setDescription(`**User:** ${user.tag}\n**Reason:** ${reason}`)
            .addFields(
                { name: 'By', value: interaction.user.tag, inline: true },
                { name: 'Time', value: warnTime, inline: true }
            )
            .setThumbnail(serverIcon)
            .setFooter({ text: serverName, iconURL: serverIcon })
            .setColor('#00FF00')
            .setTimestamp();

        try {
            await user.send({ embeds: [dmEmbed] });
            await webhookClient.send({ embeds: [logEmbed] });
            await interaction.reply({ content: `Warned ${user.tag} for: ${reason}`, ephemeral: true });
        } catch (error) {
            console.error('Error sending warning:', error);
            await interaction.reply({ content: 'Failed to warn the user.', ephemeral: true });
        }
    },
};