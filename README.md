# 🔐 Secure-MERN

A lightweight yet powerful npm package to enhance security in MERN stack applications. Built with enterprise-grade architecture in mind, secure-mern helps you integrate essential security features with minimal configuration.

# ✅ Features

🔐 Preconfigured JWT-based authentication

🔑 Role-based access control with granular permissions

🧰 Centralized security middleware for Express apps

🧼 Built-in sanitization and validation

🛡️ Helmet integration for HTTP header security

🚫 Rate limiting included (enabled by default)

⚠️ CSRF protection included (commented for now, easy to enable)

📜 Predefined User and Role Mongoose schemas

🧪 Suitable for small projects to enterprise-grade systems

🌱 Easy to plug into any existing or new MERN stack app



- just install the via npm

```bash

npm i secure-mern

```

## how to use

```js

const express = require("express");
const mongoose = require("mongoose");
const secureMern = require("secure-mern");

require("dotenv").config();

const app = express();
secureMern(app);

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(5000, () => {
            console.log("Server running on port 5000");
        });
    })
    .catch(err => console.log(err));


```

- this is sample code 
- you must create `.env` file and define following values

```env

MONGO_URI = mongodb://127.0.0.1:27017/testSMERN
JWT_SECRET = 'jwt-secret'

```
- - MONGO_URI - change according to your database (for testing keep this if you like)
- - JWT_SECRET - change according to your JWT_SECRET (for testing keep this if you like)

## for development

- - `User.js` User model

```js

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, lowercase: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phone: String,
    avatar: String,
    role: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true },
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    lastLogin: Date,
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);


```

- - `Role.js` Role model
- - - contains permisstions to user

```js

const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  permissions: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model("Role", roleSchema);


```

- for development use this data 
- - open mongodb compass
- - add via shell

```js

db.roles.insertMany([
  {
    name: "admin",
    permissions: [
      "user:create",
      "user:read",
      "user:update",
      "user:delete",
      "role:create",
      "role:read",
      "role:update",
      "role:delete"
    ]
  },
  {
    name: "editor",
    permissions: [
      "user:read",
      "user:update",
      "content:create",
      "content:read",
      "content:update"
    ]
  },
  {
    name: "viewer",
    permissions: [
      "content:read",
      "user:read"
    ]
  }
]);


```

## future updates

- make securty same for developed enterpice level apps



