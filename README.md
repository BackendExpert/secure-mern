# 🔐 Secure-MERN

A lightweight yet powerful npm package to enhance security in MERN stack applications. Built with enterprise-grade architecture in mind, secure-mern helps you integrate essential security features with minimal configuration.

## ✅ Features

🔐 Preconfigured JWT-based authentication

🔑 Role-based access control with granular permissions

🧰 Centralized security middleware for Express apps

🧼 Built-in sanitization and validation

🛡️ Helmet integration for HTTP header security

🚫 Rate limiting included (enabled by default)

🚫 Rate limiting included (rate limit not include for admin roles - v3.0.0 update)

⚠️ CSRF protection included (commented for now, easy to enable)

📜 Predefined User and Role Mongoose schemas

🧪 Suitable for small projects to enterprise-grade systems

🌱 Easy to plug into any existing or new MERN stack app

👤 User profile management (update & view profile image) — Additional development needed

🔒 User password update via dashboard — Additional development needed

📑 User activity logs automatically recorded — Additional development needed

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
const path = require('path')

require("dotenv").config();

const app = express();

secureMern(app);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get('/', (req, res) => {
    res.send(`Server running on port ${process.env.PORT}`);
})

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});

```

## IMPORTANT - must need to do (if not this is not working)

### for uploads

```js

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

```

- create `uploads` folder in your root backend folder

- if use git repo add this to `.gitignore` file

- create custom middleware for file uploads (default npm package doesnt have this middleware)

- - in root backend folder

- - middlewares/uploadMiddleware.js create this file and past following content to it

```js

const multer = require("multer");
const path = require("path");


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

module.exports = upload;

```

### for user activity logs

- create model in root backend folder

- - models/Userlogs.js (copy following content to in)

```js

const mongoose = require('mongoose');

const UserlogsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true,
        default: 'other'
    },
    description: {
        type: String,
        trim: true
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    },
    metadata: {
        type: Object,
        default: {}
    }
}, { timestamps: true });

module.exports = mongoose.model('Userlogs', UserlogsSchema);


```

- create helper function for user activity logs

- - in backend root folder

- - utils/logUserAction.js

```js

// utils/logUserAction.js
const Userlogs = require('../models/Userlogs');
const User = require('../node_modules/secure-mern/models/User');
const jwt = require('jsonwebtoken');

const logUserAction = async (req, action, description, metadata = {}, userId = null) => {
    try {
        let finalUserId = userId;

        // If no userId provided manually, try to get it from token
        if (!finalUserId) {
            const token = req.header("Authorization")?.replace("Bearer ", "");
            if (token) {
                try {
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                    const user = await User.findOne({ email: decoded.email });
                    if (user) {
                        finalUserId = user._id;
                    } else {
                        throw new Error("User not found");
                    }
                } catch (err) {
                    console.warn("Token invalid or expired. Provide userId manually if needed.");
                }
            }
        }

        if (!finalUserId) {
            throw new Error("No userId provided and token not found or invalid");
        }

        const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'];

        await Userlogs.create({
            user: finalUserId,
            action,
            description,
            ipAddress,
            userAgent,
            metadata
        });

    } catch (err) {
        console.error("Failed to log user action:", err.message);
    }
};

module.exports = logUserAction;


```

### Profile Image Upload and view

- for this ProfileImage.js model already in this package 

- need to do only things is fix frontend (for view Image)

- sample code 

```js

import React, { useState, useEffect } from 'react'
import API from '../../../services/api'

const Profile = () => {
    const [activeTab, setActiveTab] = useState("profile")
    const [pimg, setPimg] = useState(null)
    const [imgSrc, setImgSrc] = useState("/default-avatar.png") // fallback
    const token = localStorage.getItem('token')

    // Fetch profile image path from backend
    useEffect(() => {
        const fetchProfileImage = async () => {
            try {
                const res = await API.get(`/auth/get-profile-img?nocache=${Date.now()}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Cache-Control": "no-cache",
                        Pragma: "no-cache",
                        Expires: "0",
                    },
                })
                setPimg(res.data.result || null)
            } catch (err) {
                console.error("Failed to fetch profile image:", err)
                setError("Could not load profile image")
                setPimg(null)
            } finally {
                setLoading(false)
            }
        }

        fetchProfileImage()
    }, [token])

    // Fetch actual image blob safely to avoid CORS issues
    useEffect(() => {
        if (pimg?.profile_image) {
            const normalizedPath = pimg.profile_image.replace(/\\/g, "/")
            const url = `${import.meta.env.VITE_APP_API}${normalizedPath.startsWith("/") ? "" : "/"}${normalizedPath}`

            fetch(url)
                .then(res => res.blob())
                .then(blob => {
                    const localUrl = URL.createObjectURL(blob)
                    setImgSrc(localUrl)
                })
                .catch(err => {
                    console.error("Failed to load image blob:", err)
                    setImgSrc("/default-avatar.png")
                })
        } else {
            setImgSrc("/default-avatar.png")
        }
    }, [pimg])

    return (
        <div className="max-w-8xl mx-auto p-6">
            <div className="">
              <img
                src={imgSrc}
                alt="profile"
                className="w-40 h-40 rounded-full border-4 border-violet-600 object-cover shadow-md"
              />
            </div>
        </div>
    )
}

export default Profile

```

- sometime got errors or bugs (waiting for next major release v4.0.0  this is v4.0.0-beta1 (production-ready))


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
| `express-rate-limit`  | no limites for `admin` roles      |
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

- use following json data to create role model, if needed

```jssn

[{
  "_id": {
    "$oid": "6837b60b735077d2866f126b"
  },
  "name": "admin",
  "permissions": [
    "role:manage",
    "role:create",
    "role:update",
    "systemusers:manage",
    "systemusers:create",
    "systemusers:update",
    "permission:manage",
    "permission:create",
    "permission:update",
    "permission:delete",
    "role:getone"
  ],
  "createdAt": {
    "$date": "2025-05-29T01:19:07.542Z"
  },
  "updatedAt": {
    "$date": "2025-08-15T04:39:19.866Z"
  },
  "__v": 45
},
{
  "_id": {
    "$oid": "6837b616735077d2866f126e"
  },
  "name": "staff",
  "permissions": [],
  "createdAt": {
    "$date": "2025-05-29T01:19:18.585Z"
  },
  "updatedAt": {
    "$date": "2025-06-20T01:24:06.714Z"
  },
  "__v": 38
},
{
  "_id": {
    "$oid": "6843973fea08c312b1a7d4cb"
  },
  "name": "member",
  "permissions": [
    "user:create"
  ],
  "createdAt": {
    "$date": "2025-06-07T01:34:55.181Z"
  },
  "updatedAt": {
    "$date": "2025-08-15T03:25:26.656Z"
  },
  "__v": 4
},
{
  "_id": {
    "$oid": "68439748ea08c312b1a7d4d6"
  },
  "name": "user",
  "permissions": [
    "case:view"
  ],
  "createdAt": {
    "$date": "2025-06-07T01:35:04.435Z"
  },
  "updatedAt": {
    "$date": "2025-08-15T05:19:28.746Z"
  },
  "__v": 12
}]


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
| v3.0.0  | fix bugs in v2.0.0, no rate limites for `admin`  |


## 🤝 Contributing
We welcome contributions! To get started:

- Fork the repo

- Run it locally (npm install)

- Submit pull requests or open issues


## 🙌 Acknowledgments

Built with ❤️ for MERN developers who value security-first architecture.