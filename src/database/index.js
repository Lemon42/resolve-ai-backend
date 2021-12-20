const sql = require('mssql');
const config = require('../config/databaseConfig');

const poolPromise = new sql.ConnectionPool(config)
	.connect()
	.then(pool => {
		console.log('++ Conexão com o banco de dados okay ++\n');
		return pool;
	})
	.catch(err => console.log('Conexão com o banco de dados falhou!\nErro: ', err));

function closeConnection(time) {
	console.log(`Fechando a conexão com o bando de dados em ${time}seg!`);

	setTimeout(() => { // Precisa do timeout para em caso de teste dar tempo da conexão ser aberta
		sql.close();
	}, (time * 1000));
}

module.exports = {
	sql, poolPromise, closeConnection
}