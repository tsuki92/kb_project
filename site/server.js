const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

// ПОДКЛЮЧЕНИЕ К POSTGRES (Замени свои данные!)
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'tsuki',
    password: '12345', 
    port: 5432,
});

// 1. АУТЕНТИФИКАЦИЯ (ЛОГИН + ПАРОЛЬ)
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query(
            'SELECT u.*, r.role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.username = $1 AND u.password = $2',
            [username, password]
        );
        if (result.rows.length > 0) {
            res.json({ success: true, role: result.rows[0].role_name });
        } else {
            res.status(401).json({ success: false, message: 'Неверный логин или пароль' });
        }
    } catch (err) { res.status(500).send(err.message); }
});

// 2. ПОЛУЧЕНИЕ ПЕРСОНАЛА
app.get('/api/staff', async (req, res) => {
    const result = await pool.query('SELECT * FROM staff');
    res.json(result.rows);
});

// 3. ПОЛУЧЕНИЕ ЗАЯВОК (С ИМЕНЕМ СОТРУДНИКА)
app.get('/api/requests', async (req, res) => {
    const result = await pool.query(`
        SELECT r.*, s.full_name as staff_name 
        FROM requests r 
        LEFT JOIN staff s ON r.staff_id = s.id
    `);
    res.json(result.rows);
});

// 4. СОЗДАНИЕ ЗАЯВКИ (С НАЗНАЧЕНИЕМ СОТРУДНИКА)
app.post('/api/requests', async (req, res) => {
    const { title, address, date, staff_id } = req.body;
    await pool.query(
        'INSERT INTO requests (title, address, date_range, staff_id) VALUES ($1, $2, $3, $4)',
        [title, address, date, staff_id]
    );
    res.status(201).send('Created');
});

app.listen(3000, () => console.log('Сервер запущен на http://localhost:3000'));
