const { poolPromise, sql } = require('../database');

async function authenticateAdmin(req, res, next) {
	if (!req.headers.token || !req.headers.email) {
		res.sendStatus(404);

	} else {
		const pool = await poolPromise;
		const request = pool.request();

		request.input('token', sql.Char, req.headers.token);
		request.input('email', sql.VarChar, req.headers.email);

		const result = await request.query`SELECT * FROM Admins
			WHERE @token = Token AND @email = Email`;

		if (result.rowsAffected == 1) {
			next();
		} else {
			res.sendStatus(404);
		}
	}
}

module.exports = authenticateAdmin;