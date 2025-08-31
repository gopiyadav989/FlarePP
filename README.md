<div align="center">

# 🎬 FlarePP

### **Video Collaboration Platform for Creators & Editors**

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.8.1-47A248?style=for-the-badge&logo=mongodb)](https://mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.15-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

**Seamless video editing workflow between creators and editors**

---

</div>

## 🚀 Quick Start

```bash
# Clone & Install
git clone https://github.com/username/FlarePP.git
cd FlarePP
npm install
cd client && npm install

# Start Development
npm run dev          # Backend
cd client && npm run dev  # Frontend
```

---

## ✨ Features

### 🎯 **Creator Dashboard**
- 📤 **Video Upload** → YouTube API + Cloud Storage
- 👀 **Review System** → Preview edited videos
- 📺 **Publish** → Direct YouTube publishing
- 📊 **Analytics** → Performance tracking

### ✂️ **Editor Workspace**
- 📥 **Download** → Access creator videos
- 🎬 **Local Editing** → Professional tools
- 📤 **Re-upload** → Submit edited versions
- 💬 **Communication** → Real-time messaging

### 🔐 **Security & Auth**
- 🔑 **Google OAuth 2.0** → Secure login
- 👥 **Role-based Access** → Creator/Editor roles
- 🔒 **JWT Tokens** → Session management

---

## 🛠 Tech Stack

| **Frontend** | **Backend** | **Database** | **Services** |
|--------------|-------------|--------------|---------------|
| ![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat&logo=react) | ![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat&logo=nodedotjs) | ![MongoDB](https://img.shields.io/badge/MongoDB-8.8.1-47A248?style=flat&logo=mongodb) | ![YouTube API](https://img.shields.io/badge/YouTube_API-FF0000?style=flat&logo=youtube) |
| ![Redux](https://img.shields.io/badge/Redux_Toolkit-2.3.0-764ABC?style=flat&logo=redux) | ![Express](https://img.shields.io/badge/Express-4.21.1-000000?style=flat&logo=express) | ![Mongoose](https://img.shields.io/badge/Mongoose-8.8.1-880000?style=flat&logo=mongodb) | ![Cloudinary](https://img.shields.io/badge/Cloudinary-2.5.1-0070F3?style=flat&logo=cloudinary) |
| ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.15-38B2AC?style=flat&logo=tailwind-css) | ![Socket.io](https://img.shields.io/badge/Socket.io-Real_time-010101?style=flat&logo=socketdotio) | ![JWT](https://img.shields.io/badge/JWT-9.0.2-000000?style=flat&logo=jsonwebtokens) | ![Framer Motion](https://img.shields.io/badge/Framer_Motion-11.18.2-0055FF?style=flat&logo=framer) |

---

## 📁 Project Structure

```
FlarePP/
├── 🎬 api/                 # Backend API
│   ├── 📊 controllers/     # Business logic
│   ├── 🛣️ routes/         # API endpoints
│   ├── 📋 models/         # Database schemas
│   └── 🔧 middlewares/    # Auth & validation
├── 🎨 client/             # React Frontend
│   ├── 🧩 components/     # UI components
│   ├── 📄 pages/          # Page components
│   ├── 🔄 redux/          # State management
│   └── 🎯 hooks/          # Custom hooks
└── 📦 package.json         # Dependencies
```

---

## 🔄 Workflow

```mermaid
graph LR
    A[🎬 Creator Upload] --> B[📥 Editor Download]
    B --> C[✂️ Local Editing]
    C --> D[📤 Editor Upload]
    D --> E[👀 Creator Review]
    E --> F[📺 YouTube Publish]
    
    style A fill:#ff6b6b
    style F fill:#51cf66
```

---

## 🚀 Getting Started

### 1️⃣ **Environment Setup**
```bash
# Create .env file
cp .env.example .env

# Configure variables
MONGO_URI=mongodb://localhost:27017/flarepp
YOUTUBE_API_KEY=your_youtube_api_key
JWT_SECRET=your_jwt_secret
```

### 2️⃣ **Install Dependencies**
```bash
# Backend
npm install

# Frontend
cd client && npm install
```

### 3️⃣ **Start Development**
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
cd client && npm run dev
```

---

## 📊 API Endpoints

| **Method** | **Endpoint** | **Description** |
|------------|--------------|-----------------|
| `POST` | `/api/auth/login` | 🔑 User authentication |
| `POST` | `/api/videos/upload` | 📤 Upload video metadata |
| `GET` | `/api/videos` | 📋 List available videos |
| `POST` | `/api/videos/reupload` | 📤 Submit edited video |
| `POST` | `/api/videos/publish` | 📺 Publish to YouTube |

---

## 🎯 Key Features

- 🔄 **Real-time Updates** → WebSocket notifications
- 📱 **Responsive Design** → Mobile-first approach
- 🎨 **Modern UI** → TailwindCSS + Radix UI
- 🔐 **Secure Auth** → Google OAuth + JWT
- 📊 **Analytics** → Performance tracking
- 💬 **Messaging** → Creator-Editor communication

---

<div align="center">

## 🤝 Contributing

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](http://makeapullrequest.com)

**Fork → Feature → Pull Request**

---

## 📄 License

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**Made with ❤️ by the FlarePP Team**

---

[![GitHub stars](https://img.shields.io/github/stars/username/FlarePP?style=social)](https://github.com/username/FlarePP)
[![GitHub forks](https://img.shields.io/github/forks/username/FlarePP?style=social)](https://github.com/username/FlarePP)
[![GitHub issues](https://img.shields.io/github/issues/username/FlarePP?style=social)](https://github.com/username/FlarePP)

</div>
