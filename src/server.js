require('dotenv').config({
	path: process.env.NODE_ENV === "test" ? ".env.testing" : ".env"
})

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

// Configuração
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use(require('./routes'));

// Porta e mensagem de log
app.listen(3333, () => {
	var date = new Date();
	var logDate = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

	console.clear()
	console.log(`O servidor está no ar!\n\n  + grupo: Quarteto Fantástico\n  + url: ${process.env.SERVER_URL}/\n  + feito com: 💙 e ☕\n\n-> Última atualização às ${logDate}\n`);
});