# 📄 Document Management System (DMS)

## 📌 Project Overview
The **Document Management System (DMS)** is a full-stack web application developed using the **MEAN stack**.  
It enables secure document handling with **role-based access control**, **cloud-based file storage**, and **document versioning**.

The system allows users to upload, view, search, update, and manage documents through an Angular-based dashboard, following real-world industry practices.

---

## 🎯 Features
- 🔐 JWT-based Authentication
- 👥 Role-Based Access Control
  - **Admin**: Upload, view, delete documents
  - **Editor**: Upload and view documents
  - **Viewer**: View documents only
- 📂 Document Upload, View & Delete
- ☁️ Cloudinary File Storage
- 🕒 Document Version History
- 🔍 Search and Filter Documents
- 📊 Angular Dashboard Interface
- 🗄️ MongoDB Persistence via Mongoose

---

## 🛠️ Tech Stack & Version Details

### Backend
- Node.js: v18.x
- Express.js: v4.x
- MongoDB: v6.x
- Mongoose: v7.x
- JWT (jsonwebtoken): v9.x
- Multer: v1.x
- Cloudinary SDK: v1.x
- Nodemon: v3.x

### Frontend
- Angular: v21.0.4
- TypeScript: v5.x
- Bootstrap: v5.x
- RxJS: v7.x

---

## 📁 Project Structure
DMS/
│
├── backend/
│ ├── controllers/
│ ├── middleware/
│ ├── models/
│ ├── routes/
│ ├── utils/
│ ├── .env.example
│ └── server.js
│
├── frontend/
│ ├── src/
│ │ ├── app/
│ │ ├── environments/
│ │ └── assets/
│ └── angular.json
│
└── README.md
## 🔧 Backend Setup

### 1️⃣ Navigate to backend directory
```bash
cd backend
2️⃣ Install dependencies
bash
Copy code
npm install
3️⃣ Configure environment variables
Create a .env file inside the backend folder using the following format:

env
Copy code
PORT=5000
MONGO_URI=mongodb://localhost:27017/dms_db
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
Start the backend server
# Development mode
npm run dev

# OR production mode
npm start


The backend server will run at:

http://localhost:5000
Frontend Setup
1️⃣ Navigate to frontend directory
cd frontend

2️⃣ Install dependencies
npm install

3️⃣ Configure API base URL

Edit the file:

frontend/src/environments/environment.ts

export const environment = {
  apiBaseUrl: 'http://localhost:5000/api'
};

4️⃣ Start the Angular application
ng serve


The frontend application will run at:

http://localhost:4200
Authentication Flow

Users register and log in using email and password

JWT token is generated upon successful login

Token is stored in browser localStorage

Protected routes require the header:

Authorization: Bearer <token>

📡 API Endpoints
Authentication

POST /api/auth/register — Register a new user

POST /api/auth/login — Login and receive JWT token

Documents

POST /api/documents/upload — Upload or update document (Admin, Editor)

GET /api/documents — List documents

GET /api/documents/:id — Get document details

GET /api/documents/:id/history — Get document version history

DELETE /api/documents/:id — Delete document (Admin only)

🔐 Security Practices

Passwords are hashed using bcrypt

JWT-based authentication and authorization

Role-based route protection

Environment variables and secrets excluded from submission

🧪 Testing

Frontend unit tests can be executed using:

cd frontend
npm test

📦 Submission Notes

.env file is excluded for security reasons

.env.example file is provided

README includes complete local setup instructions and version details




