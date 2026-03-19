
// 1. ПЕРЕКЛЮЧЕНИЕ РОЛИ (ПОКАЗ ФОРМЫ)
function handleLogin(role) {
    console.log("Выбрана роль для входа:", role);

    // Определяем, находимся ли мы на главной странице (index.html)
    // Учитываем, что путь может быть как "index.html", так и просто "/" или иметь папку в пути
    const currentPath = window.location.pathname.toLowerCase();
    const isIndexPage = currentPath.endsWith('index.html') || currentPath.endsWith('/') || currentPath.endsWith('/index.html');

    // Если мы НЕ на главной, переходим на неё и запоминаем роль
    if (!isIndexPage) {
        localStorage.setItem('tempRole', role);
        window.location.href = 'index.html';
        return;
    }

    // Если мы уже на главной, показываем блок логина
    const loginBox = document.getElementById('login-section');
    if (loginBox) {
        loginBox.style.display = 'block';
        document.getElementById('display-role-name').innerText = role;
        loginBox.scrollIntoView({ behavior: 'smooth' }); // Плавно прокручиваем к форме
    }
}

// 2. ОТПРАВКА ДАННЫХ ЛОГИНА
async function submitLogin() {
    const roleName = document.getElementById('display-role-name').innerText;
    const username = document.getElementById('u-name').value;
    const password = document.getElementById('u-pass').value;

    console.log("Попытка входа:", { username, roleName });

    try {
        const res = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, roleName })
        });
        const data = await res.json();

        if (data.success) {
            localStorage.setItem('userRole', roleName);
            localStorage.removeItem('tempRole'); // Убираем временную роль, если была
            console.log("Роль успешно сохранена в localStorage:", localStorage.getItem('userRole'));

            alert('Вход выполнен! Добро пожаловать, ' + roleName);

            // Переходим на страницу Заявок (page2.html)
            window.location.replace('page2.html');
        } else {
            alert('Ошибка: Неверный логин или пароль для роли ' + roleName);
        }
    } catch (err) {
        console.error("Ошибка сервера:", err);
        alert("Сервер не отвечает! Проверь, запущен ли node server.js");
    }
}

// 3. ГЛАВНАЯ ПРОВЕРКА (ЗАЩИТА СТРАНИЦ)
document.addEventListener('DOMContentLoaded', () => {
    const role = localStorage.getItem('userRole');
    const currentPath = window.location.pathname.toLowerCase();

    // Определяем, находимся ли мы на главной странице (index.html)
    const isIndexPage = currentPath.endsWith('index.html') || currentPath.endsWith('/') || currentPath.endsWith('/index.html');
    const isPersonnelPage = currentPath.indexOf('page1.html') !== -1;
    const isRequestsPage = currentPath.indexOf('page2.html') !== -1;

    console.log("Текущая страница:", currentPath);
    console.log("Текущая роль в системе:", role);

    // ЗАЩИТА: Если роли нет И мы НЕ на главной странице
    if (!role && !isIndexPage) {
        console.warn("Доступ запрещен: Роль не найдена. Перенаправление на index.html");
        window.location.replace('index.html'); // Используем replace, чтобы не засорять историю
        return;
    }

    // Проверка доступа для "Управляющего магазином" на страницу персонала
    if (role === 'Управляющий магазином' && isPersonnelPage) {
        alert('У вашей роли нет доступа к разделу Персонал!');
        window.location.replace('page2.html'); // Выкидываем на Заявки
        return;
    }

    // Если перешли на главную, но была выбрана роль (темпово) — показываем логин
    const tempRole = localStorage.getItem('tempRole');
    if (tempRole && isIndexPage) {
        console.log("Обнаружена временная роль, показываем логин:", tempRole);
        handleLogin(tempRole);
        // Важно: временную роль пока НЕ удаляем, чтобы она осталась видна в handleLogin
    } else if (tempRole && !isIndexPage) {
        // Если есть временная роль, но мы НЕ на главной - это ошибка, надо на главную
        console.warn("Временная роль обнаружена не на главной странице. Очистка.");
        localStorage.removeItem('tempRole');
    }


    // Загрузка данных для соответствующих страниц
    if (isPersonnelPage) loadStaff();
    if (isRequestsPage) {
        loadRequests();
        loadStaffList();
    }
});

