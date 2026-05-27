const baseUrl = 'http://127.0.0.1:8000/api/'

function getAccessToken() {
    return localStorage.getItem('access_token')
}

function getRefreshToken() {
    return localStorage.getItem('refresh_token')
}

function saveToken(access, refresh) {
    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
}

function clearTokens() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('current_user')
}

function isAuthenticated() {
    return !!getAccessToken();
}

function getCurrentUser() {
    const user = localStorage.getItem('current_user')
    return user ? JSON.parse(user) : null
}

function updateNavbar() {
    if (isAuthenticated()) {
        $('#login-btn').addClass('d-none')
        $('#register-btn').addClass('d-none')
        $('#logout-btn').removeClass('d-none')
        $('#create-recipes-btn').removeClass('d-none')

        const user = getCurrentUser()
        if (user) {
            $(`#current-username`).text(user.username)
        }
    }
    else {
        $('#login-btn').removeClass('d-none')
        $('#register-btn').removeClass('d-none')
        $('#logout-btn').addClass('d-none')
        $('#create-recipes-btn').addClass('d-none')
    }
}

async function authRequest(options) {
    const token = getAccessToken()

    if (token) {
        options.headers = options.headers || {};
        options.headers['Authorization'] = 'Bearer ' + token;
    }

    try {
        return await $.ajax(options);
    } catch (error) {
        if (error.status === 401) {
            console.log('Access истек пытаюсь сделать refresh');

            const refreshed = await tryRefreshToken();

            if (refreshed) {
                options.headers['Authorization'] = 'Bearer ' + getAccessToken();
                return await $.ajax(options);
            } else {
                console.log('Refresh не удался, очищаем localStorage');
                clearTokens();
                updateNavbar();
                alert('Сессия истекла, войдите снова');
                throw error
            }
        }
        throw error
    }
}

async  function tryRefreshToken() {
    const refresh = getRefreshToken()
    if (!refresh) return false

    try {
        const data = await $.ajax({
            url: 'http://127.0.0.1:8000/accounts/refresh/',
            method: 'POST',
            data: JSON.stringify({refresh: refresh}),
            contentType: 'application/json'
        })

        localStorage.setItem('access_token', data.access)
        console.log('token successfully update')
        return true
    } catch (err) {
        console.log('Не удалось обновить токен', err)
        return false
    }
}

