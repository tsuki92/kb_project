// 1. Вход по Логину и Паролю
async function realLogin() {
    const user = document.getElementById('login-user').value;
    const pass = document.getElementById('login-pass').value;

    const res = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: pass })
    });
    const data = await res.json();

    if (data.success) {
        localStorage.setItem('userRole', data.role);
        alert('Успешный вход! Ваша роль: ' + data.role);
        window.location.href = 'page2.html';
    } else {
        alert('Неверный логин или пароль!');
    }
}

// 2. Проверка прав и загрузка данных
document.addEventListener('DOMContentLoaded', async () => {
    const role = localStorage.getItem('userRole');
    const path = window.location.pathname;

    // Защита страницы персонала
    if (role === 'Управляющий магазином' && path.includes('page1.html')) {
        alert('Доступ закрыт!');
        window.location.href = 'page2.html';
        return;
    }

    if (path.includes('page1.html')) loadStaff();
    if (path.includes('page2.html')) {
        loadRequests();
        fillStaffSelect(); // Заполняем список сотрудников в форме
    }
});

// 3. Загрузка персонала
async function loadStaff() {
    const res = await fetch('http://localhost:3000/api/staff');
    const data = await res.json();
    const grid = document.getElementById('staff-container');
    if (!grid) return;
    grid.innerHTML = data.map(item => `
        <div class="card"><div class="card-info">
            <p><b>${item.name}</b></p><p>${item.spec}</p><p>Статус: ${item.status}</p>
        </div></div>`).join('');
}

// 4. Загрузка заявок
async function loadRequests() {
    const res = await fetch('http://localhost:3000/api/requests');
    const data = await res.json();
    const grid = document.getElementById('requests-container');
    if (!grid) return;
    grid.innerHTML = data.map(item => `
        <div class="card"><div class="card-info">
            <p><b>${item.title}</b></p><p>Адрес: ${item.address}</p>
            <p>Сотрудник: ${item.staff_name || 'Не назначен'}</p>
        </div></div>`).join('');
}

// 5. Заполнение выпадающего списка сотрудников в форме
async function fillStaffSelect() {
    const res = await fetch('http://localhost:3000/api/staff');
    const staff = await res.json();
    const select = document.getElementById('req-staff');
    if (!select) return;
    staff.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = s.name;
        select.appendChild(opt);
    });
}

// 6. Создание заявки
async function submitRequest() {
    const title = document.getElementById('req-title').value;
    const address = document.getElementById('req-address').value;
    const staff_id = document.getElementById('req-staff').value;

    await fetch('http://localhost:3000/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, address, date: 'сегодня', staff_id })
    });
    location.reload();
}








