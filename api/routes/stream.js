const fs = require('fs');
const config = require('../config');

module.exports = function(request, response) {
    const service = request.params.service + 'filepath';

    if (config[service] && config[service] != undefined) {
        const filePath = config[service];
        const stat = fs.statSync(filePath);
        const fileSize = stat.size;

        response.writeHead(200, {
            'Content-Length': fileSize,
            'Content-Type': 'audio/mpeg'
        });

        const readStream = fs.createReadStream(filePath);
        readStream.pipe(response);
    } else {
        response.status(200).json({ error: 'Bad service.' });
    }
};
