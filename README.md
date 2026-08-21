# ParentPal — AI-Powered Child Monitoring & Learning Platform

<p align="center">
  <strong>An intelligent full-stack platform that combines child-friendly learning, parental monitoring, Generative AI, and Retrieval-Augmented Generation.</strong>
</p>

<p align="center">
  <a href="https://parent-410mueyo9-lathasri.vercel.app">Live Demo</a> •
  <a href="https://github.com/lathasri-dev/ParentPal">Source Code</a>
</p>

---

## Overview

**ParentPal** is a full-stack AI-powered child monitoring and learning platform built using the **MERN stack**. The application provides separate experiences for parents and children, combining educational content with intelligent activity monitoring and AI-assisted interactions.

The platform uses **Google Gemini** for generative AI, **Pinecone** for vector-based retrieval, and a **Retrieval-Augmented Generation (RAG)** pipeline to provide context-aware AI responses.

### Core Objectives

* Provide children with a safe and engaging digital learning environment.
* Enable parents to monitor and understand children's activities.
* Use Generative AI to deliver interactive and personalized learning experiences.
* Ground AI responses using relevant retrieved context through RAG.

---

## Live Application

**Frontend:**
https://parent-410mueyo9-lathasri.vercel.app

**GitHub Repository:**
https://github.com/lathasri-dev/ParentPal

---

## Key Features

### Parent Mode

* Parent dashboard
* Child profile management
* Activity monitoring
* Activity feed and insights
* AI-assisted recommendations
* Child activity tracking

### Child Mode

* AI-powered educational assistant — **Professor Owl**
* Interactive educational games
* Stories and story-time activities
* Rhymes and songs
* Coloring activities
* Educational videos
* Child-friendly AI interaction

### AI & RAG

* Generative AI powered by Google Gemini
* Retrieval-Augmented Generation pipeline
* Pinecone vector search
* Context-aware response generation
* Separation of retrieval and generation layers
* Application-specific knowledge grounding

---

## System Architecture

```text
                         ParentPal
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
       React + Vite                 Node.js + Express
         Frontend                       Backend
              │                           │
              │                    ┌──────┼──────┐
              │                    │      │      │
              │                    ▼      ▼      ▼
              │                 MongoDB Gemini Pinecone
              │                    │      │      │
              │                    │      └──┬───┘
              │                    │         │
              │                    │      RAG Pipeline
              │                    │         │
              └────────────────────┴─────────┘
                         Application Layer
```

### AI Request Flow

```text
User Query
    │
    ▼
Frontend
    │
    ▼
Express API
    │
    ▼
RAG Service
    │
    ▼
Pinecone Vector Search
    │
    ▼
Relevant Context
    │
    ▼
Google Gemini
    │
    ▼
Context-Aware Response
    │
    ▼
Frontend
```

---

## Technology Stack

| Layer               | Technologies                             |
| ------------------- | ---------------------------------------- |
| Frontend            | React.js, Vite, JavaScript, Tailwind CSS |
| Backend             | Node.js, Express.js                      |
| Database            | MongoDB, MongoDB Atlas                   |
| AI                  | Google Gemini                            |
| RAG / Vector Search | Pinecone                                 |
| API                 | REST APIs                                |
| Deployment          | Vercel, Render                           |
| Development         | Git, GitHub, VS Code, npm                |

---

## Project Structure

```text
ParentPal/
│
├── client/
│   ├── public/
│   │   ├── assets/
│   │   ├── audio/
│   │   └── video/
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── child/
│   │   │   └── parent/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── config/
│   │   ├── db.js
│   │   └── pinecone.js
│   │
│   ├── models/
│   │   ├── ActivityLog.js
│   │   └── ChildProfile.js
│   │
│   ├── routes/
│   │   └── api.js
│   │
│   ├── services/
│   │   ├── aiService.js
│   │   └── ragService.js
│   │
│   ├── scripts/
│   ├── assets/
│   ├── server.js
│   └── package.json
│
├── .env.example
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites

Make sure the following are installed:

* Node.js 18+
* npm
* MongoDB / MongoDB Atlas account
* Google Gemini API key
* Pinecone account and API key

### Clone Repository

```bash
git clone https://github.com/lathasri-dev/ParentPal.git
cd ParentPal
```

### Backend Setup

```bash
cd server
npm install
```

Create a `.env` file using `server/.env.example`:

```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=your_pinecone_index
```

Start the backend:

```bash
npm start
```

### Frontend Setup

Open a new terminal:

```bash
cd client
npm install
npm run dev
```

The Vite development server will provide the local frontend URL.

---

## Environment & Security

Sensitive credentials are managed through environment variables.

The repository intentionally excludes:

```text
.env
server/.env
client/.env
```

Example configuration files are provided:

```text
.env.example
server/.env.example
```

**Never commit API keys, database credentials, or other secrets to the repository.**

---

## Deployment

### Frontend

The React/Vite frontend is deployed on **Vercel**.

**Live URL:**
https://parent-410mueyo9-lathasri.vercel.app

### Backend

The Node.js/Express backend is designed to run on **Render**.

Production environment variables are configured through the hosting platform rather than committed to GitHub.

### Infrastructure

```text
Vercel
  │
  │ HTTPS
  ▼
React Frontend
  │
  │ REST API
  ▼
Express Backend
  │
  ├── MongoDB Atlas
  ├── Google Gemini
  └── Pinecone
```

---

## AI Architecture

ParentPal uses a **Retrieval-Augmented Generation** approach rather than relying exclusively on direct LLM generation.

The pipeline follows:

```text
Query
  ↓
Embedding / Retrieval
  ↓
Pinecone Similarity Search
  ↓
Relevant Context
  ↓
Prompt Construction
  ↓
Google Gemini
  ↓
Generated Response
```

This architecture enables the application to incorporate relevant application-specific context before generating responses.

---

## Engineering Highlights

* Designed a modular MERN architecture separating frontend, backend, services, and data models.
* Implemented RESTful backend APIs using Express.js.
* Integrated MongoDB for persistent application data.
* Integrated Google Gemini for Generative AI functionality.
* Implemented Pinecone-based vector retrieval for RAG workflows.
* Built separate parent and child user experiences.
* Structured AI functionality into dedicated service layers.
* Configured environment-based secret management.
* Deployed the frontend using Vercel and prepared the backend for cloud deployment.

---

## Future Improvements

* Real-time parental notifications
* Advanced activity analytics
* Personalized learning recommendations
* Multi-child account management
* Voice-based AI interaction
* Improved authentication and authorization
* Expanded educational content
* AI response evaluation and source attribution
* Production-grade monitoring and observability

---

## Author

### Lathasri Kondaveeti

Computer Science & Engineering Student

**GitHub:**
https://github.com/lathasri-dev

---
