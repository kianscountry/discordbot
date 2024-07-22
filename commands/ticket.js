const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
    data: {
        name: 'ticket',
        description: 'Create a support ticket',
    },
    async execute(interaction) {
        const user = interaction.user;
        const guild = interaction.guild;

        // Check if the user already has an open ticket
        const existingChannel = guild.channels.cache.find(
            channel => channel.name === `ticket-${user.id}` && channel.type === ChannelType.GuildText
        );

        if (existingChannel) {
            return interaction.reply({ content: 'You already have an open ticket.', ephemeral: true });
        }

        try {
            // Create a new ticket channel
            const ticketChannel = await guild.channels.create({
                name: `ticket-${user.id}`,
                type: ChannelType.GuildText,
                parent: '1251663072620449812', // Replace with your category ID
                permissionOverwrites: [
                    {
                        id: guild.id,
                        deny: ['ViewChannel'],
                    },
                    {
                        id: user.id,
                        allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
                    },
                    {
                        id: '1250612349023555604', // Replace with the ID of the support role
                        allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
                    },
                ],
            });

            const embed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle('Support Ticket')
                .setDescription('Thank you for creating a support ticket. Please describe your issue, and a staff member will assist you soon.')
                .setFooter({ text: `Ticket created by ${user.tag}`, iconURL: user.displayAvatarURL() });

            const closeButton = new ButtonBuilder()
                .setCustomId('close_ticket')
                .setLabel('Close Ticket')
                .setStyle(ButtonStyle.Danger);

            const row = new ActionRowBuilder().addComponents(closeButton);

            await ticketChannel.send({ content: `${user}`, embeds: [embed], components: [row] });

            await interaction.reply({ content: `Your ticket has been created: ${ticketChannel}`, ephemeral: true });
        } catch (error) {
            console.error('Error creating ticket channel:', error);
            await interaction.reply({ content: 'There was an error creating your ticket. Please try again later.', ephemeral: true });
        }
    },
};
