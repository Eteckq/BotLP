import Discord, { GuildChannel } from "discord.js";
import reader from "./edt/reader";
import moment from "moment";
import cron from "cron";
import { DayEdt } from "./edt/wrapper";
import { lookup } from "dns";

const prefix = "y!"

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
            }

            if (!message.content.startsWith(prefix)) return;
            const args = message.content.slice(prefix.length).trim().split(/ +/g);
            if (args.length === 0) return;
            let command = args.shift();
            if (command === undefined) return;
            command = command.toLowerCase();


            let date = args.shift();
            this.handleEdt(message, command.toUpperCase(), date)
        });
    }

    async handleEdt(message: Discord.Message, lp: string, date: string | undefined) {
        

        if (!date) {
            date = moment(Date.now()).locale("fr").format("YYYY-MM-DD");
        }

        let code = EDT.get(lp);
        if (code) {
            let m = await message.channel.send(
                `Récupération de l'emplois du temps: ${lp}...`
            );
            let dayEdt = await reader.readEdtId(code, date)
            dayEdt.lp = lp

            if (dayEdt.classes.length > 0) {
                m.delete()
                await message.channel.send(getEdtMessage(dayEdt))
            } else {
                m.edit(":partying_face: Pas de cours !")
            }
        }
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
                });
            }
        });
    }
}

function getEdtMessage(dayEdt: DayEdt): Discord.MessageEmbed {

    const exampleEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(dayEdt.lp + " - " + dayEdt.day)
            // .setDescription(dayEdt.day)


    for (const classes of dayEdt.classes) {
        exampleEmbed.addField("\u200B", "\u200B")
        exampleEmbed.addField(`:clock2: ${classes.start}h - ${classes.end}h`, `:pencil: ${classes.name}`)

        if (classes.locations.length > 0) {
            let txt = ``
            for (const room of classes.locations) {
                txt += `${room} - `
            }
            txt = txt.slice(0, -3)
            exampleEmbed.addField(':door:', txt, true)
            // exampleEmbed.addField("\u200B", "t")
        }
        

        if (classes.lps.length > 0) {
            let txt = ""
            for (const lp of classes.lps) {
                txt += `${lp}, `
            }
            txt = txt.slice(0, -2)
            exampleEmbed.addField('LP', txt, true)
            // exampleEmbed.addField("\u200B", "t")
        }

        if (classes.teachers.length > 0) {
            let txt = ""
            for (const teacher of classes.teachers) {
                txt += `${teacher}\n`
            }
            txt = txt.slice(0, -1)
            exampleEmbed.addField('Profs', txt)
            // exampleEmbed.addField("\u200B", "t")
        }

    }

    return exampleEmbed

}

const EDT = new Map([
    ["AW", 40270],
    ["SIMO", 41451],
    ["ASSR", 40681],
    ["BIG-DATA", 41571],
]);

