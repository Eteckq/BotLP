require('dotenv').config()
import Discord from 'discord.js'
import BotLP from './bot';
import http from "http"

const client = new Discord.Client();
client.login(process.env.BOT_TOKEN).catch(error => {
    console.log(error);
});

const bot = new BotLP(client);