require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    ssl: { rejectUnauthorized: false },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.getConnection((err, connection) => {
    if (err) {
        console.log("Database connection failed! ❌", err);
    } else {
        console.log("MySQL Database Connected Successfully! ✅");
        connection.release();
    }
});

app.get('/', (req, res) => {
    res.send("Wow! Our MIU Programming Club Backend is running!");
});

app.get('/members', (req, res) => {
    const sqlQuery = `
        SELECT m1.*, CONCAT(m2.first_name, ' ', m2.last_name) AS mentor_name 
        FROM Members m1 
        LEFT JOIN Members m2 ON m1.mentor_id = m2.student_id
    `;
    db.query(sqlQuery, (err, result) => {
        if (err) {
            console.log(err);
            res.send("Failed to fetch data");
        } else {
            res.send(result);
        }
    });
});

app.get('/events', (req, res) => {
    const sqlQuery = "SELECT * FROM Events"; 
    db.query(sqlQuery, (err, result) => {
        if (err) res.send("Failed to fetch events");
        else res.send(result);
    });
});

app.get('/instruments', (req, res) => {
    const sqlQuery = "SELECT * FROM Instruments";
    db.query(sqlQuery, (err, result) => {
        if (err) res.send("Failed to fetch instruments");
        else res.send(result);
    });
});

app.get('/teams', (req, res) => {
    const sqlQuery = "SELECT * FROM Teams";
    db.query(sqlQuery, (err, result) => {
        if (err) res.send("Failed to fetch teams");
        else res.send(result);
    });
});

app.get('/team-members', (req, res) => {
    const sqlQuery = `
        SELECT Teams.team_id, Teams.team_name, 
               GROUP_CONCAT(CONCAT(Members.first_name, ' ', Members.last_name, ' (', Members.student_id, ')') SEPARATOR '<br>') AS all_members
        FROM Team_Members
        JOIN Members ON Team_Members.student_id = Members.student_id
        JOIN Teams ON Team_Members.team_id = Teams.team_id
        GROUP BY Teams.team_id, Teams.team_name
    `;
    db.query(sqlQuery, (err, result) => {
        if (err) res.send("Failed to fetch team members");
        else res.send(result);
    });
});

app.get('/event-registrations', (req, res) => {
    const sqlQuery = `
        SELECT Participates.team_id, Participates.event_id, Teams.team_name, Events.title AS event_title, Participates.participate_date
        FROM Participates
        JOIN Teams ON Participates.team_id = Teams.team_id
        JOIN Events ON Participates.event_id = Events.event_id
    `;
    db.query(sqlQuery, (err, result) => {
        if (err) res.send("Failed to fetch event registrations");
        else res.send(result);
    });
});

app.get('/accounts', (req, res) => {
    const sqlQuery = `
        SELECT Accounts.transaction_id, Accounts.transaction_type, Accounts.amount, Accounts.purpose, Accounts.transaction_date, 
               Members.first_name, Members.last_name 
        FROM Accounts 
        LEFT JOIN Members ON Accounts.handled_by = Members.student_id
    `;
    db.query(sqlQuery, (err, result) => {
        if (err) {
            console.log("Error fetching accounts:", err);
            res.send("Failed to fetch accounts");
        } else {
            res.send(result);
        }
    });
});

app.post('/add-member', (req, res) => {
    const { student_id, first_name, last_name, email, cf_handle, role, designation, mentor_id } = req.body;
    const finalMentorId = mentor_id ? mentor_id : null; 

    const sqlQuery = "INSERT INTO Members (student_id, first_name, last_name, email, cf_handle, role, designation, mentor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    
    db.query(sqlQuery, [student_id, first_name, last_name, email, cf_handle, role, designation, finalMentorId], (err, result) => {
        if (err) res.send("Failed to add member");
        else res.send("Member added successfully! ✅");
    });
});

app.post('/add-team', (req, res) => {
    const { team_name } = req.body;
    const sqlQuery = "INSERT INTO Teams (team_name) VALUES (?)";
    db.query(sqlQuery, [team_name], (err, result) => {
        if (err) res.send("Failed to add team");
        else res.send("Team added successfully! ✅");
    });
});

app.post('/add-event', (req, res) => {
    const { title, description, event_date, location } = req.body;
    const sqlQuery = "INSERT INTO Events (title, description, event_date, location) VALUES (?, ?, ?, ?)";
    db.query(sqlQuery, [title, description, event_date, location], (err, result) => {
        if (err) res.send("Failed to add event");
        else res.send("Event added successfully! ✅");
    });
});

