# Recipe Book

Учебный pet-проект, выполненный для практики разработки REST API на Django и взаимодействия frontend с backend через AJAX.

Проект представляет собой приложение для публикации рецептов с авторизацией через JWT, загрузкой изображений и системой комментариев.

---

## Технологии

### Backend

- Python
- Django
- Django REST Framework
- Simple JWT
- SQLite
- Pillow

### Frontend

- HTML
- CSS
- JavaScript
- jQuery
- AJAX
- Bootstrap 5

---

## Возможности проекта

### Аутентификация

- Регистрация пользователей
- Авторизация через JWT
- Хранение access и refresh токенов в `localStorage`
- Автоматическое обновление access токена
- Выход из аккаунта

### Рецепты

- Просмотр списка рецептов
- Детальный просмотр рецепта
- Создание рецепта
- Редактирование рецепта
- Удаление рецепта
- Загрузка изображения
- Автоматическое назначение автора

### Комментарии

- Просмотр комментариев
- Добавление комментариев
- Автоматическое назначение автора комментария
- Сортировка по дате создания

### Права доступа

- Просматривать рецепты могут все пользователи
- Создавать рецепты могут только авторизованные пользователи
- Редактировать и удалять рецепт может только автор
- Просматривать комментарии могут все
- Добавлять комментарии могут только авторизованные пользователи

---

## Структура моделей

### Recipe

| Поле | Тип |
|--------|------|
| name | CharField |
| description | TextField |
| ingredients | TextField |
| cooking_time | PositiveIntegerField |
| image | ImageField |
| created_at | DateTimeField |
| author | ForeignKey |

### Comment

| Поле | Тип |
|--------|------|
| text | TextField |
| recipe | ForeignKey |
| author | ForeignKey |
| created_at | DateField |

---

## API endpoints

### Authentication

```http
POST /accounts/register/
POST /accounts/login/
POST /accounts/refresh/
```

### Recipes

```http
GET /api/recipes/
POST /api/recipes/
GET /api/recipes/{id}/
PATCH /api/recipes/{id}/
DELETE /api/recipes/{id}/
```

### Comments

```http
GET /api/recipes/{id}/comments/
POST /api/recipes/{id}/comments/
```

---

## JWT использование

Токен передается в заголовке:

```http
Authorization: Bearer <access_token>
```

Токены сохраняются в:

```javascript
localStorage
```

При истечении срока действия access-токена автоматически выполняется запрос на обновление через refresh-токен.

---

## Frontend

Frontend реализован как SPA-подобное приложение на jQuery/AJAX.

Реализованы:

- список рецептов
- просмотр рецепта
- создание рецепта
- редактирование рецепта
- удаление рецепта
- регистрация
- авторизация
- комментарии
- динамическое изменение navbar

---

## Запуск проекта

Установить зависимости:

```bash
pip install -r requirements.txt
```

Выполнить миграции:

```bash
python manage.py migrate
```

Запустить сервер:

```bash
python manage.py runserver
```

---

## Цель проекта

Проект создан в учебных целях для практики:

- Django Models
- DRF Serializers
- ViewSet
- Permissions
- JWT Authentication
- REST API
- AJAX
- CRUD операций
- работы с изображениями
- связи моделей

---

## Статус проекта

Завершенный учебный pet-проект.