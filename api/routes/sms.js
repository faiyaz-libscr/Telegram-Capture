const sqlite3 = require('sqlite3').verbose();
const config = require('../config');
const client = require('twilio')(config.accountSid, config.authToken);

module.exports = function(request, response) {
    const db = new sqlite3.Database('./db/data.db');
    const to = request.body.to || null;
    const user = request.body.user || null;
    const service = request.body.service || null;

    if (to == null || user == null || service == null) {
        return response.status(200).json({ error: 'Please post all the informations needed.' });
    }

    if (config[service] == undefined) {
        return response.status(200).json({ error: 'The service wasn\'t recognised.' });
    }

    if (to.match(/^\d{8,14}$/g) && user && service) {
        client.messages.create({
            body: config[service],
            from: config.callerid,
            statusCallback: config.serverurl + '/status/' + config.apipassword,
            to: '+' + to
        }).then((message) => {
            response.status(200).json({ smssid: message.sid });
            db.run('INSERT INTO sms(smssid, user, itsfrom, itsto, content, service, date) VALUES(?, ?, ?, ?, ?, ?, ?)', [message.sid, user, config.callerid, to, config[service], service, Date.now()], function(err) {
                if (err) {
                    console.log(err.message);
                }
            });
        });
    } else {
        response.status(200).json({ error: 'Bad phone number or username or service.' });
    }
};
