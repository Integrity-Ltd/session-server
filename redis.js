import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import cors from "cors";
import cookieParser from 'cookie-parser';
import { createClient } from "redis"
import RedisStore from "connect-redis"

dotenv.config()
const PORT = 8080;

let redisClient = createClient()
redisClient.connect().catch(console.error)

// Initialize store.
let store = new RedisStore({
    client: redisClient,
    prefix: "myapp:",
})

const app = express();
app.use(cookieParser());

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, x-auth-token');

    if ('OPTIONS' === req.method) {
        res.send(200);
    }
    else {
        next();
    }
});

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
    res.send({ message: 'welcome to a simple HTTP cookie server' });
});

app.get('/api/users/me', (req, res) => {
    console.log(req.session);
    res.send({ name: 'Test Elek' });
});

app.listen(PORT, () => console.log(`The server is running port ${PORT}...`));
