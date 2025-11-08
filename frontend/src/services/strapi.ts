import strapiReal from './strapi.real';
import strapiMock from './strapi.mock';
let strapiLib;
// exporter l eb on strapi en fonciton qu'on est en local ou ne prod. En detectant si le site est sur localhost
if (window.location.hostname === 'localhost') {
    strapiLib = strapiMock;
    console.log("Using fack data")
} else {
    strapiLib = strapiReal;
}


export default strapiLib;
