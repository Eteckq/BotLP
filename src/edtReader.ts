import ical from "node-ical"
import moment from "moment"
const config = require('../config.json');

function readAW() {
	return ical.async.fromURL(getUrlFromRessourcesId(config.AW_URL))
};
function readSIMO(){
	return ical.async.fromURL(getUrlFromRessourcesId(config.SIMO_URL))
};

function getUrlFromRessourcesId(id: number) {
	//2020-10-01
	let date = moment(Date.now()).format("YYYY-MM-DD")
	return `https://ade-uga.grenet.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?resources=${id}&projectId=8&calType=ical&firstDate=${date}&lastDate=${date}`;
}

export default {readAW, readSIMO}