const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const generatePassword = require('generate-password');

module.exports = function(_req, _res) {
    const db = new sqlite3.Database('./db/data.db');
    db.serialize(() => {
        db.run('CREATE TABLE IF NOT EXISTS calls (itsfrom TEXT, itsto TEXT, digits TEXT, callSid TEXT, status TEXT, date TEXT, user TEXT, name TEXT, service TEXT)');
        db.run('CREATE TABLE IF NOT EXISTS sms (itsfrom TEXT, itsto TEXT, smssid TEXT, content TEXT, status TEXT, date TEXT, user TEXT, service TEXT)');
    });

    // Automatically generate a new API password if not set
    fs.readFile('config.js', 'utf-8', function(err, data) {
        if (err) throw err;

        const password = generatePassword.generate({ length: 20, numbers: true });
        const newValue = data.replace(/passwordtochange/gim, password);

        fs.writeFile('config.js', newValue, 'utf-8', function(err) {
            if (err) throw err;

            console.log('Setup the new API password: done.');

            fs.readFile('config.js', 'utf-8', function(err, data) {
                if (err) throw err;

                const newValue = data.replace(/false/gim, 'true');

                fs.writeFile('config.js', newValue, 'utf-8', function(err) {
                    if (err) throw err;

                    console.log('Automatic setup: done.');
                });
            });
        });
    });
};
