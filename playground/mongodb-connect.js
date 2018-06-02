const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
  if (err) {
    return console.log('Unable to connect to MongoDB server');
  }
  const db = client.db('TodoApp');
  console.log('Connected to MongoDB server');

  // db.collection('Todos').insertOne({
  //   text: 'mix the beets',
  //   completed: false
  // }, (err, result) => {
  //   if (err) {
  //     return console.log('Unable to insert todo ', err);
  //   }
  //   console.log(JSON.stringify(result.ops, undefined, 2));
  // });

  // name, age, location

  db.collection('Users').insertOne({
    name: 'JT',
    age: 25,
    location: 'Beijing'
  }, (err, result) => {
    if (err) {
      return console.log('Unable to insert new User ', err);
    }
    console.log(JSON.stringify(result.ops, undefined, 2));
  });

  client.close();
});
