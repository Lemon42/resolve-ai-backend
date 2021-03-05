module.exports = {
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	server: process.env.DB_SERVER,
	database: process.env.DATABASE,
	"options": {
		"encrypt": true,
		"enableArithAbort": true
	}
}