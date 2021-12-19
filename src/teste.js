const { poolPromise } = require('./database');

async function test() {
	const pool = await poolPromise;
	const request = pool.request();
	const responseId = await request.query`SELECT ProblemID FROM ProblemImages`;

	console.log(responseId);
}

test();