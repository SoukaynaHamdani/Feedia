import os
import json
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import base64
from dotenv import load_dotenv

# Load env variables (supporting both local and parent directories)
load_dotenv()
load_dotenv("../.env")

from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage

 

 
app = FastAPI(title="LivestockAI Backend API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize RAG components globally
print("Loading embeddings and vector DB...")
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
db = Chroma(persist_directory="./chroma_db_pdf", embedding_function=embeddings)
retriever = db.as_retriever(search_kwargs={"k": 3})

# Initialize LLM
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")

# Prefer Groq if available, fallback to Gemini
if GROQ_API_KEY:
    print("Using Groq (Llama-3.3) for AI generation...")
    llm = ChatGroq(model="openai/gpt-oss-20b", temperature=0.2, groq_api_key=GROQ_API_KEY)
elif GOOGLE_API_KEY:
    print("Using Google (Gemini) for AI generation...")
    llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=0.2)

else:
    print("Warning: No LLM API Key found!")
    llm = None

class ReportRequest(BaseModel):
    animalType: str
    animalBreed: str = ""
    herdSize: str
    age: str = ""
    location: str = ""
    season: str = ""
    budget: str = ""
    language: str = "en"

class ChatRequest(BaseModel):
    query: str
    language: str = "en"

@app.post("/api/generate-report")
async def generate_report(request: ReportRequest):
    if not llm:
        raise HTTPException(status_code=500, detail="Groq API Key missing.")

    # 1. Use the vector database to find context about this animal
    query_str = f"operational livestock management feeding tables daily schedules water intake grazing schedules for {request.animalType} {request.animalBreed} {request.age} {request.season} {request.location}"
    docs = retriever.invoke(query_str)
    context = "\n\n".join(d.page_content for d in docs)
    
    # 2. Build the System Prompt for JSON generation based on language
    system_prompt = """You are an expert agricultural AI assistant and livestock nutritionist. 
You must always reply with valid JSON only.
CRITICAL RULES:
1. NEVER hallucinate or invent data. Use ONLY information explicitly supported by the provided context.
2. If exact feeding quantities or prices are unavailable in the context, explicitly state that in the JSON string (e.g. "Data unavailable in veterinary database").
3. Your plan must be extremely concrete and scientifically precise based on the context."""
    
    language_instruction = ""
    if request.language == 'fr':
        system_prompt += "\nYou speak French. All text values in the JSON MUST be written in French. Keep the JSON keys in English."
        language_instruction = "\nIMPORTANT: Translate all explanations, tips, and summaries into French. Keep the JSON keys in English."
    elif request.language == 'darija':
        system_prompt += "\nYou speak Moroccan Darija (الدارجة المغربية). All text values in the JSON MUST be written in Moroccan Darija using Arabic script. DO NOT use formal Classical Arabic. Use common Moroccan vocabulary (e.g. 'علف', 'ما', 'خروف')."
        language_instruction = "\nIMPORTANT: Translate all explanations, tips, and summaries into local Moroccan Darija. Keep the JSON keys in English."
    elif request.language == 'tamazight':
        system_prompt += "\nYou speak Tamazight (ⵜⴰⵎⴰⵣⵉⵖⵜ). All text values in the JSON MUST be written in Tamazight using Latin transliteration or Tifinagh. Keep the sentences short and clear to avoid repetition."
        language_instruction = "\nIMPORTANT: Translate all explanations, tips, and summaries into Tamazight. Keep the JSON keys in English."

    prompt_content = f"""
    Generate a highly structured, concrete, and scientifically grounded daily nutrition and hydration plan.
    Animal Type: {request.animalType}
    Breed: {request.animalBreed}
    Herd Size: {request.herdSize}
    Age/Stage: {request.age}
    Location: {request.location}
    Season: {request.season}
    Budget: {request.budget}
    {language_instruction}
    
    Here is the authoritative context retrieved from our specialized veterinary database:
    ---
    {context}
    ---
    
    Please provide the response ONLY as a valid JSON object with the exact following structure. 
    Ensure all text fields contain highly concrete, schedule-based, and scientific details derived strictly from the context.
    {{
    "overview": {{
        "animal": "animal name",
        "size": "{request.herdSize}",
        "summary": "1-2 sentence extremely precise summary factoring in age, location, and season"
      }},
      "dailyNeeds": {{
        "water": "Exact total liters string (or 'Data unavailable')",
        "food": "Exact total kg string (or 'Data unavailable')",
        "waterPerHead": "L/head string",
        "foodPerHead": "kg/head string"
      }},
      "nutritionalBreakdown": [
        {{ "name": "Alfalfa/Roughage", "value": 50 }},
        {{ "name": "Grains/Concentrates", "value": 30 }},
        {{ "name": "Proteins", "value": 15 }},
        {{ "name": "Vitamins/Minerals", "value": 5 }}
      ],
      "schedule": [
        {{ "time": "Morning", "action": "Highly specific, concrete morning feeding and watering action based on context" }},
        {{ "time": "Midday", "action": "Highly specific midday management action" }},
        {{ "time": "Evening", "action": "Highly specific evening action" }}
      ],
      "recommendations": {{
        "localFood": "Concrete recommendation about local food sourcing based on location {request.location} and context",
        "healthWarnings": "Important health warning for {request.season} based on context",
        "costSaving": "Cost saving strategy considering budget {request.budget} based on context",
        "productivity": "Limitations note if data is missing, OR a concrete productivity tip"
      }}
    }}
    """
    
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=prompt_content)
    ]
    
    try:
        response = llm.invoke(messages)
        
        # Robust JSON extraction
        raw_content = response.content.strip()
        
        import re
        # Find the first { and the last }
        match = re.search(r'\{.*\}', raw_content, re.DOTALL)
        if match:
            json_str = match.group(0)
            parsed_json = json.loads(json_str)
            return parsed_json
        else:
            raise ValueError("No valid JSON object found in response.")
            
    except Exception as e:
        print(f"Error generating report: {str(e)}")
        print(f"Raw response was: {response.content if 'response' in locals() else 'None'}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat")
