# 🔐 Secure-MERN  

**A lightweight yet powerful npm package to supercharge security in MERN stack applications.**  
Built with **enterprise-grade architecture** in mind, Secure-MERN integrates essential security features with **minimal configuration**.  

---

## ✅ Features  

- 🔐 Preconfigured **JWT-based authentication**  
- 🔑 **Role-based access control** with fine-grained permissions  
- 🧰 Centralized **security middleware** for Express apps  
- 🧼 Built-in **sanitization & validation**  
- 🛡️ **Helmet** integration for HTTP header protection  
- 🚫 **Rate limiting** enabled by default *(excluded for Admin roles in v3.0.0)*  
- ⚠️ **CSRF protection** included (commented out, easily enabled)  
- 📜 Predefined **User & Role Mongoose schemas**  
- 🧪 Perfect for **small projects → enterprise-grade systems**  
- 🌱 Simple **plug-and-play** into any MERN app  
- 👤 **User profile management** *(image upload & view — needs extra setup)*  
- 🔒 **Password update via dashboard** *(planned development)*  
- 📑 **Automatic user activity logs** *(requires setup — guide below)*  

---

## ✅ What’s New in v4.0.0

- 🆕 Built-in Upload middleware (no need for custom setup)

- 🆕 Built-in Userlog model

- 🆕 Built-in Userlog utility

- 🐞 Fixed major bugs from v3.0.0 & v4.0.0-beta1

- ⚡ Default role = member when registering new users


## 📦 Installation  

Install with npm:  

```bash
npm i secure-mern
```

---

## ⚠️ Limitation (Important)

- When registering a new user, you may encounter a role _id error.

- 👉 To fix this: upload the following Role collection to your MongoDB.
Run the backend once (it will auto-create the models in MongoDB/Compass). Then import this JSON into your Role collection:


```json

[{
  "_id": { "$oid": "6837b60b735077d2866f126b" },
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
    "role:getone",
    "role:delete",
    "user:updatestatus",
    "useractivity:manage",
    "useractivity:oneget"
  ],
  "createdAt": { "$date": "2025-05-29T01:19:07.542Z" },
  "updatedAt": { "$date": "2025-08-19T14:44:25.137Z" },
  "__v": 45
},
{
  "_id": { "$oid": "6837b616735077d2866f126e" },
  "name": "staff",
  "permissions": [],
  "createdAt": { "$date": "2025-05-29T01:19:18.585Z" },
  "updatedAt": { "$date": "2025-08-19T14:57:41.167Z" },
  "__v": 38
},
{
  "_id": { "$oid": "6843973fea08c312b1a7d4cb" },
  "name": "user",
  "permissions": [],
  "createdAt": { "$date": "2025-06-07T01:34:55.181Z" },
  "updatedAt": { "$date": "2025-08-15T12:24:48.025Z" },
  "__v": 4
},
{
  "_id": { "$oid": "68439748ea08c312b1a7d4d6" },
  "name": "member",
  "permissions": [],
  "createdAt": { "$date": "2025-06-07T01:35:04.435Z" },
  "updatedAt": { "$date": "2025-08-15T12:25:08.129Z" },
  "__v": 12
}]



```

---


## 🔑 Default Role Behavior

- Every newly registered user is automatically assigned the member role.

- If you want to promote a user to admin, follow these steps:

- - Go to the User collection in MongoDB.

- - Export the user document as .json.

- - Update the user’s role field with the Admin role _id (6837b60b735077d2866f126b).

- - Re-import the updated JSON back into the User collection.

---

## 🚀 Quick Start  

Example Express app setup:  

```js
const express = require("express");
const mongoose = require("mongoose");
const secureMern = require("secure-mern");
const path = require('path');

require("dotenv").config();

const app = express();

// Initialize Secure-MERN
secureMern(app);

// File serving for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get('/', (req, res) => {
    res.send(`Server running on port ${process.env.PORT}`);
});

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
```

---

## 🔧 Required Setup  

### 📂 Uploads Directory  

```js
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
```

- Create an `uploads` folder in your **backend root**  
- Add `uploads/` to `.gitignore`  

---


### 🖼 Profile Image Management  

- `ProfileImage.js` model already included in package  
- Only frontend integration required  

