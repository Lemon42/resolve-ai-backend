const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

// Configuração
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

const routes = require('express').Router();
routes.get('/test', (request, response) => {
	return response.json({message: 'Okay! Tudo certo'});
});

app.use(routes);

// Porta e mensagem de log
app.listen(3333, () => {
	var date = new Date();
	var logDate = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

	console.clear()
	console.log(`O servidor está no ar!\n\n  + Porta: 3333\n  + Url: http://localhost:3333/\n\n> Última atualização às ${logDate}\n`);
});