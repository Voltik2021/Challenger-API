const express = require('express');
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const User = require('./models/User');
const Challenge = require('./models/Challenge');
const { v4: uuidv4 } = require('uuid');
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
let search = null;
mongoose.connect('mongodb+srv://student:1234@clusterz.fdnrc.mongodb.net/Challenge-api?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection
db.on('error', (err) => {
    console.log(err);
})
db.once('open', () => {
    console.log('Connection to db established');
});


app.post('/user/registration', (req, res) => {
    const salt = bcrypt.genSaltSync(10)
    const hash = bcrypt.hashSync(String(req.body.password), salt)    
    let newUser = {...req.body, password:hash, salt}
    User.find({
        login: newUser.login   
    }).then((data) => {
        if (data.length === 0) {
            const user = new User(newUser)
            user.save()
            .then((data) => {res.status(200).json(data)})
            .catch((err) => {res.status(500).send(err)})            
        } else {
            res.status(407).send('Аккаунт уже существует')
        }      
    })    
})

app.post('/user/login', (req, res) => {
    User.find({login: req.body.login})
    .then((data) => {
        if (data[0].token){
            res.status(500).send('Вы уже залогинились')
        }
        if (!data[0]){
            res.status(500).send('Пользователя не существует')
        } 
        let findUserPassword = bcrypt.hashSync(String(req.body.password), data[0].salt)
        if (data[0].password === findUserPassword) {            
            let token = uuidv4()
            User.updateOne({password:findUserPassword}, {token:token})
            .then(data => res.status(200).json(token))
            .catch(err => res.status(500).send(err))
        }
    })
})

app.post('/challeng', (req, res) => {
    User.find({token:req.body.token})
    .then((data) => {
        if (data.length === 0){
            return res.status(500).send()
        } else {
            console.log(data.password)
            let newChalenge = {...req.body, from:data[0].password}
            console.log(newChalenge)
            let challenge = new Challenge(newChalenge)
            challenge.save()
            .then(data => res.status(200).json(data))
            .catch(err => res.status(500).send(err))            
        }
    })
})



app.listen(3000, () => {console.log('Example app listening on port 3000!')});
