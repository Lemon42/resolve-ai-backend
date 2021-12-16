const axios = require('axios');
const sql = require('mssql');

async function locationValidation(lat, lon) {
	return axios.get(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`)
		.then(async (response) => {
			const pool = await sql.connect(require('../config/databaseConfig'));
			const request = pool.request();

			const city = (response.data?.address?.city || response.data?.address?.city_district) ?? '';

			if(city != ''){
				request.input('city', sql.VarChar, city);
				const cityResult = await request.query`SELECT Name FROM City WHERE Name = @city`;
	
				if (cityResult.rowsAffected != 1) {
					return false;
				} else {
					return city;
				}
			}

			return false;
		})
		.catch((err) => {
			var config = require('../config/databaseConfig')
			console.log(config)

			return 'false 3';
		})
}

module.exports = locationValidation;