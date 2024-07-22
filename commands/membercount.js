const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('membercount')
        .setDescription('Displays the number of members in the server'),
    async execute(interaction) {
        const memberCount = interaction.guild.memberCount;

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Server Member Count')
            .setDescription(`This server has ${memberCount} members.`)
            .setTimestamp()
            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

        await interaction.reply({
            embeds: [embed],
            ephemeral: true
        });
    },
};