app.post('/assign-team', (req, res) => {
    const { student_id, team_id } = req.body;
    const sqlQuery = "INSERT INTO Team_Members (student_id, team_id) VALUES (?, ?)";
    db.query(sqlQuery, [student_id, team_id], (err, result) => {
        if (err) res.send("Failed to assign member to team");
        else res.send("Member assigned to team successfully! ✅");
    });
});

app.post('/register-event', (req, res) => {
    const { team_id, event_id, participate_date } = req.body;
    const sqlQuery = "INSERT INTO Participates (team_id, event_id, participate_date) VALUES (?, ?, ?)";
    db.query(sqlQuery, [team_id, event_id, participate_date], (err, result) => {
        if (err) res.send("Failed to register team for event");
        else res.send("Team registered for event successfully! ✅");
    });
});

app.post('/add-account', (req, res) => {
    const { transaction_type, amount, purpose, transaction_date, handled_by } = req.body;
    const sqlQuery = "INSERT INTO Accounts (transaction_type, amount, purpose, transaction_date, handled_by) VALUES (?, ?, ?, ?, ?)";
    db.query(sqlQuery, [transaction_type, amount, purpose, transaction_date, handled_by], (err, result) => {
        if (err) res.send("Failed to add account record");
        else res.send("Account record added successfully! ✅");
    });
});

app.post('/add-instrument', (req, res) => {
    const { name, quantity, condition_status, maintained_by } = req.body;
    const sqlQuery = "INSERT INTO Instruments (name, quantity, condition_status, maintained_by) VALUES (?, ?, ?, ?)";
    db.query(sqlQuery, [name, quantity, condition_status, maintained_by], (err, result) => {
        if (err) res.send("Failed to add instrument");
        else res.send("Instrument added successfully! ✅");
    });
});

app.post('/login', (req, res) => {
    const { student_id, email } = req.body;
    const sqlQuery = "SELECT * FROM Members WHERE student_id = ? AND email = ?";
    db.query(sqlQuery, [student_id, email], (err, result) => {
        if (err) {
            res.send("Error");
        } else if (result.length > 0) {
            if (result[0].role === 'Admin') res.send("Success"); 
            else res.send("NotAdmin"); 
        } else {
            res.send("NotFound"); 
        }
    });
});

app.delete('/delete-member/:id', (req, res) => {
    const id = req.params.id;
    db.query("DELETE FROM Members WHERE student_id = ?", [id], (err, result) => {
        if (err) res.send("Failed to delete member.");
        else res.send("Member deleted successfully! 🗑️");
    });
});

app.delete('/delete-team/:id', (req, res) => {
    const id = req.params.id;
    db.query("DELETE FROM Teams WHERE team_id = ?", [id], (err, result) => {
        if (err) res.send("Failed to delete team.");
        else res.send("Team deleted successfully! 🗑️");
    });
});

app.delete('/delete-event/:id', (req, res) => {
    const id = req.params.id;
    db.query("DELETE FROM Events WHERE event_id = ?", [id], (err, result) => {
        if (err) res.send("Failed to delete event.");
        else res.send("Event deleted successfully! 🗑️");
    });
});

app.delete('/delete-account/:id', (req, res) => {
    const id = req.params.id;
    db.query("DELETE FROM Accounts WHERE transaction_id = ?", [id], (err, result) => {
        if (err) res.send("Failed to delete account record.");
        else res.send("Account record deleted successfully! 🗑️");
    });
});

app.delete('/delete-instrument/:id', (req, res) => {
    const id = req.params.id;
    db.query("DELETE FROM Instruments WHERE instrument_id = ?", [id], (err, result) => {
        if (err) res.send("Failed to delete instrument.");
        else res.send("Instrument deleted successfully! 🗑️");
    });
});

app.delete('/delete-event-registration/:team_id/:event_id', (req, res) => {
    const teamId = req.params.team_id;
    const eventId = req.params.event_id;
    db.query("DELETE FROM Participates WHERE team_id = ? AND event_id = ?", [teamId, eventId], (err, result) => {
        if (err) res.send("Failed to cancel registration.");
        else res.send("Registration cancelled successfully! 🗑️");
    });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running beautifully on port ${PORT}`);
});