import ical from "node-ical"
import Discord from 'discord.js'
import readAW from "./edtReader"


export default class Bot {
    private client: Discord.Client

    constructor(client: Discord.Client){
        this.client = client

        client.on("ready", () => {
            console.log(client.users); 
        });
    }

    sendAWEdt(){
        readAW().then((response: ical.CalendarResponse) => {
            console.log(response);
        });

        // this.client.
    }
}