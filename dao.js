const mysql = require('mysql');
const con = mysql.createConnection({
    host:               'localhost',
    user:               'root',
    password:           '',
    database:           'project4481-2.0'
});


module.exports = {

    //  Insert client id to its table (client)
    getClientId(id, success, failure = console.log) {
        con.query('INSERT INTO client SET client_id = ?', id, (err, rows) => {
            if(err == null) {
                console.log(`${id} has been added to client table`);
            } else {
                failure(err);
            }
        });
    },

    //  Get user and password for authentication --> return name and provider ID
    getProviderByEmail(queries, success, failure = console.log) {
        con.query('SELECT name, provider_id FROM provider WHERE email = ? AND password = ?', [queries.email, queries.password], (err, rows) => {   
            if(err == null) {
                success(rows[0]);
            } else {
                failure(err);
            }
        });
    },

    //  get conversation history
    getConversationHistory(queries, success, failure = console.log) {
        con.query('SELECT * FROM message WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)', [queries.sender, queries.receiver, queries.receiver, queries.sender], (err, rows) => {
            if(err == null) {
                success(rows);
            } else {
                failure(err);
            }
        });
    },

    postConversation(queries, success, failure = console.log) {
        con.query('INSERT INTO message (sender_id, receiver_id, content) VALUES (?, ?, ?)', [queries.sender, queries.receiver, queries.content], (err, rows) => {
            if(err == null) {
                success(console.log(`${queries.content} added to table`));
            } else {
                failure(err);
            }
        });
    },

    //  Chat Table Queries
    createChat(queries, success, failure = console.log) {
        con.query('INSERT INTO chat SET user1_id = ? AND user2_id = ?', [queries.user1, queries.user2], (err, rows) => {
            if(err == null) {
                console.log('Chat added!');
            } else {
                failure(err);
            }
        });
    },

    getChatID(queries, success, failure = console.log) {
        con.query('SELECT chat_id FROM chat WHERE (user1_id = ? AND user2_id = ?) OR (user2_id = ? AND user1_id = ?)', [queries.user1, queries.user2, queries.user1, queries.user2], (err, rows) => {
            if(err == null) {
                success(rows[0]);
            } else {
                failure(err);
            }
        });
    },

};