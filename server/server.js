const express = require('express');
const cors = require('cors')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const User = require('./models/User');
const Challenge = require('./models/Challenge');
const { v4: uuidv4 } = require('uuid');
const app = express();
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
let search = null;
mongoose.connect('mongodb+srv://student:1234@clusterz.fdnrc.mongodb.net/Challenge-api?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
const db = mongoose.connection
db.on('error', (err) => {
    console.log(err);
})
db.once('open', () => {
    console.log('Connection to db established');
});


app.post('/user/registration', (req, res) => {
    console.log('111111111111111')
    const salt = bcrypt.genSaltSync(10)    
    const hash = bcrypt.hashSync(String(req.body.password), salt)
    let newUser = { ...req.body, password: hash, salt }
    console.log(newUser)
    User.find({
        login: newUser.login
    }).then((data) => {
            console.log(data)
        if (data.length === 0) {
            const user = new User(newUser)
            user.save()
                .then((data) => { res.status(200).json(data) })
                .catch((err) => { res.status(500).send(err) })
        } else {
            console.log('22222222222')
            res.status(407).send('аккаунт уже существует')
        }
    })
})

app.post('/user/login', (req, res) => {
    console.log('333333')
    User.find({ login: req.body.login })
        .then((data) => {
            console.log(data)
            if (!data[0]) {
                return res.status(500).send('Пользователя не существует')
            }
            if (data[0].token) {
                console.log('55555')
                return res.status(500).send('Вы уже залогинились')
            }

            let findUserPassword = bcrypt.hashSync(String(req.body.password), data[0].salt)
            if (data[0].password === findUserPassword) {
                let token = uuidv4()                
                User.updateOne({ password: findUserPassword }, { token: token })
                    .then(() => {
                        console.log(token, '444444')
                        res.status(200).json(token)})
                    .catch(err => res.status(500).send(err))
            }
        })
})

app.get('/user/unlogin', (req, res) => {
    console.log('66666')
    let token = req.query.token
    console.log(token)
    User.findOneAndUpdate({ token: token }, { token: '' })
        .then(data => res.status(200).json(data))
        .catch(err => res.status(500).send())


})

app.post('/createChalleng', (req, res) => {
    console.log('7777777')
    let token = req.query.token
    User.findOne({ token: token })
        .then(data => {
            console.log(data)
            if (!data) {
                return res.status(500).send('Вы не вошли в систему')
            }
            let newChalenge = { ...req.body, from: data._id }
            let challenge = new Challenge(newChalenge)
            challenge.save()
                .then(data => res.status(200).json(data))
                .catch(err => res.status(500).send(err))

        })
})



app.get('/users/getUsers', (req, res) => {
    let token = req.query.token
    User.findOne({ token: token })
        .then(data => {
            if (!data) {
                return res.status(500).send('Вы не вошли в систему')
            }
            User.find({ name: req.query.name }, { name: 1, _id: 1 })
                .then(users => res.status(200).json(users))
                .catch(err => res.status(500).send())
        })
})



app.get('/MyChallenge', (req, res) => {
    let token = req.query.token
    console.log(req.query)
    User.findOne({ token: token })
        .then(data => {
            if (!data) {
                return res.status(500).send('Вы не вошли в систему')
            }
            Challenge.find({ from: data._id })
                .then(challenge => res.status(200).json(challenge))
                .catch(err => res.status(500).send())
        })
})

app.post('/UpdateChallenge', (req, res) => {
    let token = req.query.token
    console.log(req.query.id, '11111')
    User.findOne({ token: token })
        .then(data => {
            if (!data) {
                return res.status(500).send('Вы не вошли в систему')
            }
            Challenge.updateOne({ _id: req.query.id }, { ...req.body })
                .then(challenge => res.status(200).json(challenge))
                .catch(err => res.status(500).send())
        })
})

app.delete('/deleteChallenge', (req, res) => {
    let token = req.query.token
    User.findOne({ token: token })
        .then(data => {
            if (!data) {
                return res.status(500).send('Вы не вошли в систему')
            }
            Challenge.deleteOne({ _id: req.query.id })
                .then(challenge => res.status(200).json(challenge))
                .catch(err => res.status(500).send())
        })
})

app.get('/getChallenge', (req, res) => {
    let token = req.query.token
    console.log(req.query.id)
    User.findOne({ token: token })
        .then(data => {
            if (!data) {
                return res.status(500).send('Вы не вошли в систему')
            }
            Challenge.findOne({ _id: req.query.id })
                .then(challenge => res.status(200).json(challenge))
                .catch(err => res.status(500).send())
        })
})


app.listen(3000, () => { console.log('Example app listening on port 3000!') });
