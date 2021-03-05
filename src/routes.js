//const { request, response } = require('express');
const routes = require('express').Router();

routes.get('/test',  async (request, response) => {
	response.json({message: 'top'})
});

module.exports = routes;