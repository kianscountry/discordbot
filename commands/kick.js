const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { WebhookClient } = require('discord.js');

const webhookId = 'WEBHOOK_ID';
const webhookToken = 'WEBHOOK_TOKEN';
const webhookClient = new WebhookClient({ id: webhookId, token: webhookToken });

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a user from the server')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to kick')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('The reason for the kick')
                .setRequired(true)),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const kickTime = new Date().toLocaleString();
        const serverIcon = interaction.guild.iconURL();
        const serverName = interaction.guild.name;

        if (!interaction.member.permissions.has('KickMembers')) {
            return interaction.reply({ content: 'You do not have permission to kick members.', ephemeral: true });
        }

        try {
            const dmEmbed = new EmbedBuilder()
                .setTitle('You have been kicked')
                .setDescription(`**Reason:** ${reason}`)
                .addFields(
                    { name: 'By', value: interaction.user.tag, inline: true },
                    { name: 'Time', value: kickTime, inline: true }
                )
                .setThumbnail(serverIcon)
                .setFooter({ text: serverName, iconURL: serverIcon })
                .setColor('#FFBF00')
                .setTimestamp();
            const logEmbed = new EmbedBuilder()
                .setTitle('User Kicked')
                .setDescription(`**User:** ${user.tag}\n**Reason:** ${reason}`)
                .addFields(
                    { name: 'By', value: interaction.user.tag, inline: true },
                    { name: 'Time', value: kickTime, inline: true }
                )
                .setThumbnail(serverIcon)
                .setFooter({ text: serverName, iconURL: serverIcon })
                .setColor('#FFBF00')
                .setTimestamp();

            await user.send({ embeds: [dmEmbed] });
            await interaction.guild.members.kick(user.id, reason);
            await webhookClient.send({ embeds: [logEmbed] });
            await interaction.reply({ content: `Kicked ${user.tag} for: ${reason}`, ephemeral: true });
        } catch (error) {
            console.error('Error kicking user:', error);
            await interaction.reply({ content: 'Failed to kick the user.', ephemeral: true });
        }
    },
};

