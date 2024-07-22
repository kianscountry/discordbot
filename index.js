const { Client, GatewayIntentBits, Collection, REST, Routes, ActivityType, ButtonInteraction } = require('discord.js');
const fs = require('fs');
const path = require('path');

const TOKEN = 'BOT_TOKEN';
const CLIENT_ID = 'BOT_CLIENT';
const LOG_CHANNEL_ID = 'CHANNEL_LOG_FOR_DELETED_MESSAGES';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ],
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

const commands = [];
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if (command.data && typeof command.data.toJSON === 'function' && command.execute) {
        client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log('/ commands have now been activated.');

        await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            { body: commands }
        );

        console.log('reloaded / commands.');
    } catch (error) {
        console.error('Error deploying commands:', error);
    }
})();

client.once('ready', () => {
    console.log('The technology device of the Discord bot has now been activated.');

    client.user.setActivity('Bot created by kianscountry', { type: ActivityType.Watching });
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand() && !interaction.isButton()) return;

    if (interaction.isCommand()) {
        const command = client.commands.get(interaction.commandName);

        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error executing this command!', ephemeral: true });
        }
    }

    if (interaction.isButton()) {
        if (interaction.customId === 'close_ticket') {
            const channel = interaction.channel;

            if (channel && channel.isText()) {
                try {
                    await channel.delete();
                    await interaction.reply({ content: 'Your ticket has been closed.', ephemeral: true });
                } catch (error) {
                    console.error('Error closing ticket:', error);
                    await interaction.reply({ content: 'There was an error closing the ticket. Please try again later.', ephemeral: true });
                }
            }
        }
    }
});

client.login(TOKEN);