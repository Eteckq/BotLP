require('dotenv').config()
import Discord from 'discord.js'
import BotLP from './bot';
import http from "http"

const client = new Discord.Client();
client.login(process.env.BOT_TOKEN).catch(error => {
    console.log(error);
});

let port = 3000 || process.env.PORT

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write('Hello from Yobot');
    res.end();
  }).listen(port);

const bot = new BotLP(client);