const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
  if (err) {
    return console.log('Unable to connect to MongoDB server');
  }
  const db = client.db('TodoApp');
  console.log('Connected to MongoDB server');

  // db.collection('Todos').findOneAndUpdate({
  //   _id: new ObjectID('5b055366ede0f27022d9d0cd')
  // }, {
  //   $set: {
  //     completed: true
  //   }
  // }, {
  //     returnOriginal: false
  // }).then((results) => {
  //   console.log(results);
  // });

  db.collection('Users').findOneAndUpdate({
    _id: new ObjectID('5b0559b02a848f7ab44a6ce8')
  }, {
    $set: {
      name: 'Trogdor'
    },
    $inc: {
      age: -2
    }
  }, {
      returnOriginal: false
  }).then((results) => {
    console.log(results);
  });

  // client.close();
});
