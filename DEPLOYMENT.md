# 🚀 Intervue.ai Deployment Guide

This guide details how to deploy **Intervue.ai** (AI Interview Simulator) online so anyone can access it from a live public web link.

---

## 🌟 Method 1: Deploy for FREE on Render (Recommended)

Render offers **free cloud hosting** for Python & Docker web apps.

### Steps:
1. **Push your code to GitHub**:
   - Create a repository on [GitHub](https://github.com/new).
   - Push this project folder to GitHub:
     ```bash
     git init
     git add .
     git commit -m "Initial commit for deployment"
     git branch -M main
     git remote add origin https://github.com/YOUR_USERNAME/ai-interview-simulator.git
     git push -u origin main
     ```

2. **Deploy on Render**:
   - Go to [dashboard.render.com](https://dashboard.render.com) and click **New +** -> **Web Service**.
   - Connect your GitHub repository.
   - Choose **Docker** as the Runtime.
   - Click **Deploy Web Service**!

Render will automatically build the React frontend and Python FastAPI backend inside Docker and give you a live HTTPS link (e.g. `https://intervue-ai.onrender.com`).

---

## ⚡ Method 2: Decoupled Deploy (Vercel Frontend + Render Backend)

### 1. Deploy Backend on Render:
- Create a new Web Service on Render from your repository.
- Select **Python** runtime.
- Build Command: `pip install -r backend/requirements.txt`
- Start Command: `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`

### 2. Deploy Frontend on Vercel:
- Import repository on [Vercel](https://vercel.com).
- Framework Preset: **Vite**.
- Root Directory: `frontend`.
- Click **Deploy**!

---

## 🐳 Method 3: Deploy with Docker Locally or on any VPS

Run the entire application in production mode using Docker:

```bash
# Build Docker image
docker build -t intervue-ai .

# Run container on port 8000
docker run -p 8000:8000 intervue-ai
```

Open `http://localhost:8000` to access the production app.
