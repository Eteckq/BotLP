import Discord from "discord.js";
import reader from "./edt/reader";
import moment from "moment";
import cron from "cron";
import { DayEdt } from "./edt/wrapper";

export default class Bot {
    private client: Discord.Client;

    constructor(client: Discord.Client) {
        this.client = client;


        client.on("ready", () => {
            console.log("Bot UP!");
            new cron.CronJob("00 30 07 * * 1-5", this.sendEdts).start();
        });

        client.on("message", async (message) => {
            if (message.author.bot) return;

            if (!message.guild) {
                await message.channel.send("salut :)");
            } /*  else {
                console.log(message.guild.id);
                console.log(message.channel.id);
            } */

            if (!message.content.startsWith("!")) return;
            const args = message.content.slice(1).trim().split(/ +/g);
            if (args.length === 0) return;
            let command = args.shift();
            if (command === undefined) return;
            command = command.toLowerCase();

            let date = args.shift();
            if (!date) {
                date = moment(Date.now()).locale("fr").format("YYYY-MM-DD");
            }

            let code = EDT.get(command.toUpperCase());
            if (code) {
                let lp = command.toUpperCase();
                let m = await message.channel.send(
                    `Récupération de l'emplois du temps: ${lp}...`
                );
                let dayEdt = await reader.readEdtId(code, date)
                dayEdt.lp = lp

                if (dayEdt.classes.length > 0) {
                    m.edit(getEdtMessage(dayEdt))
                } else {
                    m.edit(":partying_face: Pas de cours !")
                }
            }
        });
    }

    sendEdts = () => {
        this.sendEdt("AW", "760511695151038524")
        this.sendEdt("SIMO", "760511738268352552")
        this.sendEdt("ASSR", "760511794350915615")
        this.sendEdt("BIG-DATA", "760511850143809536")
    }

    sendEdt(lp: string, channelId: string) {
        let date = moment(Date.now()).locale("fr").format("YYYY-MM-DD");
        this.client.guilds.fetch("760487519602212884").then((guild) => {
            let channel = guild.channels.cache.get(channelId);
            if (channel) {
                let code = EDT.get(lp.toUpperCase());
                if (!code) return
                reader.readEdtId(code, date).then((dayEdt) => {
                    dayEdt.lp = lp
                    dayEdt.day = moment(Date.now()).locale("fr").format("DD MMMM YYYY");
                    if (dayEdt.classes.length > 0)
                        (channel as any).send(getEdtMessage(dayEdt));
                    else {
                        (channel as any).send(":partying_face: Pas de cours !")
                    }
                });
            }
        });
    }
}

function getEdtMessage(dayEdt: DayEdt) {

    let message = `**${dayEdt.day}** ${dayEdt.lp}\n`

    for (const classes of dayEdt.classes) {
        message += `\n:clock2: **${classes.start}h - ${classes.end}h**            :pencil: ${classes.name}\n`;

        if (classes.locations.length > 0) {
            message += `:door: `
            for (const room of classes.locations) {
                message += `${room} - `
            }
            message = message.slice(0, -3)
            message += `\n`
        }

        if (classes.lps.length > 0) {
            for (const lp of classes.lps) {
                message += `${lp}, `
            }
            message = message.slice(0, -2)
            message += `\n`
        }

        if (classes.teachers.length > 0) {
            for (const teacher of classes.teachers) {
                message += `${teacher}  `
            }
            message = message.slice(0, -2)
            message += `\n`
        }

    }

    return message

}

const EDT = new Map([
    ["AW", 40270],
    ["SIMO", 41451],
    ["ASSR", 40681],
    ["BIG-DATA", 41571],
]);

