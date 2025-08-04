# 🔐 Secure-MERN

A lightweight yet powerful npm package to enhance security in MERN stack applications. Built with enterprise-grade architecture in mind, secure-mern helps you integrate essential security features with minimal configuration.

## ✅ Features

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



## 📦 Installation

- Install using npm:

```bash

npm i secure-mern

```

## 🚀 Quick Start

- Here’s how to get started with `secure-mern`:

```js

const express = require("express");
const mongoose = require("mongoose");
const secureMern = require("secure-mern");

require("dotenv").config();

const app = express();

secureMern(app);

app.get('/', (req, res) => {
    res.send(`Server running on port ${process.env.PORT}`);
})

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});


```

## ⚙️ Environment Setup

- Create a `.env` file in your root directory and define:

```env

MONGO_URI = mongodb://127.0.0.1:27017/newMERNtestAuth
JWT_SECRET = your_jwt_secret_key
PORT=5000

EMAIL_USER=your_email_address
EMAIL_PASSWORD=your_app_password

```

- MONGO_URI: Your MongoDB connection string.

- JWT_SECRET: Used to sign and verify JWT tokens.

## 🧰 What’s Included in secureMern(app)

- The following middleware is applied automatically:

| Middleware            | Description                                                     |
| --------------------- | --------------------------------------------------------------- |
| `cors`                | Enables cross-origin resource sharing                           |
| `helmet`              | Sets secure HTTP headers                                        |
| `express.json()`      | Parses incoming JSON requests                                   |
| `cookie-parser`       | Parses cookies (needed for CSRF support)                        |
| `morgan`              | Logs HTTP requests for development                              |
| `express-rate-limit`  | Protects against brute-force attacks (100 reqs per 15 min)      |
| `csurf` *(optional)*  | CSRF protection middleware (included but commented for testing) |
| `/auth` route support | Automatically mounts authentication routes                      |

- - 💡 You can easily extend or configure these middlewares as needed.

## 👥 Models

- 📄 `User.js`

- - Predefined Mongoose schema for User:

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

- 📄 `Role.js`

- - Defines roles and permissions for RBAC:

```js

const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  permissions: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model("Role", roleSchema);


```

## 🧪 Development & Testing Setup

- You can populate roles using MongoDB shell or Compass:

```js
db.roles.insertMany([
  {
    name: "admin",
    permissions: [
      "user:create", "user:read", "user:update", "user:delete",
      "role:create", "role:read", "role:update", "role:delete"
    ]
  },
  {
    name: "editor",
    permissions: [
      "user:read", "user:update",
      "content:create", "content:read", "content:update"
    ]
  },
  {
    name: "viewer",
    permissions: [
      "content:read", "user:read"
    ]
  }
]);


```


## 🔮 Future Roadmap

✅ Rate limiting

✅ CSRF protection (toggleable)

🔁 Refresh tokens

🔒 2FA integration

🌐 OAuth2 / SSO login

🧑‍💻 Admin panel templates (React + Tailwind)

🧠 Audit logging & IP tracking

📊 Usage analytics


## Versioning

| Version | Description                                      |
|---------|--------------------------------------------------|
| v1.0.0  | Initial release                                  |
| v2.0.0  | Added email verification and forgot password     |


## 🤝 Contributing
We welcome contributions! To get started:

- Fork the repo

- Run it locally (npm install)

- Submit pull requests or open issues


## 🙌 Acknowledgments

Built with ❤️ for MERN developers who value security-first architecture.