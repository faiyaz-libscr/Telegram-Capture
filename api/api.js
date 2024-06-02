const app = require('./app');
const config = require('./config');
const http = require('http');

const server = http.createServer(app);
server.listen(config.port || 80, function() {
    console.log('OTP BOT working on *:', config.port);
});
