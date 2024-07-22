const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const webhookURL = 'WEBHOOK_URL'

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Timeout a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to timeout')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('duration')
                .setDescription('The duration of the timeout in minutes')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for the timeout')
                .setRequired(true)),
    async execute(interaction) {
        if (!interaction.guild) {
            return interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const duration = interaction.options.getInteger('duration') * 60 * 1000;
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const member = interaction.guild.members.cache.get(user.id);

        if (!member) {
            return interaction.reply({ content: 'User not found in this guild.', ephemeral: true });
        }

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return interaction.reply({ content: 'You do not have permission to timeout members.', ephemeral: true });
        }

        if (member.communicationDisabledUntilTimestamp > Date.now()) {
            return interaction.reply({ content: 'This user is already in timeout.', ephemeral: true });
        }

        try {
            await member.timeout(duration, reason);

            const serverIconURL = interaction.guild.iconURL() || '';

            const dmEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('You Have Been Timed Out')
                .setDescription(`You have been timed out for ${duration / 60000} minutes.`)
                .addFields(
                    { name: 'Reason', value: reason },
                    { name: 'Moderator', value: interaction.user.tag },
                    { name: 'Server', value: interaction.guild.name }
                )
                .setTimestamp()
                .setFooter({ text: `Timeout ID: ${interaction.id}`, iconURL: serverIconURL });

            try {
                await user.send({ embeds: [dmEmbed] });
            } catch (error) {
                console.error('Error sending DM:', error);
            }

            const logEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('User Timeout')
                .setDescription(`${user.tag} has been timed out.`)
                .addFields(
                    { name: 'Duration', value: `${duration / 60000} minutes` },
                    { name: 'Reason', value: reason },
                    { name: 'Timeout By', value: interaction.user.tag },
                    { name: 'Server', value: interaction.guild.name }
                )
                .setTimestamp()
                .setFooter({ text: `Timeout ID: ${interaction.id}`, iconURL: serverIconURL });

            try {
                const fetch = (await import('node-fetch')).default;
                await fetch(webhookURL, {
                    method: 'POST',
                    body: JSON.stringify({ embeds: [logEmbed.toJSON()] }),
                    headers: { 'Content-Type': 'application/json' }
                });
            } catch (error) {
                console.error('Error sending log to webhook:', error);
            }

            await interaction.reply({ content: `Successfully timed out ${user.tag} for ${duration / 60000} minutes.`, ephemeral: true });
        } catch (error) {
            console.error('Error applying timeout:', error);
            await interaction.reply({ content: 'Failed to apply timeout.', ephemeral: true });
        }
    },
};