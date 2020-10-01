const config = require('./config.json');
import Discord from 'discord.js'
import BotLP from './src/bot';

const client = new Discord.Client();
client.login(config.BOT_TOKEN).catch(error => {
    console.log(error);
});

const bot = new BotLP(client);