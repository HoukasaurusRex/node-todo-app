const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');
const { User } = require('./../models/user');
const { todos, populateTodos, users, populateUsers } = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
  it('should create a new todo from a user', (done) => {
    const text = 'hello, api';
    request(app)
      .post('/todos')
      .send({ text })
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Todo.find({ text }).then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch(e => done(e));
      });
  });
  it('should not create a todo with invalid body data', (done) => {
    request(app)
      .post('/todos')
      .send({ })
      .set('x-auth', users[0].tokens[0].token)
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Todo.find().then((todos) => {
          expect(todos.length).toBe(2);
          done();
        }).catch(e => done(e));
      });
  });
});
describe('GET /todos', () => {
  it('should get all todos of a user', (done) => {
    request(app)
      .get('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(1);
      })
      .end(done);
  });
});
describe('GET /todos/:id', () => {
  it('should return todo doc', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });
  it('should not return todo doc created by another user', (done) => {
    request(app)
      .get(`/todos/${todos[1]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
  it('should return 404 for non-object IDs', (done) => {
    request(app)
      .get('/todos/123}')
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
  it('should return 404 if todo not found', (done) => {
    request(app)
      .get(`/todos/${new ObjectID()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
});
describe('DELETE /todos/:id', () => {
  it('should remove a todo', (done) => {
    const id = todos[1]._id.toHexString();
    request(app)
      .delete(`/todos/${id}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(id);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Todo.findById(id).then((todo) => {
          expect(todo).toBeFalsy();
          done();
        }).catch(e => done(e));
      });
  });
  it('should not remove a todo from another user', (done) => {
    const id = todos[1]._id.toHexString();
    request(app)
      .delete(`/todos/${id}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Todo.findById(id).then((todo) => {
          expect(todo).toBeTruthy();
          done();
        }).catch(e => done(e));
      });
  });
  it('should return 404 if todo not found', (done) => {
    request(app)
      .delete(`/todos/${new ObjectID()}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end(done);
  });
  it('should return 404 if object id is invalid', (done) => {
    request(app)
      .delete('/todos/123}')
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end(done);
  });
});
describe('PATCH /todos/:id', () => {
  const id = todos[0]._id.toHexString();
  it('should update the todo', (done) => {
    const text = 'Mocha update!';
    request(app)
      .patch(`/todos/${id}`)
      .send({
        text,
        completed: true
      })
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(true);
        expect(typeof res.body.todo.completedAt).toBe('number');
      })
      .end(done);
  });
  it('should not update the todo from another user', (done) => {
    const text = 'Mocha update!';
    request(app)
      .patch(`/todos/${id}`)
      .send({
        text,
        completed: true
      })
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end(done);
  });
  it('should clear completedAt when todo is not completed', (done) => {
    const text = 'Mocha update too!';
    request(app)
      .patch(`/todos/${id}`)
      .send({
        text,
        completed: false
      })
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toBeFalsy();
      })
      .end(done);
  });
});
describe('GET /users/me', () => {
  it('should return user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });
  it('should return a 401 if user is not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({ });
      })
      .end(done);
  });
});
describe('POST /users', (done) => {
  it('should create a user', (done) => {
    const email = 'example@example.com';
    const password = '123abc';

    request(app)
      .post('/users')
      .send({ email, password })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeTruthy();
        expect(res.body._id).toBeTruthy();
        expect(res.body.email).toBe(email);
      })
      .end((err) => {
        if (err) {
          return done(err);
        }
        User.findOne({ email }).then((user) => {
          expect(user).toBeTruthy();
          expect(user.password).not.toBe(password);
          done();
        }).catch(e => done(e));
      });
  });
  it('should return validation errors if user invalid', (done) => {
    request(app)
      .post('/users')
      .send({
        email: 'jth',
        password: '123',
      })
      .expect(400)
      .end(done);
  });
  it('should not create a user if email in use', (done) => {
    request(app)
      .post('/users')
      .send({
        email: users[0].email,
        password: '123abc',
      })
      .expect(400)
      .end(done);
  });
});
describe('POST /users/login', (done) => {
  it('should login user and return auth token', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeTruthy();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        User.findById(users[1]._id).then((user) => {
          expect(user.tokens[1]).toMatchObject({
            access: 'auth',
            token: res.headers['x-auth'],
          });
          done();
        }).catch(e => done(e));
      });
  });
  it('should reject invalid login', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: '111aaa'
      })
      .expect(400)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeFalsy();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        User.findById(users[1]._id).then((user) => {
          expect(user.tokens.length).toBe(1);
          done();
        }).catch(e => done(e));
      });
  });
});
describe('DELETE /users/me/token', () => {
  it('should remove auth token on logout', (done) => {
    request(app)
      .delete('/users/me/token')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        User.findById(users[0]._id).then((user) => {
          expect(user.tokens.length).toBe(0);
          done();
        }).catch(e => done(e));
      });
    });
});
