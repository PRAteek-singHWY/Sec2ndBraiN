# 🧠 Second2ndBrain -> RAG based AI-Powered Content Retrieval and Sharing App

## 📘 Overview

This project is a **personal AI-based content management and retrieval platform** built with **TypeScript** and **Next.js**, powered by **Jina AI embeddings**, **Pinecone vector search**, and **Groq/LLaMA 3.1** for intelligent query optimization.

Users can log in, add various types of content (text, YouTube links, Twitter posts), and perform **semantic searches** over their personal data. Each search uses **RAG (Retrieval-Augmented Generation)** to fetch relevant information and generate contextual responses.

---

## 🧩 Key Features

| Feature                  | Description                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------ |
| **Authentication (JWT)** | Secure login, signup, and logout system using JSON Web Tokens.                                   |
| **Content Management**   | Users can add, update, and delete notes, YouTube links, or Twitter links.                        |
| **Profile Management**   | Users upload profile photos via **Cloudinary**.                                                  |
| **AI Search System**     | RAG-based search using **Jina AI embeddings**, **Pinecone**, and **Groq/LLaMA 3.1**.             |
| **Optimized Querying**   | LLaMA refines user queries before vector search to improve accuracy.                             |
| **Semantic Retrieval**   | Pinecone index retrieves top matching results based on context similarity.                       |
| **Profile Sharing**      | Users can share their profiles through a secure link, visible only to logged-in users.           |
| **Access Revocation**    | Shared profile links can be revoked by the creator at any time, immediately invalidating access. |
| **TypeScript Safety**    | End-to-end TypeScript ensures scalability, type safety, and maintainability.                     |

---

## 🏗️ Tech Stack

| Layer               | Technology                     |
| ------------------- | ------------------------------ |
| **Frontend**        | Next.js + TypeScript           |
| **Backend**         | Node.js + Express (TypeScript) |
| **Database**        | MongoDB (NoSQL)                |
| **Authentication**  | JWT (JSON Web Tokens)          |
| **File Storage**    | Cloudinary                     |
| **Vector Database** | Pinecone                       |
| **Embeddings**      | Jina AI Text Embedding API     |
| **LLM**             | LLaMA 3.1 via Groq API         |
| **Deployment**      | Vercel / Render / AWS          |

---

## 🔐 Authentication Flow

1. **User Registration/Login**

   * Credentials are submitted via the frontend.
   * JWT is generated upon successful authentication.
   * Token is stored securely on the client (HTTP-only cookie or local storage).

2. **Token Validation**

   * Protected routes require a valid JWT.
   * Middleware checks the token before accessing protected resources.

---

## 🗂️ Data Flow & Architecture

### 1. User Adds Content

When a user adds content (text or link):

```ts
{
  userId: string,
  content: string,
  type: 'text' | 'youtube' | 'twitter',
  createdAt: Date
}
```

* Content is stored in **MongoDB**.
* Text content is embedded via **Jina AI**:

  ```ts
  const embedding = await jina.embedText(content);
  ```
* The resulting vector is saved in **Pinecone**, linked with metadata:

  ```ts
  pinecone.upsert({
    id: contentId,
    values: embedding,
    metadata: { userId, content }
  });
  ```

---

### 2. Semantic Search (RAG Process)

1. **User Query → LLaMA 3.1 (Groq)**

   * LLaMA refines or rephrases the query.
   * Example: `"find javascript video" → "show videos related to JavaScript tutorials"`

2. **Vector Search (Pinecone)**

   * Jina AI converts the refined query into a vector.
   * Pinecone searches the user’s namespace for similar embeddings.

3. **Contextual Answer Generation**

   * Top results from Pinecone are merged into a context string.
   * LLaMA generates a natural-language response using that context.

```ts
const context = results.matches.map(r => r.metadata.content).join("\n");
const aiResponse = await llama.generate(`Answer using context:\n${context}\nUser query: ${searchQuery}`);
```

---

## 🔍 Pinecone Indexing & Namespaces

Each user’s data is isolated in Pinecone under their **namespace = userId**.

### Create Index

```ts
const index = pinecone.Index('user-content');
await index.upsert({
  namespace: userId,
  vectors: [{ id: contentId, values: embedding, metadata }]
});
```

### Query Index

```ts
const queryEmbedding = await jina.embedText(searchQuery);
const results = await pinecone.query({
  namespace: userId,
  vector: queryEmbedding,
  topK: 5,
  includeMetadata: true,
});
```

---

## 👥 Profile Sharing System

### 1. Profile Link Generation

* Each user can generate a **shareable link** to their profile, e.g.:
  `https://app.com/profile/<userId>?token=<uniqueShareToken>`
* The share token is stored in MongoDB with an expiry or revocation field.

### 2. Controlled Access

* Any **signed-in** user can open a shared profile link.
* Middleware checks:

  * Valid JWT
  * Valid, active share token

### 3. Revoking Access

* The profile owner can revoke the link, updating the token’s `isActive = false` in MongoDB.
* Once revoked, the link becomes invalid immediately.

---

## ☁️ Cloudinary Integration

Profile uploads are handled via **Cloudinary**:

```ts
const result = await cloudinary.uploader.upload(filePath, {
  folder: 'user_profiles',
});
await User.updateOne({ _id: userId }, { profileUrl: result.secure_url });
```

---

## ⚙️ Environment Variables

```
MONGO_URI=
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
PINECONE_API_KEY=
JINA_API_KEY=
GROQ_API_KEY=
```

---

## 📁 Folder Structure

```
src/
 ├── controllers/
 │    ├── authController.ts
 │    ├── contentController.ts
 │    ├── searchController.ts
 │    └── shareController.ts
 ├── services/
 │    ├── jinaService.ts
 │    ├── pineconeService.ts
 │    ├── groqService.ts
 │    └── cloudinaryService.ts
 ├── middleware/
 │    └── authMiddleware.ts
 │    └── shareAccessMiddleware.ts
 ├── models/
 │    ├── user.ts
 │    ├── content.ts
 │    └── shareToken.ts
 ├── routes/
 │    ├── authRoutes.ts
 │    ├── contentRoutes.ts
 │    ├── searchRoutes.ts
 │    └── shareRoutes.ts
 ├── utils/
 │    └── jwt.ts
 │    └── responseHandler.ts
 └── index.ts
```

---

## 🚀 Future Enhancements

* Role-based permissions (Admin/User)
* Multi-modal embeddings (text + image)
* Auto-summarization of added content
* Chat-like query interface
* Real-time revocation alerts
* Analytics dashboard (content engagement, query history)

---

## 🧾 License

This project is licensed under the **MIT License**.

---

## 💡 Author

**Developed by:** Prateek Singh
**Tech Stack:** TypeScript | Next.js | MongoDB | Pinecone | Groq | Jina AI | Cloudinary
