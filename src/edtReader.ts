import ical from "node-ical"
const config = require('../config.json');

const readAW = () =>{
	return ical.fromURL(getUrlFromRessourcesId(config.AW_URL))
};

function getUrlFromRessourcesId(id: number) {
	return `https://ade-uga.grenet.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?resources=${id}&projectId=8&calType=ical`;
}

export default readAW