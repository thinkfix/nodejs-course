const express = require('express');
const uuid4 = require('uuid4');
const Joi = require('joi');
const { ref } = require('joi');

const app = express();
const port = Number(process.env.PORT) || 3000 ;

let usersArr = [{
    id: '123',
    login: 'admin123',
    password: 'admin123',
    age: 33,
    isDeleted: false
},
{
    id: '234',
    login: 'admin345',
    password: 'admin123',
    age: 22,
    isDeleted: false
},
{
    id: '345',
    login: 'admin123',
    password: 'admin123',
    age: 33,
    isDeleted: false
},
{
    id: '456',
    login: 'user345',
    password: 'admin123',
    age: 22,
    isDeleted: false
}];

const userSchema = Joi.object().keys({
    id: Joi.string().required(),
    login: Joi.string().invalid(...usersArr.map(user => user.login)).required(), //not working as should
    password: Joi.string().regex(/(?!^[0-9]*$)(?!^[a-zA-Z]*$)^([a-zA-Z0-9]{8,20})/m).required(),
    age: Joi.number().min(4).max(130).required(),
    isDeleted: Joi.boolean().required()
});


// helpers
const getAutoSuggestUsers = (loginSubstring, limit) => {
    return usersArr.reduce((prev, cur) => {
        if (prev.length < limit) {
            prev.push(cur.login);
        }
        return prev;
    }, []);
};

const getAllUsers = () => {
    if (usersArr.length > 0 ){
        return usersArr.filter((user) => user.isDeleted === false);
    }
    return [];
};

// Request handlers

// get nothing 
// return array of users
const getUsersHandler = (req, res, next) => {
    res.json(getAllUsers());
    res.end();
}

// get ID 
// return user object
const getUserByIdHandler = (req, res, next) => {
    const result = usersArr.find(user => {
        return user.id === req.params.id
    })
    res.json(result);
    res.end();
};

// get login substring
// return array of login names
const suggestUsersOnLoginHandler = (req, res, next) => {
    const limit = 3;
    res.json(getAutoSuggestUsers(req.params.name, limit));
    res.end();
};

// get user object
// return array of users
const editUserHandler = (req, res, next) => {
    let isExist = false;
    const {id, login, password, age, isDeleted} = req.body;

    const userData = {
        id: id || uuid4(),
        login, 
        password, 
        age: +age, 
        isDeleted: !((isDeleted === '0') || (isDeleted === 'false') || !isDeleted)
    };

    const { error, value } = userSchema.validate(userData); 
    const valid = error == null; 
    if (!valid) { 
      res.status(400).json({ 
        message: 'Invalid request', 
        data: userData 
      }) 
    } else { 
        if(req.body.id) {
            usersArr = [...usersArr].map(user => {
                if (user.id === id) {
                    isExist = true;
                    return userData;
                } else {
                    return user;
                }
            })
        }
    
        if(!isExist) {
            usersArr.push(userData);
        }
    
        res.json(getAllUsers());
        res.end();
    } 
};

// get ID
// return array of users
const deleteUserHandler = (req, res, next) => {
    usersArr = [...usersArr.map(user => {
        if( user.id === req.params.id) {
            user.isDeleted = true;

        }
        return user;
        
    })]
    res.json(getAllUsers);
    res.end();
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/users/', getUsersHandler);

app.get('/users/:id', getUserByIdHandler);

app.get('/users/login/:name', suggestUsersOnLoginHandler);

app.post('/users/edit/', editUserHandler);

app.delete('/users/:id', deleteUserHandler);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

