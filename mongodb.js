import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import { default as connectMongoDBSession } from 'connect-mongodb-session';
import axios from 'axios';
import { default as User } from './user.js';
import { default as db } from "./db.js";
import bcrypt from 'bcrypt';

dotenv.config()
const PORT = 8080;

const MongoDBStore = connectMongoDBSession(session);

const store = new MongoDBStore({
    uri: 'mongodb://127.0.0.1:27017/session',
    collection: 'UserSessions'
});

store.on('error', function (error) {
    console.log(error);
});

db.connection();

const app = express();
app.use(cookieParser());

let jsonParser = bodyParser.json()
app.use(jsonParser);

const sessionConfig = {
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    store: store,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true
    }
}

app.use(session(sessionConfig));

//Login user
app.post('/api/auth', async (req, res) => {
    console.log(req.session);
    const { email, password } = req.body;
    let user = await User.User.find({ email: email }).select(['name', 'email', 'password']);
    let count = user.length;
    if (count == 1) {
        let foundUser = user[0];

        const validPassword = await bcrypt.compare(
            password,
            foundUser.password
        );

        if (!validPassword)
            return res.status(400).send("Invalid email or password");

        foundUser.password = undefined;
        req.session.user = foundUser;
        req.session.save();

        res.send({ message: 'welcome to a simple HTTP cookie server' });
    } else res.send({ message: 'User not found' });
});

app.get('/api/users/me', (req, res) => {
    console.log(req.session);
    res.send(req.session.user);
});

app.delete('/api/auth/logout', (req, res) => {
    console.log(req.session);
    req.session.destroy();
    res.send({ message: 'session deleted' });
});

app.post('/api/auth/verify-token', async (req, res) => {
    const { reCAPTCHA_TOKEN, Secret_Key } = req.body;
    try {
        let response = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${Secret_Key}&response=${reCAPTCHA_TOKEN}`);
        console.log(response.data);

        return res.status(200).json({
            success: true,
            message: "Token verified",
            verification_info: response.data
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Error verifying token"
        })
    }
});

//Register User
app.post('/api/users', async (req, res) => {
    User.validate(req.body);
    let user = new User.User(req.body)
    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    user.password = await bcrypt.hash(user.password, salt);
    user.save();
    res.send({ '_id': user._id });
});

app.listen(PORT, () => console.log(`The server is running port ${PORT}...`));
