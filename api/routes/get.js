const sqlite3 = require('sqlite3').verbose();

module.exports = function(request, response) {
    const db = new sqlite3.Database('./db/data.db');
    const callSid = request.body.callSid;

    db.get('SELECT * FROM calls WHERE callSid = ?', [callSid], (err, row) => {
        if (err) {
            console.log(err.message);
            return response.status(200).json({ error: 'Invalid callSid.' });
        }

        if (row == undefined) {
            return response.status(200).json({ error: 'Invalid callSid.' });
        }

        db.get('SELECT callSid FROM calls WHERE callSid = ?', [callSid], (err, row) => {
            if (err) {
                console.log(err.message);
                return response.status(200).json({ error: 'Invalid callSid.' });
            }

            response.status(200).json({
                itsto: row.itsto,
                itsfrom: row.itsfrom,
                callSid: row.callSid,
                digits: row.digits,
                status: row.status,
                date: row.date,
                user: row.user,
                service: row.service,
                otplength: row.otplength
            });
        });
    });
};
