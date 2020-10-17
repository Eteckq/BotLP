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

    return ":cowboy: " + capitalizeName
}

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
    ["MULOT MATHIEU", ":man_with_chinese_cap:"],
    ["COAT FRANCOISE", ":woman:"],
]);
