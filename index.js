const fs = require('fs');
const opener = require('opener');
const express = require('express');

const host = '127.0.0.1';
const port = 3333;

const app = express();

app.use(express.static(__dirname + '/public'));


app.listen(port, host, () => {
  console.log(`Nodebooks: Started on ${host}:${port}`);
  opener(`http://${host}:${port}`);
});

