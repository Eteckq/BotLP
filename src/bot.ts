import ical from "node-ical"
import Discord from 'discord.js'
import reader from "./edtReader"
import moment from "moment"

export default class Bot {
    private client: Discord.Client

    constructor(client: Discord.Client) {
        this.client = client

        client.on("ready", () => {
            console.log("Bot UP!");
        })

        client.on("message", async message => {
            if (message.author.bot) return;
            if (!message.content.startsWith('!')) return;
            const args = message.content.slice(1).trim().split(/ +/g);
            if (args.length === 0) return
            let command = args.shift();
            if (command === undefined) return
            command = command.toLowerCase()

            if (command === "aw") {
                let m = await message.channel.send("Récupération de l'emplois du temps: AW...");
                reader.readAW().then((response: ical.CalendarResponse) => {
                    let message = ""

                    let cours: any[] = []
                    for (const key in response) {
                        cours.push(response[key])
                    }

                    cours.sort((a, b) => moment(a.start).unix() - moment(b.start).unix())

                    for (const cour of cours) {
                        message += formatCours(cour.summary as any, cour.start as any, cour.end as any, cour.location as any, cour.description as any)
                    }

                    m.edit("**" + getDay(Date.now() as any) + "** AW\n" + message);
                });
            }

            if (command === "simo") {
                let m = await message.channel.send("Récupération de l'emplois du temps: SIMO...");
                reader.readSIMO().then((response: ical.CalendarResponse) => {
                    let message = ""

                    let cours: any[] = []
                    for (const key in response) {
                        cours.push(response[key])
                    }

                    cours.sort((a, b) => moment(a.start).unix() - moment(b.start).unix())

                    for (const cour of cours) {
                        message += formatCours(cour.summary as any, cour.start as any, cour.end as any, cour.location as any, cour.description as any)
                    }

                    m.edit("**" + getDay(Date.now() as any) + "** SIMO\n" + message);
                });
            }
        });
    }

    /* sendAWEdt() {
        readAW().then((response: ical.CalendarResponse) => {
            console.log(response);
        });
    } */
}

function formatCours(UE: string, start: string, end: string, room: string, description: string) {

    let descriptionLines = (description as string).split("\n").slice(1, -3)
    let descriptionFormatted = "["

    //:regional_indicator_w:
    for (const description of descriptionLines) {
        
        if (description == "SIMO" || description == "AW" || description == "BIG DATA" || description == "ASSR") {
            let color = colorLp.get(description)

            if (color) {
                descriptionFormatted += description + ", "
            }

        }
    }
    descriptionFormatted=descriptionFormatted.slice(0,-2)
    descriptionFormatted += "]\n"

    for (let description of descriptionLines) {
        if (description != "BIG DATA" && description != "SIMO" && description != "AW" && description != "") {

            let emoji = customEmojis.get(description)

            if (emoji) {
                descriptionFormatted += emoji + " " + getFullName(description) + "  "
            } else {
                descriptionFormatted += getFullName(description) + "  "
            }

        }
    }

    let startFormat = formatDate(start)
    let endFormat = formatDate(end)




    return `
:clock2: **${startFormat}h - ${endFormat}h**            :pencil: ${UE}
:door: ${getRooms(room)}
${descriptionFormatted}

`
}

function getFullName(name: string){
    let split = name.split(" ")
    if(split.length < 2) return name
    let firstName = split[0]
    let lastName = split[1]

    return firstName + " " + capitalizeFirstLetter(lastName)
}

function capitalizeFirstLetter(string: string) {
    string = string.toLowerCase()
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

function getRooms(rooms: string){
    let resultat = ""
    let roomsParsed = rooms.split(",")
    for (const room of roomsParsed) {
        resultat += room.split("-")[2] + "   "
    }
    return resultat
}

function getDay(date: string) {
    return moment(date).locale("fr").format("DD MMMM YYYY")
}

function formatDate(date: string) {
    let dateFormatted = moment(date).format("hh:mm A")
    let hour: any = dateFormatted.split(" ")[0].split(":")[0]
    let minuts = dateFormatted.split(" ")[0].split(":")[1]
    let isPm = dateFormatted.split(" ")[1] === "PM"

    if (isPm && hour !== "12") {
        hour = parseInt(hour) + 12
    }

    return hour + ":" + minuts
}

const colorLp = new Map([
    ["AW", ":red_circle:"],
    ["BIG DATA", ":purple_circle:"],
    ["SIMO", ":green_circle:"],
    ["ASSR", ":blue_circle:"]
]);

const customEmojis = new Map([
    ["BLANCHON HERVE", ":mx_claus:"],
    ["BRUNET-MANQUAT FRANCIS", ":mage:"],
    ["FRONT AGNES", ":woman:"],
    ["BLIGNY CAROLINE", ":flatbread:"],
    ["BONNAUD LAURENT", ":exploding_head:"],
    ["DUPUY CHESSA SOPHIE", " :woman_with_veil:"],
    ["BLANCO-LAINE GAELLE", " :woman_with_veil:"]
]);

