Инструкция по запуску

1. PostgreSQL
    Создай базу данных: "tour_db".
    Выполнить SQL-скрипт чтобы создать таблицы и данные:

DROP TABLE IF EXISTS requests, users, staff, roles;

CREATE TABLE roles (id SERIAL PRIMARY KEY, name VARCHAR(50));
INSERT INTO roles (name) VALUES ('HR-менеджер'), ('Управляющий офисом'), ('Управляющий магазином');

CREATE TABLE staff (
    id SERIAL PRIMARY KEY, 
    name VARCHAR(100), 
    spec VARCHAR(100), 
    status VARCHAR(50) -- Свободен, Занят, В отпуске
);

INSERT INTO staff (name, spec, status) VALUES 
('Иван Иванов', 'Старший гид', 'Свободен'),
('Анна Сидорова', 'Менеджер по турам', 'Занят'),
('Олег Волков', 'Водитель (кат. D)', 'В отпуске'),
('Мария Резник', 'Переводчик', 'Свободен'),
('Дмитрий Кот', 'Организатор досуга', 'Занят');

CREATE TABLE users (id SERIAL PRIMARY KEY, username VARCHAR(50), password VARCHAR(50), role_id INT REFERENCES roles(id));
INSERT INTO users (username, password, role_id) VALUES ('hr', '111', 1), ('office', '222', 2), ('shop', '333', 3);

CREATE TABLE requests (id SERIAL PRIMARY KEY, title VARCHAR(100), address VARCHAR(100), staff_id INT REFERENCES staff(id));


  Важно: В файле "server.js" в строке подключения к БД укажите свой пароль от PostgreSQL.

3. Node.js
   
    Открой терминал в корне проекта и выполнить команды:
    
    npm install express pg cors
    node server.js


    НЕ открывай файлы через file:///.

 4. Тестовые данные
    HR: Логин: hr, Пароль: 111
    Офис: Логин: office, Пароль: 222
    Магазин: Логин: shop, Пароль: 333
