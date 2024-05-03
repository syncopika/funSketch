/*
not using this anymore but webpack-dev-server instead.
but this is convenient as you can just do `node server.js`
and go to localhost:3000 to see index.html without a bunch of extra webpack stuff.
*/

const express = require('express');
const app = express();
const path = require('path');
const port = 3000;

app.use(express.static((path.join(__dirname , ""))));

app.listen(port, () => console.log("listening on port: " + port));