const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { WebhookClient } = require('discord.js');

const webhookId = 'WEBOOK_ID';
const webhookToken = 'WEBHOOK_TOKEN';
const webhookClient = new WebhookClient({ id: webhookId, token: webhookToken });

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user from the server')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to ban')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('The reason for the ban')
                .setRequired(true)),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const banTime = new Date().toLocaleString();
        const serverIcon = interaction.guild.iconURL();
        const serverName = interaction.guild.name;

        if (!interaction.member.permissions.has('BanMembers')) {
            return interaction.reply({ content: 'You do not have permission to ban members.', ephemeral: true });
        }

        try {
            const dmEmbed = new EmbedBuilder()
                .setTitle('You have been banned')
                .setDescription(`**Reason:** ${reason}`)
                .addFields(
                    { name: 'By', value: interaction.user.tag, inline: true },
                    { name: 'Time', value: banTime, inline: true }
                )
                .setThumbnail(serverIcon)
                .setFooter({ text: serverName, iconURL: serverIcon })
                .setColor('#ff0000')
                .setTimestamp();

            const logEmbed = new EmbedBuilder()
                .setTitle('User Banned')
                .setDescription(`**User:** ${user.tag}\n**Reason:** ${reason}`)
                .addFields(
                    { name: 'By', value: interaction.user.tag, inline: true },
                    { name: 'Time', value: banTime, inline: true }
                )
                .setThumbnail(serverIcon)
                .setFooter({ text: serverName, iconURL: serverIcon })
                .setColor('#ff0000')
                .setTimestamp();

            await user.send({ embeds: [dmEmbed] }).catch(error => {
                console.error('Error sending DM to the user:', error);
            });

            await interaction.guild.members.ban(user.id, { reason });
            await webhookClient.send({ embeds: [logEmbed] });
            await interaction.reply({ content: `Banned ${user.tag} for: ${reason}`, ephemeral: true });
        } catch (error) {
            console.error('Error banning user:', error);
            await interaction.reply({ content: 'Failed to ban the user.', ephemeral: true });
        }
    },
};