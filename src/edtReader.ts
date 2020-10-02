import ical from "node-ical"
import moment from "moment"

function readEdtId(id: number, date: string): Promise<ical.CalendarResponse> {
	return new Promise((resolve, reject) => {
		if (moment(date, 'YYYY-MM-DD', true).isValid()) {
			ical.async.fromURL(getUrlFromRessourcesId(id, date))
			.then((response) => {
				resolve(response)
			})
			.catch((error) => {
				reject(error)
			})
		} else {
			reject("Invalid date format (YYYY-MM-DD)")
		}
	})

	

	
}

function getUrlFromRessourcesId(id: number, date: string) {
	return `https://ade-uga.grenet.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?resources=${id}&projectId=8&calType=ical&firstDate=${date}&lastDate=${date}`;
}

export default { readEdtId }