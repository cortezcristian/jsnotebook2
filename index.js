const opener = require('opener');
const express = require('express');
const bodyParser = require('body-parser')
const {VM, NodeVM} = require('vm2');
let vm = new VM();
/*
let vm = new NodeVM({
  require: {
    builtin: ['os'],
    external: true,
  }
});
*/

const host = '127.0.0.1';
const port = 3333;

const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(express.static(__dirname + '/public'));

app.post('/vm2', (req, res) => {
  const result = {
    stdout: null,
    stderr: null,
  };

  console.log(req.body);

  try {
    result.stdout = vm.run(req.body.script);
  } catch (e) {
    result.stderr = e.message || e;
  }

  res.json({ res: result });
});


app.listen(port, host, () => {
  console.log(`Nodebooks: Started on ${host}:${port}`);
  opener(`http://${host}:${port}`);
});

