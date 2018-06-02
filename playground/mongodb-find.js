const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
  if (err) {
    return console.log('Unable to connect to MongoDB server');
  }
  const db = client.db('TodoApp');
  console.log('Connected to MongoDB server');

  // find returns curser, toArray returns documents
  db.collection('Users')
  .find({
    name: 'JT'
  })
  .toArray()
  .then((docs) => {
    console.log('Todos');
    // console.log(`count: ${count}`);
    console.log(JSON.stringify(docs, undefined, 2));
  }, (err) => {
    console.log('Error to print todos ', err);
  })

  // client.close();
});
