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
- Create a custom **upload middleware** (not included by default):  

📄 `middlewares/uploadMiddleware.js`  

```js
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

module.exports = upload;
```

---

### 📝 User Activity Logs  

📄 `models/Userlogs.js`  

```js
const mongoose = require('mongoose');

const UserlogsSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true, default: 'other' },
    description: { type: String, trim: true },
    ipAddress: { type: String },
    userAgent: { type: String },
    metadata: { type: Object, default: {} }
}, { timestamps: true });

module.exports = mongoose.model('Userlogs', UserlogsSchema);
```

📄 `utils/logUserAction.js`  

```js
const Userlogs = require('../models/Userlogs');
const User = require('../node_modules/secure-mern/models/User');
const jwt = require('jsonwebtoken');

const logUserAction = async (req, action, description, metadata = {}, userId = null) => {
    try {
        let finalUserId = userId;

        if (!finalUserId) {
            const token = req.header("Authorization")?.replace("Bearer ", "");
            if (token) {
                try {
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                    const user = await User.findOne({ email: decoded.email });
                    if (user) finalUserId = user._id;
                } catch {
                    console.warn("Token invalid or expired. Provide userId manually if needed.");
                }
            }
        }

        if (!finalUserId) throw new Error("No userId provided and token not found or invalid");

        await Userlogs.create({
            user: finalUserId,
            action,
            description,
            ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            userAgent: req.headers['user-agent'],
            metadata
        });
    } catch (err) {
        console.error("Failed to log user action:", err.message);
    }
};

module.exports = logUserAction;
```

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

## 🧰 Included Middleware  

| Middleware             | Purpose                                                   |
|-------------------------|-----------------------------------------------------------|
| `cors`                 | Enables CORS (cross-origin requests)                      |
| `helmet`               | Adds secure HTTP headers                                  |
| `express.json()`       | Parses incoming JSON                                     |
| `cookie-parser`        | Parses cookies (needed for CSRF)                         |
| `morgan`               | HTTP request logger                                      |
| `express-rate-limit`   | Protects against brute-force (100 reqs/15min)            |
| *(Admin exception)*    | No rate limit for `admin` role                           |
| `csurf` (optional)     | CSRF protection (disabled by default)                     |
| `/auth` routes         | Built-in authentication routes                           |
| Profile image support  | Upload & view profile image                              |
| Activity tracking      | Auto-records user actions                                |

---

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

## 🧪 Development & Testing  

Sample roles JSON to seed database:  

```json
[
  { "name": "admin", "permissions": ["role:manage","role:create","role:update","systemusers:manage","systemusers:create","systemusers:update","permission:manage","permission:create","permission:update","permission:delete","role:getone"] },
  { "name": "staff", "permissions": [] },
  { "name": "member", "permissions": ["user:create"] },
  { "name": "user", "permissions": ["case:view"] }
]
```

---

## 🔮 Roadmap  

- ✅ Rate limiting  
- ✅ CSRF protection (toggleable)  
- 🔁 Refresh tokens  
- 🔒 2FA integration  
- 🌐 OAuth2 / SSO login  
- 🧑‍💻 Admin panel templates (React + Tailwind)  
- 🧠 Advanced audit logging & IP tracking  
- 📊 Usage analytics  

---

## 📌 Versioning  

| Version       | Notes                                          |
|---------------|-----------------------------------------------|
| v1.0.0        | Initial release                               |
| v2.0.0        | Added email verification + password reset     |
| v3.0.0        | Bug fixes, **no rate limits for Admins**      |
| v4.0.0-beta1  | Under development (use v3.0.0 for production) |

---

## 🤝 Contributing  

We welcome contributions! 🚀  

- Fork the repo  
- Run locally with `npm install`  
- Submit PRs or open issues  

---

## 🙌 Acknowledgments  

Built with ❤️ for **MERN developers** who value **security-first architecture**.  
