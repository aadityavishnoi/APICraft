# 🚀 APICraft API Platform

Dynamic API backend system built with **Node.js, Express & MongoDB** that allows users to create custom collections, generate API keys, and access auto-generated APIs securely.

---

## 📌 Features

* 🔐 User Authentication (Signup/Login)
* 🔑 API Key Generation & Validation
* 📦 Dynamic Collection Creation
* ➕ Insert Data via API
* 📖 Fetch Data via API
* ✏️ Update Data
* 📊 API Logs Tracking
* 📚 Swagger/OpenAPI Documentation
* 🛡️ Security Middleware (Helmet, CORS, Validation)

---

## 🛠 Tech Stack

* Node.js
* Express.js
* MongoDB + Mongoose
* JWT Authentication
* Joi Validation
* Swagger UI

---

## 📂 Project Structure

```
APICraft/
│
├── controllers/
├── middleware/
├── models/
├── routes/
├── docs/
├── config/
├── server.js
└── .env
```

---

## ⚙️ Installation

```bash
git clone <repo-url>
cd APICraft
npm install
```

---

## 🔑 Environment Variables (.env)

```
PORT=5500
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret
```

---

## ▶️ Run Server

```bash
node server.js
```

Server runs on:

```
http://localhost:5500
```

---

## 📚 API Documentation

Swagger UI:

```
http://localhost:5500/api-docs
```

Postman collection can be imported using OpenAPI YAML file.

---

## 🧪 Core APIs Overview

### Auth

* POST `/signup`
* POST `/login`

### Collections

* POST `/create-collection`
* GET `/collections`

### Dynamic Data

* POST `/data/:collection`
* GET `/data/:collection`
* PUT `/data/:collection/:id`

### API Keys

* POST `/generate-api-key`

### Logs

* GET `/api-logs`

---

## 🔐 Security Notes

* JWT protected routes
* API Key middleware for public access
* Input validation with Joi
* Headers secured using Helmet

---

## 🚀 Future Improvements

* Frontend Dashboard
* API Rate Limiting
* Billing Integration
* SaaS Deployment
* Analytics Dashboard

---

## 👨‍💻 Author

**APICraft Backend Project**
Built for scalable dynamic API platform development.

---
