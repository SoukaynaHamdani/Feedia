# 🌾 Feedia: Morocco's AI Livestock Hub

**Feedia** is an AI-powered agricultural platform designed specifically for rural environments to provide concrete, cost-saving, and scientifically accurate livestock nutrition schedules. Powered by Advanced RAG (Retrieval-Augmented Generation) running on scientific agricultural PDFs, it eliminates hallucinations and communicates effortlessly with farmers in **English, Moroccan Darija, and Tamazight**.

---

## 🌟 Key Features

### 1. Multi-Lingual & Highly Accessible UI
Feedia's interface is instantly translatable. It speaks the language of local farmers.
- **English UI**
  <br>![UI in English](images/ui%20eng.PNG)
- **Moroccan Darija UI**
  <br>![UI in Darija](images/ui%20darija.PNG)
- **Tamazight UI**
  <br>![UI in Tamazight](images/ui%20tamazight.PNG)

### 2. Language-Friendly Data Input
The user input fields automatically adapt to the chosen language, making it simple for anyone to enter livestock parameters like age, location, season, and budget.
- **English Support**: ![English Input](images/the%20user%20input%20of%20data%20is%20languge%20friendly%20support%20eng.PNG)
- **Darija Support**: ![Darija Input](images/the%20user%20input%20of%20data%20is%20languge%20friendly%20support%20darija.PNG)
- **Amazigh Support**: ![Tamazight Input](images/the%20user%20input%20of%20data%20is%20languge%20friendly%20support%20amazigh.PNG)

### 3. Strict, Concrete AI Feeding Programs
Our backend uses RAG on trusted agricultural documents to generate highly precise operational schedules.
- **The Smart Feeding Program**: Gives a concrete daily routine for feeding, watering, and resting.
  <br>![Smart Feeding Program](images/the%20smart%20feeding%20program.PNG)
- **Example Report**: Highly detailed outputs including cost-saving recommendations and charts.
  <br>![Example of Report](images/example%20of%20report.PNG)