async def chat(request: ChatRequest):
    if not llm:
        raise HTTPException(status_code=500, detail="Groq API Key missing.")

    docs = retriever.invoke(request.query)
    context = "\n\n".join(d.page_content for d in docs)
    
    lang_prompt = ""
    if request.language == "fr":
        lang_prompt = "IMPORTANT: You MUST answer in French. Use clear, natural French suited for agricultural guidance."
    elif request.language == "darija":
        lang_prompt = "IMPORTANT: You MUST answer in Moroccan Darija (الدارجة المغربية) using Arabic script. DO NOT use formal Classical Arabic. Use common Moroccan vocabulary (e.g. 'علف', 'ما', 'خروف')."
    elif request.language == "tamazight":
        lang_prompt = "IMPORTANT: You MUST answer in Tamazight (ⵜⴰⵎⴰⵣⵉⵖⵜ) using Latin transliteration or Tifinagh. Keep your sentences short and natural to avoid repetition."
        
    prompt = f"""You are a helpful agricultural AI assistant. Keep your answer brief and conversational.
{lang_prompt}

Context:
{context}

Question: {request.query}
Answer:"""
    
    try:
        ans = llm.invoke(prompt)
        return {"result": ans.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/voice-chat")
async def voice_chat(audio: UploadFile = File(...), language: str = Form("en")):
    hf_token = os.environ.get("HF_TOKEN")
    if not hf_token:
        raise HTTPException(status_code=500, detail="HF_TOKEN not found in .env. HuggingFace API key is required for voice processing.")
        
    audio_bytes = await audio.read()
    
    # 1. ASR: use the Darija model for Arabic dialects and Whisper otherwise.
    headers = {
        "Authorization": f"Bearer {hf_token}",
        "Content-Type": audio.content_type or "audio/webm",
    }
    asr_models = (
        ["atlasia/molsot", "openai/whisper-large-v3"]
        if language in ["darija", "ar"]
        else ["openai/whisper-large-v3", "atlasia/molsot"]
    )

    try:
        transcribed_text = ""
        last_error = ""
        for asr_model in asr_models:
            asr_url = f"https://api-inference.huggingface.co/models/{asr_model}"
            response = requests.post(asr_url, headers=headers, data=audio_bytes, timeout=60)
            if response.status_code == 200:
                asr_result = response.json()
                transcribed_text = asr_result.get("text", "").strip()
                if transcribed_text:
                    break
            last_error = f"{asr_model}: {response.text[:300]}"

        if not transcribed_text:
            raise ValueError(f"Empty transcription ({last_error})")
    except Exception as e:
        print(f"ASR Error: {e}")
        raise HTTPException(status_code=502, detail="Speech recognition failed. Please speak closer to the microphone and try again.") from e
        
    # 2. RAG: Process text through Chatbot
    docs = retriever.invoke(transcribed_text)
    context = "\n\n".join(d.page_content for d in docs)
    
    lang_prompt = ""
    if language == "fr" or language == "fr-FR":
        lang_prompt = "IMPORTANT: You MUST answer in French. Use clear, natural French for agricultural advice."
    elif language == "darija" or language == "ar":
        lang_prompt = "IMPORTANT: You MUST answer in Moroccan Darija (الدارجة المغربية) using Arabic script. DO NOT use formal Classical Arabic. Use common Moroccan vocabulary (e.g. 'علف', 'ما', 'خروف')."
    elif language == "tamazight" or language == "tz":
        lang_prompt = "IMPORTANT: You MUST answer in Tamazight (ⵜⴰⵎⴰⵣⵉⵖⵜ) using Latin transliteration or Tifinagh. Keep your sentences short and natural to avoid repetition."
        
    prompt = f"""You are a helpful agricultural AI assistant. Keep your answer brief and conversational.
{lang_prompt}

Context:
{context}

User question (transcribed from audio): {transcribed_text}
Answer:"""
    
    try:
        ans = llm.invoke(prompt)
        ai_text = ans.content
    except Exception as e:
        print(f"LLM Error: {e}")
        ai_text = "Sorry, I had trouble processing your request."
        
    # 3. TTS: Text-to-Speech using facebook/mms-tts-ara (Arabic/Darija) or English
    tts_model = "facebook/mms-tts-ara" if language in ["darija", "tamazight"] else "facebook/mms-tts-eng"
    tts_url = f"https://api-inference.huggingface.co/models/{tts_model}"
    
    try:
        tts_response = requests.post(tts_url, headers=headers, json={"inputs": ai_text})
        if tts_response.status_code == 200:
            audio_base64 = base64.b64encode(tts_response.content).decode('utf-8')
        else:
            audio_base64 = None
    except Exception as e:
        print(f"TTS Error: {e}")
        audio_base64 = None
        
    return {
        "transcription": transcribed_text,
        "response": ai_text,
        "audio_base64": audio_base64
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)
