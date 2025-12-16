# Checklisin Yuk! 📋

> Sistem Checklist Defect Struktur - Web Application

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite + TailwindCSS + TanStack Table |
| Backend | Express.js + Node.js |
| Database | PostgreSQL |
| Auth | JWT (JSON Web Token) + bcrypt |

---

## ✅ Features

- 📋 Defect Management (CRUD with photo capture)
- 🔔 Notification System (timed reminders)
- 👥 Team Member Management
- 🔐 Role-based Access (Manager/Staff)
- 📱 Mobile Responsive
- 📷 Camera Integration

---

## 📁 Project Structure

```
code abdul/
├── client/                 # Frontend (React)
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service
│   │   └── App.jsx         # Routes
│   └── package.json
│
├── server/                 # Backend (Express)
│   ├── config/
│   │   └── database.js     # PostgreSQL connection
│   ├── middleware/
│   │   └── auth.js         # JWT authentication
│   ├── routes/
│   │   ├── authRoutes.js   # Login/Register
│   │   ├── defectRoutes.js # Defect CRUD
│   │   ├── memberRoutes.js # Member management
│   │   └── userRoutes.js   # User management
│   ├── .env.example        # Environment template
│   ├── package.json
│   └── server.js           # Entry point
│
└── database/
    └── schema.sql          # Database schema
```

---

## 🚀 Local Development

### 1. Setup Database (PostgreSQL)

```bash
# Create database
psql -U postgres
CREATE DATABASE checklisin_db;
\q

# Run schema
psql -U postgres -d checklisin_db -f database/schema.sql
```

### 2. Setup Backend

```bash
cd server

# Copy environment file
cp .env.example .env

# Edit .env with your database credentials
# DB_USER=postgres
# DB_PASSWORD=your_password
# DB_NAME=checklisin_db
# JWT_SECRET=your_secret_key

# Install dependencies
npm install

# Start server
npm run dev
```

### 3. Setup Frontend

```bash
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Access the Application

| URL | Description |
|-----|-------------|
| http://localhost:5173 | Frontend |
| http://localhost:5000 | Backend API |
| http://localhost:5173/secret-admin | Secret Admin Page |

---

## 🌐 FREE Deployment Guide

### Deploy untuk GRATIS menggunakan:
- **Database**: Supabase (PostgreSQL gratis)
- **Backend**: Render (Node.js gratis)
- **Frontend**: Vercel (React gratis)

---

### Step 1: Setup Supabase Database 🗄️

1. **Buat akun di [supabase.com](https://supabase.com)**

2. **Create New Project**
   - Organization: Pilih atau buat baru
   - Project name: `checklisin-db`
   - Database password: **SIMPAN PASSWORD INI!**
   - Region: Southeast Asia (Singapore)

3. **Copy Connection String**
   - Go to: Settings → Database
   - Copy: **Connection string (URI)**
   - Formatnya: `postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres`

4. **Run Schema**
   - Go to: SQL Editor
   - Paste isi file `database/schema.sql`
   - Klik **Run**

---

### Step 2: Deploy Backend ke Render 🚀

1. **Push code ke GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/USERNAME/checklisin-app.git
   git push -u origin main
   ```

2. **Buat akun di [render.com](https://render.com)**

3. **Create New Web Service**
   - Connect GitHub repository
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

4. **Set Environment Variables di Render**
   ```
   DATABASE_URL = postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres
   JWT_SECRET = your-super-secret-jwt-key-123
   NODE_ENV = production
   ```

5. **Deploy!** - Catat URL backend (contoh: `https://checklisin-api.onrender.com`)

---

### Step 3: Deploy Frontend ke Vercel ⚡

1. **Buat akun di [vercel.com](https://vercel.com)**

2. **Import Project dari GitHub**
   - Connect repository yang sama
   - **Root Directory**: `client`
   - **Framework Preset**: Vite

3. **Set Environment Variables di Vercel**
   ```
   VITE_API_URL = https://checklisin-api.onrender.com
   ```
   (Ganti dengan URL Render backend kamu)

4. **Deploy!** - URL frontend siap (contoh: `https://checklisin-app.vercel.app`)

---

### Step 4: Update CORS di Render ⚙️

Setelah dapat URL Vercel, update Environment Variable di Render:
```
FRONTEND_URL = https://checklisin-app.vercel.app
```

---

### 🎉 Selesai! Aplikasi Live!

| Service | URL |
|---------|-----|
| Frontend | https://your-app.vercel.app |
| Backend | https://your-api.onrender.com |
| Database | Supabase (auto-managed) |

---

## 🔐 Authentication

### Create First Admin Account
Setelah deploy, buka `/secret-admin` untuk membuat akun admin pertama.

### Roles
| Role | Permissions |
|------|-------------|
| Manager | All operations + Invite members |
| Staff | All operations except invite |

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/register` | Register user |
| GET | `/api/auth/me` | Get current user |

### Defects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/defects` | Get all defects |
| POST | `/api/defects` | Create defect |
| PUT | `/api/defects/:id` | Update defect |
| PATCH | `/api/defects/:id/status` | Update status |
| DELETE | `/api/defects/:id` | Delete defect |

### Members
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/members` | Get all members |
| POST | `/api/members/invite` | Invite member (Manager only) |
| DELETE | `/api/members/:id` | Remove member (Manager only) |

---

## 🔧 Environment Variables

### Backend (.env)
```env
# Local Development
DB_USER=postgres
DB_HOST=localhost
DB_NAME=checklisin_db
DB_PASSWORD=your_password
DB_PORT=5432
PORT=5000
JWT_SECRET=your_secret_key

# Production (Render)
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret_key
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
```

### Frontend (.env)
```env
# Production (Vercel)
VITE_API_URL=https://your-api.onrender.com
```

---

## 📱 Pages

| Page | Route | Access |
|------|-------|--------|
| Login | `/login` | Public |
| Home (Defects) | `/` | Authenticated |
| Members | `/members` | Authenticated |
| Admin | `/admin` | Authenticated |
| Secret Admin | `/secret-admin` | Password: admin123 |

---

## ⚠️ Important Notes

### Free Tier Limitations
- **Render Free**: Server sleeps after 15 min inactive (first request takes ~30s to wake up)
- **Supabase Free**: 500MB database, 2GB bandwidth/month
- **Vercel Free**: 100GB bandwidth/month

### Tips
- Render free tier akan sleep - user pertama harus tunggu ~30 detik
- Untuk production serius, upgrade ke paid tier
- Backup database secara berkala dari Supabase dashboard

5. **Connect Frontend to Backend**
   - Update API calls in pages
   - Handle JWT tokens

---

Made with ❤️ for Skripsi
