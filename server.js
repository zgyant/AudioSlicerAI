const express = require('express');
const path = require('path');
const bodyParser = require('body-parser')
const dotenv = require('dotenv');
dotenv.config({path: './.env'});
const cors = require("cors");
const Chat = require('./src/controllers/assistant');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));


app.use(cors())

app.use(express.static(path.join(__dirname, 'build')));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.post('/chat', Chat);

app.listen(process.env.PORT || 8000);