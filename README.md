# Context_Aware_Corporate_Knowledge_Assistant (RAG) | Opsmind AI🧠💼
> **A Secure, Multi-Tenant Retrieval-Augmented Generation (RAG) Platform for Corporate Knowledge Management.**

OpsMind AI is an enterprise-grade Software-as-a-Service (SaaS) application built on the MERN stack. It bridges the gap between raw, unstructured corporate data (like HR manuals, technical documentations, and policy PDFs) and advanced conversational AI. 

By leveraging **Retrieval-Augmented Generation (RAG)**, the platform completely eliminates Large Language Model (LLM) hallucinations by grounding AI responses strictly within the context of mathematically retrieved document chunks.

---

## 🚀 Key Features

* **Hallucination-Free RAG Pipeline:** Generates source-backed answers strictly derived from your uploaded organizational documents using `gemini-1.5-flash`.
* **Semantic Vector Search:** Deep contextual querying powered by MongoDB Atlas Vector Search utilizing high-dimensional embeddings (384-dimensional arrays).
* **Cryptographic Multi-Tenancy:** Engineered with query-level database isolation (the "VIP Bouncer" pattern) ensuring one user can never search or access another user's private data.
* **Autonomous AI Diagnostics:** A dedicated, dark-mode Admin Core featuring live system telemetry visualizations (via Recharts) and an AI agent that self-evaluates platform health and detects information gaps.
* **Bento-Box Command Center:** A premium, fluid frontend navigation system built using Tailwind CSS glassmorphism and real-time interval polling.

---

## 🛠️ Tech Stack

* **Frontend:** React.js (Vite), Tailwind CSS, Recharts, Lucide React
* **Backend:** Node.js, Express.js, JWT (Stateless Authentication), Multer
* **Database:** MongoDB Atlas (NoSQL Document Store & Atlas Vector Search Engine)
* **AI Engine:** Google Generative AI SDK (Gemini API for text generation and high-efficiency embeddings)

---

## 📐 System Architecture Flow

1. **Ingestion:** User Uploads PDF ➡️ Node.js extracts raw text ➡️ Text is split into overlapping chunks via a sliding window algorithm.
2. **Vectorization:** Text chunks are transformed into 384-length vector arrays via the Gemini Embedding model.
3. **Storage:** Vectors are stamped with the sender's `userId` and safely indexed in MongoDB Atlas.
4. **Inference:** User asks a question ➡️ Query is vectorized ➡️ MongoDB executes a `$vectorSearch` filter restricted by the session's active `userId` (strict isolation) ➡️ Top 5 context blocks are appended to a custom LLM prompt ➡️ Gemini delivers an accurate, source-backed response.

---

## 🔧 Installation & Setup

### Prerequisites
* Node.js (v18+ recommended)
* MongoDB Atlas Cluster (with Vector Search Index enabled)
* Gemini API Key

### Backend Configuration
1. Navigate to the server folder and install dependencies:
```bash
   cd server
   npm install
```

2. Create a .env file in the root of the server directory and configure your keys:
```bash
Code snippet
   PORT=5000
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_jwt_signing_key
   GEMINI_API_KEY=your_google_gemini_api_key
```
3. Boot up the backend API container:
```Bash
   npm start
```

Frontend Configuration

1. Navigate to the client folder and install dependencies:
```Bash
   cd client
   npm install
```
2. Launch the Vite development server:
```Bash
   npm run dev
```

🔒 Security & Compliance Notice
OpsMind AI treats data privacy as a non-negotiable cornerstone. Cross-tenant data leaks are programmatically impossible due to aggregation pipeline sandboxing. All session handling relies on cryptographically signed, secure JSON Web Tokens.

📄 License
Distributed under the MIT License. See LICENSE for more information.
