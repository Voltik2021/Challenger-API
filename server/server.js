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
    const salt = bcrypt.genSaltSync(10)    
    const hash = bcrypt.hashSync(String(req.body.password), salt)
    let newUser = { ...req.body, password: hash, salt }
  
    User.find({
        login: newUser.login
    }).then((data) => {
        
        if (data.length === 0) {
            const user = new User(newUser)
            user.save()
                .then((data) => { res.status(200).json(data) })
                .catch((err) => { res.status(500).json(err) })
        } else {
           
            res.status(403).json({err:'аккаунт уже существует'})
        }
    })
})

app.post('/user/login', (req, res) => {
 
    User.find({ login: req.body.login })
        .then((data) => {           
            if (!data[0]) {
            return res.status(500).json({err:'Пользователя не существует'})
            }
            if (data[0].token) {                
                return res.status(500).json({err:'Вы уже залогинились'})
            }

            let findUserPassword = bcrypt.hashSync(String(req.body.password), data[0].salt)
            if (data[0].password === findUserPassword) {
                let token = uuidv4()                
                User.updateOne({ password: findUserPassword }, { token: token })
                    .then(() => {                      
                        res.status(200).json(token)})
                    .catch(err => res.status(500).send(err))
            } else {
                return res.status(500).json({err:'Неверный пароль'})
            }
        })
})

app.get('/user/unlogin', (req, res) => {
  
    let token = req.query.token

    User.findOneAndUpdate({ token: token }, { token: '' })
        .then(data => res.status(200).json(data))
        .catch(err => res.status(500).send())


})

app.get('/searchUser', (req, res) => {
    let token = req.query.token
 
    User.findOne({ token: token })
        .then(data => {
            if (!data) {
                return res.status(500).json({err:'Вы не вошли в систему'})
            }
            User.find({ name: req.query.name }, { name: 1, _id: 1 })
                .then(users => res.status(200).json(users))
                .catch(err => res.status(500).send())
        })
})

app.post('/createChalleng', (req, res) => {

    let token = req.query.token
    User.findOne({ token: token })
        .then(data => {
         
            if (!data) {
                return res.status(500).json({err:'Вы не вошли в систему'})
            }
            let newChalenge = { ...req.body, from: data._id, status:req.body.to?'suggested':''}
            let challenge = new Challenge(newChalenge)
            challenge.save()
                .then(data => res.status(200).json(data))
                .catch(err => res.status(500).send())

        })
})

app.get('/MyChallenge', (req, res) => {
    let token = req.query.token

    User.findOne({ token: token })
        .then(data => {
            if (!data) {
                return res.status(500).send({err:'Вы не вошли в систему'})
            }
            Challenge.find({ from: data._id })
                .then(challenge => res.status(200).json(challenge))
                .catch(err => res.status(500).send())
        })
})

app.get('/getOfferChallenge', (req, res) => {
    let token = req.query.token     
    User.findOne({ token: token })
        .then(data => {            
            if (!data) {
                return res.status(500).send({err:'Вы не вошли в систему'})
            }            
            Challenge.find({ to: data._id, status:'suggested' })
                .then(challenge => res.status(200).json(challenge))
                .catch(err => res.status(500).send())
        })
})


app.post('/UpdateChallenge', (req, res) => {
    let token = req.query.token
    console.log(req.body, '11111')
    User.findOne({ token: token })
        .then(data => {
            if (!data) {
                return res.status(500).json({err:'Вы не вошли в систему'})
            }
            Challenge.updateOne({ _id: req.query.id }, { ...req.body, status:req.body.to?'suggested':'' })
                .then(challenge => res.status(200).json(challenge))
                .catch(err => res.status(500).send())
        })
})

app.delete('/deleteChallenge', (req, res) => {
    let token = req.query.token

    User.findOne({ token: token })
        .then(data => {
            if (!data) {
                return res.status(500).json({err:'Вы не вошли в систему'})
            }
            Challenge.deleteOne({ _id: req.query.id })
                .then(challenge => res.status(200).json(challenge))
                .catch(err => res.status(500).send())
        })
})

app.get('/getChallenge', (req, res) => {
    let token = req.query.token
  
    User.findOne({ token: token })
        .then(data => {
            if (!data) {
                return res.status(500).json({err:'Вы не вошли в систему'})
            }
            Challenge.findOne({ _id: req.query.id })
                .then(challenge => res.status(200).json(challenge))
                .catch(err => res.status(500).send())
        })
})

app.get('/refuseExecute', (req, res) => {
    let token = req.query.token

    User.findOne({ token: token })
        .then(data => {
            if (!data) {
                return res.status(500).json({err:'Вы не вошли в систему'})
            }
            Challenge.updateOne({ _id: req.query.id }, { to: '', status:'rejected'})
                .then(challenge => res.status(200).json(challenge))
                .catch(err => res.status(500).send())
        })
})

app.get('/acceptedForCompletion', (req, res) => {
    let token = req.query.token
    let date = req.query.date
    
   
    User.findOne({ token: token })
        .then(data => {
            if (!data) {
                return res.status(500).json({err:'Вы не вошли в систему'})
            }
            Challenge.updateOne({ _id: req.query.id }, {status:'accepted', dateOfAcceptance: date})
                .then(challenge => res.status(200).json(challenge))
                .catch(err => res.status(500).send())
        })
})

app.get('/getAcceptedChallenge', (req, res) => {
    let token = req.query.token     
    User.findOne({ token: token })
        .then(data => {
         
            if (!data) {
                return res.status(500).send({err:'Вы не вошли в систему'})
            }
            
            Challenge.find({ to: data._id, status:'accepted' })
                .then(challenge => res.status(200).json(challenge))
                .catch(err => res.status(500).send())
        })
})

app.get('/executedChallenge', (req, res) => {
    let token = req.query.token
    let date = req.query.date
    User.findOne({ token: token })
        .then(data => {
            if (!data) {
                return res.status(500).json({err:'Вы не вошли в систему'})
            }
            Challenge.updateOne({ _id: req.query.id }, {status:'executed', completionDate:date})
                .then(challenge => res.status(200).json(challenge))
                .catch(err => res.status(500).send())
        })
})

app.get('/getExecutedChallenge', (req, res) => {
    let token = req.query.token     
    User.findOne({ token: token })
        .then(data => {
        
            if (!data) {
                return res.status(500).send({err:'Вы не вошли в систему'})
            }
            
            Challenge.find({ to: data._id, status:'executed' })
                .then(challenge => res.status(200).json(challenge))
                .catch(err => res.status(500).send())
        })
})

app.get('/getUserCompletedMyTest', (req, res) => {
    let token = req.query.token     
    User.findOne({ token: token })
        .then(data => {
    
            if (!data) {
                return res.status(500).send({err:'Вы не вошли в систему'})
            }
            
            Challenge.find({ from: data._id, status:'executed' })
                .then(challenge => res.status(200).json(challenge))
                .catch(err => res.status(500).send())
        })
})


app.listen(3000, () => { console.log('Example app listening on port 3000!') });
