import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import cors from "cors";
import cookieParser from 'cookie-parser';
import { default as connectMongoDBSession } from 'connect-mongodb-session';

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

const app = express();
app.use(cookieParser());

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

const corsOptions = {
    optionsSuccessStatus: 200,
    credentials: true,
    origin: true,
}
app.use(cors(corsOptions))

app.post('/api/auth', (req, res) => {
    console.log(req.session);
    req.session.user = { 'name': 'Teszt Elek' };
    req.session.save();
    res.send({ message: 'welcome to a simple HTTP cookie server' });
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

app.listen(PORT, () => console.log(`The server is running port ${PORT}...`));
