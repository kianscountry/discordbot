const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const webhookURL = 'WEBHOOK_URL';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('report')
        .setDescription('Report an issue or user')
        .addStringOption(option =>
            option.setName('issue')
                .setDescription('The issue or user to report')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('details')
                .setDescription('Additional details for the report')
                .setRequired(false)),
    async execute(interaction) {
        const { default: fetch } = await import('node-fetch');

        const issue = interaction.options.getString('issue');
        const details = interaction.options.getString('details') || 'No additional details provided';

        const reportEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('New Report')
            .addFields(
                { name: 'Reported Issue/User', value: issue, inline: true },
                { name: 'Details', value: details, inline: true },
                { name: 'Reported By', value: interaction.user.tag, inline: true },
                { name: 'Server', value: interaction.guild.name, inline: true }
            )
            .setTimestamp()
            .setFooter({ 
                text: `Report ID: ${interaction.id}`, 
                iconURL: interaction.guild.iconURL()
            });

        await interaction.reply({ content: 'Your report has been submitted.', ephemeral: true });

        try {
            await fetch(webhookURL, {
                method: 'POST',
                body: JSON.stringify({ embeds: [reportEmbed.toJSON()] }),
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {
            console.error('Error sending report to webhook:', error);
        }
    },
};
