# LivestockAI: Technical Architecture & AI Pipeline

This document outlines the technical architecture and AI pipeline driving the intelligent retrieval and generative reasoning capabilities of the LivestockAI project. By leveraging a Retrieval-Augmented Generation (RAG) architecture, LivestockAI is able to provide highly accurate, domain-specific answers grounded in specialized veterinary and agricultural documentation.

---

## 1. System Overview

LivestockAI bridges a modern React/Vite frontend with a highly specialized Python-based AI backend. The core intelligence relies on **Retrieval-Augmented Generation (RAG)**. Instead of relying solely on an LLM's pre-trained (and potentially hallucinated) knowledge, the system dynamically searches a local vector database of trusted agricultural/livestock documents and feeds that context directly to the LLM.

## 2. The AI Pipeline (Step-by-Step)

The AI pipeline is divided into two primary phases: **Ingestion (Offline)** and **Retrieval & Generation (Real-Time)**.

### Phase 1: Data Ingestion & Indexing
Before the AI can answer questions, it must first "read" and comprehend the specialized livestock documentation.

1. **Document Loading:** 
   The system uses `LangChain`'s document loaders (like `PyPDFDirectoryLoader`) to scan a local directory for raw veterinary and farming manuals in `.pdf` format.
2. **Semantic Chunking:** 
   Large documents are too big to feed into an LLM all at once. The `RecursiveCharacterTextSplitter` divides the text into smaller, overlapping chunks (e.g., 1000 characters with a 100-character overlap). The overlap ensures that sentences or concepts split across chunks do not lose their contextual meaning.
3. **Vector Embeddings Generation:** 
   Each text chunk is processed by a HuggingFace embedding model (`all-MiniLM-L6-v2`). This model translates the human-readable text into a high-dimensional mathematical vector that represents the *semantic meaning* of the text.
4. **Vector Storage:** 
   These vectors, along with metadata (like the source file name), are stored in **ChromaDB**, an open-source local vector database. 

### Phase 2: Real-Time Retrieval & Generation (RAG)
When a farmer or user asks a question via the LivestockAI dashboard, the following real-time pipeline is triggered:

1. **Query Embedding:** 
   The user's natural language question is immediately passed through the same HuggingFace `all-MiniLM-L6-v2` model to convert the question into a vector.
2. **Semantic Search:** 
   ChromaDB performs a rapid mathematical similarity search (e.g., Cosine Similarity) comparing the question's vector against all document vectors in the database. It retrieves the top `k=3` most highly relevant text chunks.
3. **Context Injection (Prompt Engineering):** 
   The retrieved chunks are injected into a strict system prompt. The prompt instructs the LLM: *"Use the following context to answer the question..."*
4. **LLM Synthesis:** 
   The augmented prompt is sent to **Google Gemini (gemini-2.5-flash)**. Because Gemini is provided with the exact paragraphs containing the answer, it synthesizes a highly accurate, contextual response and avoids hallucinations.
5. **Response Delivery:** 
   The final synthesized answer, along with the cited source documents (e.g., *Livestock_Nutrition_Guide.pdf*), is returned to the React frontend for the user to read or listen to via the TTS integration.

---

## 3. Technology Stack

- **Frontend:** React, Vite, TailwindCSS
- **AI Orchestration Framework:** LangChain / LangChain Community
- **LLM Engine:** Google Generative AI (`gemini-2.5-flash`)
- **Embedding Model:** HuggingFace `sentence-transformers` (`all-MiniLM-L6-v2`)
- **Vector Database:** Chroma (`chroma_db`)
- **Document Processing:** PyPDF
