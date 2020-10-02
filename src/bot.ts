import ical from "node-ical";
import Discord from "discord.js";
import reader from "./edtReader";
import moment from "moment";
import cron from "cron";

export default class Bot {
    private client: Discord.Client;

    constructor(client: Discord.Client) {
        this.client = client;
        

        client.on("ready", () => {
            console.log("Bot UP!");
            new cron.CronJob("00 30 13 * * 1-5", this.sendEdts).start();
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
                let msg = await getEdtMsg(lp, date);
                m.edit(`**${getDay(date as any)}** ${lp.toUpperCase()}\n ${msg}`);
            }
        });
    }

    sendEdts = () => {
        this.sendEdt("AW")
        this.sendEdt("SIMO")
    }

    sendEdt (lp: string) {
        let date = moment(Date.now()).locale("fr").format("YYYY-MM-DD");
        this.client.guilds.fetch("760487519602212884").then((guild) => {
            let channel = guild.channels.cache.get("761502893265387530");
            if (channel) {
                getEdtMsg(lp, date).then((msg) => {
                    (channel as any).send(msg);
                });
            }
        });
    }
}

function getEdtMsg(lp: string, date: string) {
    return new Promise((resolve, reject) => {
        let code = EDT.get(lp);

        if (!code) {
            reject("Code invalide");
        } else {
            reader
                .readEdtId(code, date)
                .then((response) => {
                    let message = "";

                    let cours: any[] = [];
                    for (const key in response) {
                        cours.push(response[key]);
                    }

                    cours.sort((a, b) => moment(a.start).unix() - moment(b.start).unix());

                    for (const cour of cours) {
                        message += formatCours(
                            cour.summary as any,
                            cour.start as any,
                            cour.end as any,
                            cour.location as any,
                            cour.description as any
                        );
                    }

                    resolve(message);
                })
                .catch((error) => {
                    console.log(error);

                    reject(error);
                });
        }
    });
}

function formatCours(
    UE: string,
    start: string,
    end: string,
    room: string,
    description: string
) {
    let descriptionLines = (description as string).split("\n").slice(1, -3);
    let descriptionFormatted = "[";

    //:regional_indicator_w:
    for (const description of descriptionLines) {
        if (
            description == "SIMO" ||
            description == "AW" ||
            description == "BIG DATA" ||
            description == "ASSR"
        ) {
            let color = colorLp.get(description);

            if (color) {
                descriptionFormatted += description + ", ";
            }
        }
    }
    descriptionFormatted = descriptionFormatted.slice(0, -2);
    descriptionFormatted += "]\n";

    for (let description of descriptionLines) {
        if (
            description != "BIG DATA" &&
            description != "SIMO" &&
            description != "AW" &&
            description != ""
        ) {
            let emoji = customEmojis.get(description);

            if (emoji) {
                descriptionFormatted += emoji + " " + getFullName(description) + "  ";
            } else {
                descriptionFormatted += getFullName(description) + "  ";
            }
        }
    }

    let startFormat = formatDate(start);
    let endFormat = formatDate(end);

    return `
:clock2: **${startFormat}h - ${endFormat}h**            :pencil: ${UE}
:door: ${getRooms(room)}
${descriptionFormatted}

`;
}

function getFullName(name: string) {
    let split = name.split(" ");
    if (split.length < 2) return name;
    let firstName = split[0];
    let lastName = split[1];

    return firstName + " " + capitalizeFirstLetter(lastName);
}

function capitalizeFirstLetter(string: string) {
    string = string.toLowerCase();
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function getRooms(rooms: string) {
    let resultat = "";
    let roomsParsed = rooms.split(",");
    for (const room of roomsParsed) {
        resultat += room.split("-")[2] + "   ";
    }
    return resultat;
}

function getDay(date: string) {
    return moment(date).locale("fr").format("DD MMMM YYYY");
}

function formatDate(date: string) {
    let dateFormatted = moment(date).locale("fr").format("hh:mm A");
    let hour: any = dateFormatted.split(" ")[0].split(":")[0];
    let minuts = dateFormatted.split(" ")[0].split(":")[1];
    let isPm = dateFormatted.split(" ")[1] === "PM";

    if (isPm && hour !== "12") {
        hour = parseInt(hour) + 12;
    }

    return hour + ":" + minuts;
}

const EDT = new Map([
    ["AW", 40270],
    ["SIMO", 41451],
    ["ASSR", 40681],
    ["BIG-DATA", 41571],
]);

const colorLp = new Map([
    ["AW", ":red_circle:"],
    ["BIG DATA", ":purple_circle:"],
    ["SIMO", ":green_circle:"],
    ["ASSR", ":blue_circle:"],
]);

const customEmojis = new Map([
    ["BLANCHON HERVE", ":mx_claus:"],
    ["BRUNET-MANQUAT FRANCIS", ":mage:"],
    ["FRONT AGNES", ":woman:"],
    ["BLIGNY CAROLINE", ":flatbread:"],
    ["BONNAUD LAURENT", ":exploding_head:"],
    ["DUPUY CHESSA SOPHIE", " :woman_with_veil:"],
    ["BLANCO-LAINE GAELLE", " :woman_with_veil:"],
    ["RIEU DOMINIQUE", ":woman_superhero:"],
    ["MULOT MATHIEU", ":rat:"],
    ["COAT FRANCOISE", ":woman:"]
]);