Sample React component:  

```js
import React, { useState, useEffect } from 'react'
import API from '../../../services/api'

const Profile = () => {
    const [pimg, setPimg] = useState(null)
    const [imgSrc, setImgSrc] = useState("/default-avatar.png")
    const token = localStorage.getItem('token')

    useEffect(() => {
        const fetchProfileImage = async () => {
            try {
                const res = await API.get(`/auth/get-profile-img?nocache=${Date.now()}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                setPimg(res.data.result || null)
            } catch {
                setPimg(null)
            }
        }
        fetchProfileImage()
    }, [token])

    useEffect(() => {
        if (pimg?.profile_image) {
            const normalizedPath = pimg.profile_image.replace(/\\/g, "/")
            const url = `${import.meta.env.VITE_APP_API}${normalizedPath.startsWith("/") ? "" : "/"}${normalizedPath}`
            fetch(url).then(res => res.blob()).then(blob => {
                setImgSrc(URL.createObjectURL(blob))
            }).catch(() => setImgSrc("/default-avatar.png"))
        }
    }, [pimg])

    return (
        <div className="p-6">
            <img src={imgSrc} alt="profile" className="w-40 h-40 rounded-full border-4 border-violet-600 object-cover shadow-md" />
        </div>
    )
}

export default Profile
```

---

## ⚙️ Environment Setup  

📄 `.env`  

```env
MONGO_URI=mongodb://127.0.0.1:27017/newMERNtestAuth
JWT_SECRET=your_jwt_secret_key
PORT=5000

EMAIL_USER=your_email_address
EMAIL_PASSWORD=your_app_password
```

---

## 🧰 Included Middleware & Features

This project comes with several built-in middlewares and utilities to simplify development and enhance security.

| Feature / Middleware   | Purpose |
|-------------------------|---------|
| **cors**               | Enables CORS (cross-origin requests) |
| **helmet**             | Adds secure HTTP headers |
| **express.json()**     | Parses incoming JSON |
| **cookie-parser**      | Parses cookies (required for CSRF protection) |
| **morgan**             | HTTP request logger for debugging |
| **express-rate-limit** | Protects against brute-force attacks (100 reqs / 15 min) |
| *(Admin exception)*    | Admin role is exempt from rate limits |
| **csurf (optional)**   | CSRF protection (disabled by default) |
| **/auth routes**       | Built-in authentication routes (login, register, etc.) |
| **Upload Middleware**  | Integrated Multer upload support (no setup required) |
| **Userlogs Model**     | Tracks user activity (login, logout, actions) |
| **Userlogs Util**      | Helper for automatically logging user actions |
| **Profile Image Support** | Upload and view user profile images |

---
✅ Everything is pre-configured, so you can focus on building your application logic instead of boilerplate setup.


## 👥 Models  

📄 `User.js`  

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

📄 `Role.js`  

```js
const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  permissions: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model("Role", roleSchema);
```

---

## 🔮 Roadmap

Planned & completed features for upcoming versions:

- ✅ Built-in Upload middleware  
- ✅ Built-in Userlogs (model + util)  
- ✅ Bug fixes from v3 & beta  
- 🔁 Refresh tokens  
- 🔒 2FA (Two-Factor Authentication) integration  
- 🌐 OAuth2 / SSO login support  
- 🧑‍💻 Admin panel templates (React + Tailwind)  
- 🧠 Advanced audit logging & IP tracking  
- 📊 Usage analytics  


## 📌 Versioning

This project follows **semantic versioning**. Below is the release history:

| Version      | Notes |
|--------------|-------|
| **v1.0.0**   | Initial release |
| **v2.0.0**   | Added email verification + password reset |
| **v3.0.0**   | Bug fixes, no rate limits for Admins |
| **v4.0.0-beta1** | Beta release, known bugs present |
| **v4.0.0**   | Stable release, built-in upload + user logs |

---

🚀 Always use the **latest stable release** for production.


## 🤝 Contributing  

We welcome contributions! 🚀  

- Fork the repo  
- Run locally with `npm install`  
- Submit PRs or open issues  

---

## 🙌 Acknowledgments  

Built with ❤️ for **MERN developers** who value **security-first architecture**.  
