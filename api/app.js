const express = require('express');
const morgan = require('morgan');
const setup = require('./setup');
const config = require('./config');
const voice = require('./routes/voice');
const status = require('./routes/status');
const call = require('./routes/call');
const sms = require('./routes/sms');
const get = require('./routes/get');
const stream = require('./routes/stream');
const auth = require('./middleware/authentification');

// Run setup if configuration is not done
if (config.setupdone == 'false') setup();

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));

// Define routes
app.post('/voice/:apipassword', auth, voice);
app.post('/status/:apipassword', auth, status);
app.post('/call', auth, call);
app.post('/sms', auth, sms);
app.get('/get', auth, get);
app.get('/stream/:service', stream);

// Default route for 404 not found
app.use((req, res) => {
    res.status(404).json({ error: 'Not found, or bad request method.' });
});

app.listen(3001, () => console.log('Express server is running on localhost:3001'));

module.exports = app;
