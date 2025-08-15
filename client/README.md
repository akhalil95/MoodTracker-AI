# MoodTracker AI

![React](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-blue)
![Material UI](https://img.shields.io/badge/UI-Material%20UI-blueviolet)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-green)
![Python](https://img.shields.io/badge/Language-Python-yellow)
![Machine Learning](https://img.shields.io/badge/ML-KMeans-orange)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

A full-stack web application that helps users track daily habits and discover how they impact mood, powered by AI insights.

---

## 🚀 Features

- **Daily Habit Logging** – Track sleep, steps, workouts, caffeine, meals, work hours, screen time, and mood.
- **Beautiful UI** – Built with Material UI for a clean, modern, and responsive design.
- **AI Analysis** – Uses k-means clustering to find correlations between habits and mood.
- **REST API** – FastAPI backend for handling entries, analytics, and ML retraining.
- **Data Persistence** – SQLite database for storing user entries.
- **Cross-Origin Ready** – Configured with CORS for smooth frontend-backend integration.

---

## 🛠 Tech Stack

**Frontend**

- React (TypeScript)
- Material UI
- Axios

**Backend**

- Python
- FastAPI
- scikit-learn
- SQLite
- Pydantic

---

## 📸 Screenshots

---

## ⚡ Getting Started

### Prerequisites

- Node.js >= 18
- Python >= 3.9
- pip
- virtualenv

---

### 1️⃣ Clone the repo

- install all dependencies
- client: npm run dev
- server: .venv\Scripts\Activate
  uvicorn app.main:app --reload
