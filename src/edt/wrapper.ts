import ical, { CalendarComponent, CalendarResponse, DateWithTimeZone } from "node-ical";
import moment from "moment";

export interface DayEdt {
    lp?: string,
    day?: string,
    classes: Classes[];
}

export interface Classes {
    name: string;
    teachers: string[];
    locations: string[];
    lps: string[];
    start: string;
    end: string;
}

export default function getEdt(url: string): Promise<DayEdt> {
    return new Promise((resolve, reject) => {
        ical.async
            .fromURL(url)
            .then((response) => {
                resolve(convertIcalToEdt(response));
            })
            .catch((error) => {
                reject(error);
            });
    });
}

function convertIcalToEdt(calender: CalendarResponse): DayEdt {
    let day: DayEdt = {
        classes: []
    };

    let classes = getClassesFromCalender(calender)

    for (const cour of classes) {
        day.classes.push({
            name: cour.summary as string,
            start: formatDate(cour.start as DateWithTimeZone),
            end: formatDate(cour.end as DateWithTimeZone),
            locations: getRooms(cour.location as string),
            teachers: getTeachersFromDescription(cour.description as string),
            lps: getLpsFromDescription(cour.description as string)
        })
    }

    return day

}

function getClassesFromCalender(calender: CalendarResponse): CalendarComponent[] {
    let cours: CalendarComponent[] = [];
    for (const key in calender) {
        cours.push(calender[key]);
    }
    cours.sort((a, b) => moment(a.start as DateWithTimeZone).unix() - moment(b.start as DateWithTimeZone).unix());
    return cours
}

function getLpsFromDescription(description: string) {
    let lps: string[] = []
    let descriptionLines = description.split("\n").slice(2, -3);
    if (descriptionLines.length == 0) {
        return lps
    }

    for (const line of descriptionLines) {
        if (lpList.includes(line)) {
            lps.push(line)
        }
    }

    return lps
}

function getTeachersFromDescription(description: string) {
    let teachers: string[] = []
    let descriptionLines = description.split("\n").slice(2, -3);
    if (descriptionLines.length == 0) {
        return teachers
    }

    for (const line of descriptionLines) {
        if (!lpList.includes(line)) {
            teachers.push(getFormattedTeacher(line))
        }
    }

    return teachers
}

function getRooms(location: string) {
    let resultat = [];
    let roomsParsed = location.split(",");
    for (const room of roomsParsed) {
        resultat.push(room.split("-")[2]);
    }
    return resultat;
}

// function formatCours(
//     UE: string,
//     start: string,
//     end: string,
//     room: string,
//     description: string
// ) {
//     let descriptionLines = (description as string).split("\n").slice(1, -3);
//     let descriptionFormatted = "[";

//     //:regional_indicator_w:
//     for (const description of descriptionLines) {
//         if (
//             description == "SIMO" ||
//             description == "AW" ||
//             description == "BIG DATA" ||
//             description == "ASSR"
//         ) {
//             let color = colorLp.get(description);

//             if (color) {
//                 descriptionFormatted += description + ", ";
//             }
//         }
//     }
//     descriptionFormatted = descriptionFormatted.slice(0, -2);
//     descriptionFormatted += "]\n";

//     for (let description of descriptionLines) {
//         if (
//             description != "BIG DATA" &&
//             description != "SIMO" &&
//             description != "AW" &&
//             description != ""
//         ) {
//             let emoji = customEmojis.get(description);

//             if (emoji) {
//                 descriptionFormatted += emoji + " " + getFullName(description) + "  ";
//             } else {
//                 descriptionFormatted += getFullName(description) + "  ";
//             }
//         }
//     }

//     let startFormat = formatDate(start);
//     let endFormat = formatDate(end);

//     return `
// :clock2: **${startFormat}h - ${endFormat}h**            :pencil: ${UE}
// :door: ${getRooms(room)}
// ${descriptionFormatted}

// `;
// }

// function getEdtMsg(lp: string, date: string) {
//     return new Promise((resolve, reject) => {
//         let code = EDT.get(lp);

//         if (!code) {
//             reject("Code invalide");
//         } else {
//             reader
//                 .readEdtId(code, date)
//                 .then((response) => {
//                     resolve(response)
//                     return
//                     let message = "";

//                     let cours: any[] = [];
//                     // for (const key in response) {
//                     //     cours.push(response[key]);
//                     // }

//                     cours.sort((a, b) => moment(a.start).unix() - moment(b.start).unix());

//                     for (const cour of cours) {
//                         message += formatCours(
//                             cour.summary as any,
//                             cour.start as any,
//                             cour.end as any,
//                             cour.location as any,
//                             cour.description as any
//                         );
//                     }

//                     resolve(message);
//                 })
//                 .catch((error) => {
//                     console.log(error);

//                     reject(error);
//                 });
//         }
//     });
// }

function formatDate(date: DateWithTimeZone) {
    let dateFormatted = moment(date).locale("fr").format("hh:mm A");
    let hour: any = dateFormatted.split(" ")[0].split(":")[0];
    let minuts = dateFormatted.split(" ")[0].split(":")[1];
    let isPm = dateFormatted.split(" ")[1] === "PM";

    if (isPm && hour !== "12") {
        hour = parseInt(hour) + 12;
    }

    return hour + ":" + minuts;
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

function getFormattedTeacher(name: string) {
    let emoji = customEmojis.get(name)
    let capitalizeName = getFullName(name)

    if (emoji) {
        return emoji + " " + capitalizeName
    }

    return capitalizeName
}

// const colorLp = new Map([
//     ["AW", ":red_circle:"],
//     ["BIG DATA", ":purple_circle:"],
//     ["SIMO", ":green_circle:"],
//     ["ASSR", ":blue_circle:"],
// ]);

const lpList = ["AW", "SIMO", "ASSR", "BIG DATA"]

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
    ["COAT FRANCOISE", ":woman:"],
]);
