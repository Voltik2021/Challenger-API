const express = require('express');
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const User = require('./models/User');
const Challenge = require('./models/Challenge');
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

// app.get('/', (req, res) => { console.log('privet'); res.json()})

app.post('/user/registration', (req, res) => {
    const salt = bcrypt.genSaltSync(10)
    const hash = bcrypt.hashSync(String(req.body.password), salt)    
    let newUser = {...req.body, password:hash, salt}
    User.find({
        login: newUser.login,
        password: hash        
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
   

    // const user = new User(req.body)

    // user.save((err, result) => {
    //     if (err) {
    //         console.log(err)
    //     } else {
    //         console.log(result)
    //     }
    // })
})



app.listen(3000, () => {console.log('Example app listening on port 3000!')});