### 4. Zero Hallucination (Strict Grounding)
The AI is heavily prompted to *never invent data*. If specific nutritional requirements do not exist within the embedded PDFs, the AI will explicitly state that the data is unavailable instead of guessing.
- ![No Hallucination](images/no%20hullacination%20if%20the%20data%20doesn't%20exist%20in%20the%20pdfs%20just%20he%20gonna%20say%20that.PNG)

### 5. Multi-Lingual AI Voice Assistant
Farmers can use our built-in voice assistant to talk to the AI using Automatic Speech Recognition (ASR) and Text-To-Speech (TTS). The assistant strictly replies using the local vocabulary of Darija or Tamazight.
- ![AI Voice Assistant](images/ai%20voice%20assistant.PNG)

---

## 🛠️ Technical Architecture

### PDF Embedding (RAG Pipeline)
We index veterinary and agricultural PDFs into a local **ChromaDB** vector database using Hugging Face embeddings. 
- ![Embedding the PDFs](images/embedding%20the%20pdfs.PNG)

### Terminal Validation
The RAG system can be rigorously tested and queried directly from the terminal to ensure scientific accuracy before ever generating reports in the web UI.
- ![RAG Terminal 1](images/rag%20in%20terminal%201.PNG)
- ![RAG Terminal 2](images/rag%20in%20terminal%202.PNG)
- ![RAG Terminal 3](images/rag%20in%20terminal%203.PNG)

### FastAPI Backend
Our robust Python FastAPI backend orchestrates the LLM (Groq Llama-3 / Google Gemini), the ChromaDB retrievers, and Hugging Face audio processing models.
- ![FastAPI Running](images/fast%20api%20running.PNG)

---

## 🧠 How the AI Engine Works — Deep Dive

### Phase A — Offline Knowledge Base Indexing

Before serving any user, run `pdf_indexer.py` once to build the vector database from scratch.

| Parameter | Value |
|---|---|
| PDF source files | 42 scientific & agricultural references |
| Loader | `PyPDFDirectoryLoader` (LangChain) |
| Chunk size | 1,000 characters |
| Chunk overlap | 100 characters |
| Embedding model | `all-MiniLM-L6-v2` (HuggingFace, runs 100% locally) |
| Vector dimensions | 384 per chunk |
| Vector database | ChromaDB (persisted to `./chroma_db_pdf/`) |
| Distance metric | L2 (Euclidean) |
| RAM during indexing | ~1.2 – 2.0 GB |
| Indexing time | 5 – 15 min (CPU dependent) |
| Disk footprint | 10 – 50 MB |

**Cleanup logic:** Before every re-index, the script detects and wipes the existing `./chroma_db_pdf/` directory using `shutil.rmtree()` — eliminating duplicate or stale embeddings entirely.

---

### Phase B — Real-Time Query Pipeline (1.5 – 2.5 sec end-to-end)

When a user submits parameters, the following chain executes:

**1. Query Engineering**

The backend constructs a precision-engineered retrieval query rather than using raw user input:

"operational livestock management feeding tables daily schedules water intake
grazing schedules for {animalType} {age} {season} {location}"

**2. Semantic Retrieval (k=3)**

The query is vectorized using `all-MiniLM-L6-v2` at runtime and matched against all stored vectors in ChromaDB. The **top 3 most semantically relevant chunks** are retrieved and merged:
```python
context = "\n\n".join(d.page_content for d in docs)
```

**3. Prompt Engineering — Anti-Hallucination Guardrails**

The system prompt explicitly forbids inventing data:

You are an expert agricultural AI assistant and livestock nutritionist.
You must always reply with valid JSON only.
CRITICAL RULES:

NEVER hallucinate or invent data. Use ONLY information explicitly
supported by the provided context.
If exact data is unavailable in the context, explicitly state:
"Data unavailable in veterinary database".
Your plan must be extremely concrete and scientifically precise.

Language is injected dynamically. Example for Tamazight:

You speak Tamazight (ⵜⴰⵎⴰⵣⵉⵖⵜ). All text values in the JSON MUST be written
in Tamazight. Keep JSON keys in English.

**4. LLM Generation — Dual Fallback for 100% Uptime**

| | Model | Speed |
|---|---|---|
| 🟢 Primary | Groq `llama-3.3-70b-versatile` | ~800 tokens/sec |
| 🟡 Fallback | Google `gemini-2.0-flash` | Auto-activated if Groq fails |

`temperature = 0.2` — enforces deterministic, factual JSON output.

---

### Phase C — FastAPI Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/generate-report` | Runs full RAG pipeline → returns structured JSON feeding plan |
| POST | `/api/chat` | Text Q&A with RAG context |
| POST | `/api/voice-chat` | Accepts `.wav` audio → returns text answer + base64 audio |

---

### Phase D — Voice & Accessibility Pipeline

**Speech-to-Text (ASR):**

| | Model | Specialization |
|---|---|---|
| 🟢 Primary | `atlasia/molsot` (HuggingFace) | Moroccan Darija & Arabic |
| 🟡 Fallback | `openai/whisper-large-v3` | General multilingual |

**Text-to-Speech (TTS):**
- `en` → `en-US` via native browser `SpeechSynthesis` API (zero cost, zero latency)
- `darija` / `tamazight` → `ar-MA` via browser engine + custom Google Translate TTS fallback (`speakWithCloudTTS`) for reliable Arabic dialect synthesis

---

### Performance Summary

| Metric | Value |
|---|---|
| Total query-to-answer latency | 1.5 – 2.5 seconds |
| RAG retrieval (k=3) | ~0.5 seconds |
| Groq inference | ~1.0 second |
| Chunks retrieved per query | 3 |
| LLM temperature | 0.2 |

---

### Security

- All API keys loaded server-side via `python-dotenv` → `os.environ.get()`
- Frontend keys accessed via Vite's `import.meta.env` at build time only
- `.env` is in `.gitignore` — never committed, never exposed to the client

## 🚀 Getting Started

### 1. Setup the Web Interface
```bash
npm install
npm run dev
```

### 2. Setup the AI Backend
```bash
cd backend
pip install -r requirements.txt
```

**Index your documents:**
```bash
python pdf_indexer.py
```

**Start the Server:**
```bash
python api.py
```

### 3. Environment Variables
Create a `.env` file in the root directory:
```env
# Required for RAG and Chat logic
GROQ_API_KEY=your_groq_key_here

# Required for Voice Assistant ASR/TTS
HF_TOKEN=your_huggingface_token_here
```
