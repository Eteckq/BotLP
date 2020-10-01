const config = require('../config.json');
import Discord from 'discord.js'
import BotLP from './bot';
require('dotenv').config()

const client = new Discord.Client();
client.login(process.env.BOT_TOKEN).catch(error => {
    console.log(error);
});

const bot = new BotLP(client);