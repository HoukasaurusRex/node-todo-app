const { ObjectID } = require('mongodb');
const jwt = require('jsonwebtoken');

const { Todo } = require('./../../models/todo');
const { User } = require('./../../models/user');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const users = [{
  _id: userOneId,
  email: 'jth@example.com',
  password: 'userOnePassword',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userOneId, access: 'auth'}, 'secretsauce').toString()
  }]
}, {
  _id: userTwoId,
  email: 'nicole@example.com',
  password: 'userTwoPassword'
}];
const todos = [{
  _id: new ObjectID(),
  text: 'Hello, Mocha!'
}, {
  _id: new ObjectID(),
  text: 'Superrrrtest',
  completed: true,
  completedAt: 123
}];

const populateTodos = (done) => {
  Todo.remove({ }).then(() => {
    return Todo.insertMany(todos);
  }).then(() => done());
};
const populateUsers = (done) => {
  User.remove({ }).then(() => {
    const userOne = new User(users[0]).save();
    const userTwo = new User(users[1]).save();

    return Promise.all([userOne, userTwo]);
  }).then(() => done());
}

module.exports = {
  todos,
  populateTodos,
  users,
  populateUsers
};
