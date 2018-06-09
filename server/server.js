require('./config/config.js');
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const { ObjectID } = require('mongodb');

const { mongoose } = require('./db/mongoose.js');
const { Todo } = require('./models/todo.js');
const { User } = require('./models/user.js');
const { authenticate } = require('./middleware/authenticate.js');

const app = express();
const env = process.env.NODE_ENV || 'development';
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
  console.log('Creating new Todo...');
  const todo = new Todo({
    text: req.body.text
  });
  todo.save().then((doc) => {
    console.log('Success!');
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

app.delete('/todos/:id', (req, res) => {
  const { id } = req.params;
  console.log(' Deleting todo with ID: ', id);
  if (!ObjectID.isValid(id)) {
    return res.status(404).send('Not a valid ID');
  }
  Todo.findByIdAndRemove(id).then((todo) => {
    if (!todo) {
      return res.status(404).send('Todo not found');
    }
    return res.status(200).send({ todo });
  }).catch((err) => console.log(err));
});

app.patch('/todos/:id', (req, res) => {
  const { id } = req.params;
  const body = _.pick(req.body, ['text', 'completed']); // creates array of values from body
  console.log('Updatind todo with ID: ', id);
  if (!ObjectID.isValid(id)) {
    return res.status(404).send('Not a valid ID');
  }
  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null; // null removes item from DB
  }
  Todo.findByIdAndUpdate(id, {
    $set: body
  }, {
    new: true
  })
  .then((todo) => {
    if (!todo) {
      return res.status(404).send('Todo not found');
    }
    return res.status(200).send({ todo });
  }).catch((err) => {
    res.status(400).send(err);
  })
});

// User Requests
app.post('/users', (req, res) => {
  console.log('Creating new user...');
  const body = _.pick(req.body, ['email', 'password']);
  const user = new User(body);
  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token).send(user)
  }).catch((err) => {
    res.status(400).send(err);
  });
});


app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

app.post('/users/login', (req, res) => {
  console.log('Logging in...');
  const body = _.pick(req.body, ['email', 'password']);
  User.findByCredentials(body.email, body.password).then((user) => {
    return user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send(user);
    });
  }).catch(err => {
    res.status(400).send(err);
  });
});

app.delete('/users/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  }, () => {
    res.status(400).send();
  });
})

app.listen(port, () => {
  console.log(`App listening on port ${port} in ${env} mode`);
});

module.exports = { app };
