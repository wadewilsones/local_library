# Local Library App

### CRUD application. Allows adding, removing, and updating book titles. MVC pattern.

This project still requires some work. 

![Local Library](https://raw.githubusercontent.com/wadewilsones/local_library/main/library.jpg?raw=true)

## Get started

1. Clone the application to your local computer:
```
gh repo clone wadewilsones/local_library
```
2. Install all packages:

```
npm install
```


For this application I've used MongoDb Atlas. So to start working with your DB you will need to change the MONGOURI in app.js file

```js

//app.js

const mongoose = require("mongoose");
const mongoDb = process.env.MONGODB_URI; // Change this MONGODB_URI to your own value.
mongoose.connect(mongoDb, {useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"))

```

3. Start the application

```
npm run serverstart
```


