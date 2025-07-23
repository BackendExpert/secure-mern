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

// Apply secureMERN middleware to your app
secureMern(app);

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(5000, () => {
            console.log("Server running on port 5000");
        });
    })
    .catch(err => console.log(err));


```

## ⚙️ Environment Setup

- Create a `.env` file in your root directory and define:

```env

MONGO_URI = mongodb://127.0.0.1:27017/testSMERN
JWT_SECRET = your_jwt_secret_key

```