// --- ФУНКЦИИ ЗАГРУЗКИ ДАННЫХ ---

// Загрузка персонала (с учетом фильтра)
async function loadStaff(filterStatus = '') {
    console.log("Загрузка персонала с фильтром:", filterStatus);
    try {
        const res = await fetch('http://localhost:3000/api/staff');
        let staff = await res.json();

        // Фильтрация, если указан статус
        if (filterStatus) {
            staff = staff.filter(s => s.status.toLowerCase() === filterStatus.toLowerCase());
        }

        const container = document.getElementById('staff-container');
        if (!container) return; // Если контейнер не найден, выходим

        container.innerHTML = staff.map(s => `
            <div class="card">
                <h3 style="margin:0;">${s.name}</h3>
                <p style="color:#666; margin-bottom:10px;">${s.spec}</p>
                <span class="status-badge status-${s.status.replace(' ', '-')}">${s.status}</span>
            </div>`).join('');
    } catch (error) {
        console.error("Ошибка загрузки персонала:", error);
    }
}

// Функция, вызываемая кнопкой фильтра
function toggleFilter() {
    const status = prompt("Введите статус для фильтра (Свободен, Занят, В отпуске) или оставьте пустым для сброса:");
    // Проверяем, что пользователь не нажал "Отмена"
    if (status !== null) {
        loadStaff(status);
    }
}

// Загрузка заявок
async function loadRequests() {
    console.log("Загрузка заявок...");
    try {
        const res = await fetch('http://localhost:3000/api/requests');
        const requests = await res.json();
        const container = document.getElementById('requests-container');
        if (!container) return;

        container.innerHTML = requests.map(r => `
            <div class="card">
                <h3>${r.title}</h3>
                <p>Ответственный: <b>${r.staff_name || 'Не назначен'}</b></p>
            </div>`).join('');
    } catch (error) {
        console.error("Ошибка загрузки заявок:", error);
    }
}

// Заполнение выпадающего списка сотрудников в форме заявки
async function loadStaffList() {
    console.log("Загрузка списка сотрудников для выпадающего меню...");
    try {
        const res = await fetch('http://localhost:3000/api/staff');
        const staff = await res.json();
        const selectElement = document.getElementById('req-staff');

        if (selectElement) {
            // Очищаем старые опции, кроме первой (по умолчанию "Выберите гида")
            selectElement.innerHTML = '<option value="">-- Выберите гида --</option>';
            staff.forEach(s => {
                const option = document.createElement('option');
                option.value = s.id;
                option.innerText = s.name;
                selectElement.appendChild(option);
            });
        }
    } catch (error) {
        console.error("Ошибка загрузки списка сотрудников:", error);
    }
}

// Создание новой заявки
async function submitRequest() {
    const title = document.getElementById('req-title').value.trim();
    const address = document.getElementById('req-address').value.trim();
    const staff_id = document.getElementById('req-staff').value;

    if (!title) {
        alert("Пожалуйста, введите название тура!");
        return;
    }
    // Можно добавить проверку на адрес и staff_id, если нужно

    console.log("Отправка заявки:", { title, address, staff_id });

    try {
        await fetch('http://localhost:3000/api/requests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, address, staff_id })
        });
        alert("Заявка успешно создана!");
        location.reload(); // Перезагружаем страницу, чтобы увидеть новую заявку
    } catch (error) {
        console.error("Ошибка при создании заявки:", error);
        alert("Не удалось создать заявку. Проверьте сервер.");
    }
}
