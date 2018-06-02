const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

const { mongoose } = require('./db/mongoose.js');
const { Todo } = require('./models/todo.js');
const { User } = require('./models/user.js');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
  const todo = new Todo({
    text: req.body.text
  });

  todo.save().then((doc) => {
    res.status(200).send(doc);
  }, (err) => {
    res.status(400).send(err);
  });
});

app.get('/todos', (req, res) => {
  Todo.find().then((todos) => {
    res.status(200).send({ todos });
  }, (err) => {
    res.send(400).send(err);
  });
});

app.get('/todos/:id', (req, res) => {
  const { id } = req.params;
  console.log('Finding todo with ID: ', id);
  if (!ObjectID.isValid(id)) {
    return res.status(404).send('Not a valid ID');
  }
  Todo.findById(id).then((todo) => {
    if (!todo) {
      return res.status(404).send('Todo not found');
    }
    return res.status(200).send({ todo });
  }).catch((err) => console.log(err));

});

app.listen(3000, () => {
  console.log(`App listening on port ${port}`);
});

module.exports = { app };
