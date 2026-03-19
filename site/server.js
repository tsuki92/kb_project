const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors());

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'tour_db',
    password: '12345',
    port: 5432,
});

app.post('/api/login', async (req, res) => {
    const { username, password, roleName } = req.body;
    const result = await pool.query(
        'SELECT u.* FROM users u JOIN roles r ON u.role_id = r.id WHERE u.username=$1 AND u.password=$2 AND r.name=$3',
        [username, password, roleName]
    );
    if (result.rows.length > 0) res.json({ success: true });
    else res.json({ success: false });
});

app.get('/api/staff', async (req, res) => {
    const r = await pool.query('SELECT * FROM staff');
    res.json(r.rows);
});

app.get('/api/requests', async (req, res) => {
    const r = await pool.query('SELECT r.*, s.name as staff_name FROM requests r LEFT JOIN staff s ON r.staff_id = s.id');
    res.json(r.rows);
});

app.post('/api/requests', async (req, res) => {
    const { title, address, staff_id } = req.body;
    await pool.query('INSERT INTO requests (title, address, staff_id) VALUES ($1, $2, $3)', [title, address, staff_id]);
    res.json({ success: true });
});

app.listen(3000, () => console.log('Сервер запущен на http://localhost:3000'));
