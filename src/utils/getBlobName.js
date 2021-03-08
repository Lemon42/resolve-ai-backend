const getBlobName = originalName => {
	const identifier = Math.random().toString().replace(/0\./, '');
	const newName = originalName.replace(/\s/g, '_');
	return `${identifier}-${newName}`;
};

module.exports = getBlobName;