$(document).ready(async function() {
    window.container = $('#container');
    updateNavbar()
    await recipesList(baseUrl);

    async function recipesList() {
        container.empty();

        await $.ajax({
        url: baseUrl + 'recipes/',
        method: 'GET',
        success: function (data, status) {
            console.log(data);
            console.log(status)

        if (!data.length) {
            container.append(
                `<h3>Not Recipes</h3>`
            );
        } else {
            container.append(
                `<div id='recipes-block' class="d-flex justify-content-evenly row row-cols-1 row-cols-md-4 g-4"></div>`
            );

            const currentUser = getCurrentUser()

            data.forEach(recipes => {
                const isOwner = currentUser && recipes.author.username === currentUser.username

                const editButtons = isOwner ? `
                    <button class="btn btn-danger delete-recipes" data-id="${recipes.id}">Delete</button>
                    <button class="btn btn-success update-reciep" data-id="${recipes.id}">Update</button>
                `: ''

                $('#recipes-block').append(`
                    <div class="col">
                        <a href="#" class="text-decoration-none h-100 d-block w-100 view-recipes" id="view-recipes" 
                        data-id="${recipes.id}">
                        <div class="card h-100">
                            <img src="${recipes.image}" class="card-img-top" style="height: 250px; object-fit: cover;"
                             alt="photo-cooking">
                            <div class="card-body">
                                <h5 class="card-title">${recipes.name}</h5>
                                <h6 class="card-subtitle mb-2 text-muted">${recipes.author}</h6>
                                <p class="card-text">${recipes.cooking_time} min</p>
                                <h6 class="card-subtitle mb-2 text-muted">
                                    ${new Date(recipes.created_at).toDateString('ru-Ru')}
                                </h6>
                            </div>
                        </div>
                        </a>
                    </div>
                    `
                );
            });
        }
        },
        error: function (exc) {
            console.log('Error', exc.status)
        }
        });
    }

    async function recipesGet(recipesId) {
        let response = null

        await $.ajax({
            url: baseUrl + `recipes/${recipesId}`,
            method: 'GET',
            success: function (data, status) {
                console.log(data)
                response = data
            },
            error: function (exc) {
                console.log('Error loading', exc.status)
            }
        });

        return response
    }

    async function recipesDetail(recipes) {
        console.log(recipes)
        container.empty()

        const currentUser = getCurrentUser()
        const isOwner = currentUser && recipes.author === currentUser.username

        let comments = [];

        try {
            comments = await $.ajax({
                url: baseUrl + `recipes/${recipes.id}/comments/`,
                method: 'GET',
            });
        } catch (err) {
            console.log('Comments error', err)

        }

        const commentsForm = isAuthenticated() ? `
            <form id="create-comments" data-id="${recipes.id}">
                <div class="mb-3">
                    <label for="NameInput" class="form-label">Comment</label>
                    <input type="text" name="text" class="form-control" id="nameInput" required>
                </div>
                
                <button type="submit" class="btn btn-primary">Send</button>
           </form>
        ` : ''

        const editButtons = isOwner ? `
                <button class="btn btn-danger delete-recipes " data-id="${recipes.id}">Delete</button>
                <button class="btn btn-success update-recipes " data-id="${recipes.id}">Update</button>
            `: ''

        container.append(`
            <img src="${recipes.image}" class="rounded mx-auto d-block w-100"
             style="
                max-width:700px;
                height:400px;
                object-fit:cover;
             "
             alt="photo">
            <h2>${recipes.name}</h2>
            <h6>Author: ${recipes.author}</h6>
            <hr>
            
            <p><b>Ingredients:</b> ${recipes.ingredients}</p>
            <hr>
            
            <h6>Cooking time: ${recipes.cooking_time}</h6>
            <h6>Created at ${new Date(recipes.created_at).toLocaleString('ru-Ru')}</h6>
            
            <hr>
            
            <p>${recipes.description}</p>
            
            <hr>
            <h4>Comments</h4>
            <div id="comments-block"></div>
            
            ${commentsForm}
            
            <hr>
            ${editButtons}
        `);

        if (!comments.length) {
            $('#comments-block').append(`<p>No comments</p>`);
        } else {
            comments.forEach(comment => {
            $('#comments-block').append(`
                <div class="border rounded p-2 mb-2">
                    <h6>Authro: ${comment.author}</h6>
                    <p>${comment.text}</p>
                </div>
            `);
        });
        }
    }

    container.on('submit', '#create-comments', async function(event) {
        event.preventDefault()

        const commentId = $(this).data('id')
        const recipeId = $(this).data('id')
        const formData = serialize($(this).serializeArray())

        try {
            await authRequest({
                url: baseUrl + `recipes/${recipeId}/comments/`,
                method: 'POST',
                data: formData
            })

            const recipe = await recipesGet(recipeId)
            await recipesDetail(recipe)
        } catch (err) {

        }
    })

    container.on('click', '.view-recipes', async function (event) {
        event.preventDefault()

        const recipesId = event.currentTarget.dataset['id']
        const recipes = await recipesGet(recipesId)

        if (!recipes) {
            console.log('recipes not found!')
            return null
        }

        await recipesDetail(recipes)
    })

        function serialize (data) {
        let result = {}

        data.forEach(object => result[object['name']] = object['value'])
        return result
    }

    $("#login-btn").click(function (event) {
        event.preventDefault()
        container.empty()

        container.append(`
            <div class="row justify-content-center">
                <div class="col-md-4">
                    <h2>Войти</h2>
                    <form id="login-form">
                        <div class="mb-3">
                            <label class="form-label">Логин</label>
                            <input type="text" name="username" class="form-control" required>
                        </div>
        
                        <div class="mb-3">
                            <label class="form-label">Пароль</label>
                            <input type="password" name="password" class="form-control" required>
                        </div>
        
                        <button type="submit" class="btn btn-primary">Войти</button>
                        <button type="button" class="btn btn-secondary mx-2" id="cancel-auth">Отмена</button>
                    </form>
                </div>
            </div>
        `);
    });

    $('#create-recipes-btn').click(function (event) {
        event.preventDefault()

        if (!isAuthenticated()) {
            alert('Log in to create a recipe.')
            return
        }

        container.empty()

        container.append(`
        <h1>Create new recipes</h1>
        
        <form id="create-form">
            <div class="mb-3">
                <label for="NameInput" class="form-label">Title</label>
                <input type="text" name="name" class="form-control" id="nameInput" required minlength="5">
            </div>
            
            <div class="mb-3">
                <label for="DescriptionInput" class="form-label">Description</label>
                <textarea name="description" id="DescriptionInput" class="form-control" required rows="10"></textarea>
            </div>
            
            <div class="mb-3">
                <label for="IngredientsInput" class="form-label">Ingredients</label>
                <input type="text" name="ingredients" class="form-control" id="ingredientsInput" required>
            </div>
            
            <div class="mb-3">
                <label for="cookingTimeInput" class="form-label">Cooking time</label>
                <input type="number" name="cooking_time" class="form-control" id="cookingTimeInput" required>
            </div>
            
            <div class="mb-3">
              <label for="imageFile" class="form-label">Default file input example</label>
              <input class="form-control" type="file" id="imageFile" name="image">
            </div>
            
            <button type="submit" class="btn btn-primary">Create recipes</button>
            <button type="button" class="btn btn-secondary">Cancel</button>
        </form>
        `);
    });

    container.on('submit', '#create-form', async function (event) {
        event.preventDefault();

        const formData = new FormData(this);

        formData.append('file', $('#imageFile')[0].files[0])

        console.log(formData);

        try {
            await authRequest({
                url: baseUrl + 'recipes/',
                method: 'POST',
                data: formData,
                processData: false,
                contentType: false,
            });
            console.log('Recipes create');
            container.empty();
            await recipesList();
        } catch (err) {
            console.log(err.responseJSON);
            alert(JSON.stringify(err.responseJSON));
        }
    });

    container.on('submit', '#login-form', async function (event) {
        event.preventDefault();

        const formData = serialize($(this).serializeArray());

        try {
            const data = await $.ajax({
                url: 'http://127.0.0.1:8000/accounts/login/',
                method: 'POST',
                data: JSON.stringify(formData),
                contentType: 'application/json'
            });

            saveToken(data.access, data.refresh);

            const payload = JSON.parse(atob(data.access.split('.')[1]));

            localStorage.setItem('current_user', JSON.stringify({
                id: payload.user_id,
                username: payload.username || formData.username
            }));

            console.log('Authorization successfully');
            updateNavbar();
            await recipesList();

        } catch (err) {
            if (err.status === 401) {
                alert('Invalid username or password');
            } else {
                console.log('Error login', err);
            }
        }
    });

    $('#register-btn').click(function (event) {
        event.preventDefault();
        container.empty();

        container.append(`
            <div class="row justify-content-center">
                <div class="col-md-4">
                    <h2>Регистрация</h2>
        
                    <form id="register-form">

                        <div class="mb-3">
                            <label class="form-label">Логин</label>
                            <input type="text" name="username" class="form-control" required>
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label">Пароль</label>
                            <input type="password" name="password" class="form-control" required>
                        </div>
        
                        <button type="submit" class="btn btn-success">Зарегистрироваться</button>
                        <button type="button" class="btn btn-secondary mx-2" id="cancel-auth">Отмена</button>
                    </form>
                </div>
            </div>
        `);
    });

    container.on('click', '.update-recipes', async function (event) {
        event.preventDefault()

        if (!isAuthenticated()) {
            alert('Log in to update a recipe.')
            return
        }

        const recipeID = event.currentTarget.dataset['id']
        const recipe = await recipesGet(recipeID)

        if (!recipe) return

        container.empty()

        container.append(`
        <h1>Edit recipes</h1>
        
        <form id="update-form" data-id="${recipe.id}">
            <div class="mb-3">
                <label for="NameInput" class="form-label">Title</label>
                <input type="text" name="name" class="form-control" id="nameInput" required minlength="5" 
                value="${recipe.name}">
            </div>
            
            <div class="mb-3">
                <label for="DescriptionInput" class="form-label">Description</label>
                <textarea name="description" id="DescriptionInput" class="form-control" required rows="10"
                >${recipe.description}</textarea>
            </div>
            
            <div class="mb-3">
                <label for="IngredientsInput" class="form-label">Ingredients</label>
                <input type="text" name="ingredients" class="form-control" id="ingredientsInput" required 
                value="${recipe.ingredients}">
            </div>
            
            <div class="mb-3">
                <label for="cookingTimeInput" class="form-label">Cooking time</label>
                <input type="number" name="cooking_time" class="form-control" id="cookingTimeInput" required
                value="${recipe.cooking_time}">
            </div>
            
            <div class="mb-3">
              <label for="imageFile" class="form-label">Default file input example</label>
              <input class="form-control" type="file" id="imageFile" name="image" value="${recipe.image}">
            </div>
            
            <button type="submit" class="btn btn-primary">Save</button>
            <button type="button" class="btn btn-secondary">Cancel</button>
        </form>
        `);
    });

    container.on('submit', '#update-form', async function (event) {
        event.preventDefault()

        const recipesID = $(this).data('id')
        const formData = new FormData(this);
        const imageInput = $('#imageFile')[0]

        if (imageInput.files.length === 0) {
            formData.delete('image')
        }

        try {
            await authRequest({
                url: baseUrl + `recipes/${recipesID}/`,
                method: 'PATCH',
                data: formData,
                processData: false,
                contentType: false,
            })

            console.log('Recipe update')
            const recipe = await recipesGet(recipesID)
            await recipesDetail(recipe)

        } catch (err) {
            console.log(err.responseJSON)
            console.log('Error recipes update', err)
        }
    });

    container.on('click', '.delete-recipes', async function (event) {
        const recipesId = event.currentTarget.dataset['id'];
        console.log(recipesId)

        if (!confirm('Are you sure you want to delete?')) return;

        try {
            await authRequest({
                url: baseUrl + `recipes/${recipesId}/`,
                method: 'DELETE',
            })
            console.log('Deleted article')
            await recipesList()
        } catch (err) {
            if (err.status === 404) {
                alert('Recipes not found')
            } else {
                console.log('Error create recipes', err)
            }
        }
    });

    container.on('submit', '#register-form', async function(event) {
        event.preventDefault()

        const formData = serialize($(this).serializeArray())

        try {
            await $.ajax ({
                url: 'http://127.0.0.1:8000/accounts/register/',
                method: 'POST',
                data: JSON.stringify(formData),
                contentType: 'application/json'
            })

            alert('Регистрация успешна! Теперь войдите в аккаунт!')
            $("#login-btn").click()
        } catch (err) {
            if (err.status === 400) {
                alert('Error ' + JSON.stringify(err.responseJSON))
            } else {
                console.log('Error register', err)
            }
        }
    });

    $('#logout-btn').click(function (event) {
        event.preventDefault();
        clearTokens();
        updateNavbar();
        recipesList();
    });
});