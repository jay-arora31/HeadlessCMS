## Approach
I created a rudimentary headless CMS with basic CRUD functionality using the following approach:

#### Backend Setup:

I set up a Node.js project using Express.js for the server.
<br>
I used Sequelize ORM to interact with a MySQL database.
<br>

I created a configuration file to establish the database connection.
<br>

I implemented dynamic entity creation by defining routes and controllers that generate database tables based on user-specified attributes. This included setting up models and migrations for each new entity.
<br>

#### Frontend Setup:

I used React to create the user interface.<br>

I implemented React Router for client-side navigation.<br>

I used Axios to handle API requests to the backend.<br>

I created forms to allow users to define new entities with various attributes and types.<br>

I added functionality to create, read, update, and delete data entries for each entity.<br>

With this setup, users can dynamically create entities from the frontend, which in turn prompts the backend to generate corresponding database tables. The frontend provides interfaces for managing data entries, enabling users to perform CRUD operations seamlessly.
<br>

https://github.com/jay-arora31/HeadlessCMS/assets/68243425/759b2c5f-e570-44fb-82e2-afdb62394512


## Installation

1. Clone repository

```shell
git clone https://github.com/jay-arora31/HeadlessCMS.git
```

## Install Client (React Files)

2. Get in the client folder

```shell
cd client
cd frontend
```

3. Install dependencies via npm or yarn

```shell
npm install
```

4. Start Client

```shell
npm start
```

## Install Server (Node Files)

2. Get in the server folder

```shell
cd server
```

3. Install dependencies via npm or yarn

```shell
npm install
```

4. Start Server

```shell
nodemon app.js
```


# Database Connection Setup

This document describes the setup and configuration for the MySQL database connection used in the project. The connection is established using the `mysql2` library.

## File Structure

The database connection configuration is located in the `db` folder with the following file:

- `db/conn.js`

## `conn.js`

The `conn.js` file is responsible for creating and exporting a connection to the MySQL database. Below is the content of the `conn.js` file:

```javascript
const mysql = require("mysql2");

const conn = mysql.createConnection({
    user: "",
    port: , // Specify the port number
    host: "",
    password: "",
    database: ""
});

conn.connect((err) => {
    if (err) throw err;
    console.log("DB connected");
});

module.exports = conn;
