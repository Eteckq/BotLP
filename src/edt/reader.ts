import getEdt, {DayEdt} from "./wrapper"
import moment from "moment"


function readEdtId(id: number, date: string): Promise<DayEdt> {
	return new Promise((resolve, reject) => {
		if (moment(date, 'YYYY-MM-DD', true).isValid()) {
			getEdt(getUrlFromRessourcesId(id, date))
			.then((day: DayEdt) => {
				day.day = getDay(date)
				resolve(day)
			})
			.catch((error) => {
				reject(error)
			})
		} else {
			reject("Invalid date format (YYYY-MM-DD)")
		}
	})

	

	
}

function getDay(date: string) {
    return moment(date).locale("fr").format("DD MMMM YYYY");
}

function getUrlFromRessourcesId(id: number, date: string) {
	return `https://ade-uga.grenet.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?resources=${id}&projectId=8&calType=ical&firstDate=${date}&lastDate=${date}`;
}

export default { readEdtId }