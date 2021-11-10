async function errorHandling(err, res) {
	res.status(400).json({ error: 'Preenchimento inválido de informações!', type: err });
	console.error(err);
}

module.exports = errorHandling;