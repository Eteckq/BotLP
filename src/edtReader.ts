import ical from "node-ical"
import moment from "moment"
const config = require('../config.json');

function readEdtId(id: number){
	return ical.async.fromURL(getUrlFromRessourcesId(id))
}

function getUrlFromRessourcesId(id: number) {
	//2020-10-01
	let date = moment(Date.now()).format("YYYY-MM-DD")
	return `https://ade-uga.grenet.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?resources=${id}&projectId=8&calType=ical&firstDate=${date}&lastDate=${date}`;
}

export default {readEdtId}