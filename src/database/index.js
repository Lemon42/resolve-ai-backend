const sql = require('mssql');
const config = require('../config/databaseConfig');

const poolPromise = new sql.ConnectionPool(config)
	.connect()
	.then(pool => {
		console.log('++ Conexão com o banco de dados okay ++\n');
		return pool;
	})
	.catch(err => console.log('Conexão com o banco de dados falhou!\nErro: ', err));

module.exports = {
	sql, poolPromise
}