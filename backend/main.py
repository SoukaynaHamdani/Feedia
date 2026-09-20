import os
import warnings
from langchain_community.vectorstores import Chroma
from langchain_groq import ChatGroq
from dotenv import load_dotenv

warnings.filterwarnings("ignore")
load_dotenv()
load_dotenv("../.env")

def main():
    if not os.path.exists("./chroma_db_pdf"):
        print("Vector database not found. Please run indexer.py first.")
        return
        
    print("Loading local embeddings...")
    from langchain_community.embeddings import HuggingFaceEmbeddings
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

    db = Chroma(persist_directory="./chroma_db_pdf", embedding_function=embeddings)
    retriever = db.as_retriever(search_kwargs={"k": 3})
    
    if not os.environ.get("GROQ_API_KEY"):
        print("ERROR: GROQ_API_KEY is required for the Groq LLM. Please add it to a .env file.")
        print("Format of .env file: GROQ_API_KEY=your_api_key_here")
        return
        
    llm = ChatGroq(model="openai/gpt-oss-20b", temperature=0.2)
    
    def generate_plan(animal_info):
        animal = animal_info["animal"]
        duration = animal_info.get("duration", "1 day")
        # Query ChromaDB for specific livestock details
        q = f"nutrition hydration schedule recommendations for {animal} livestock"
        docs = retriever.invoke(q)
        context = "\n\n".join(d.page_content for d in docs)
        
        prompt = f'''
        You are an agricultural AI assistant specialized in semi-arid livestock systems.

Your task is to generate a practical livestock management plan STRICTLY based on the retrieved scientific and agricultural context.

IMPORTANT RULES:
- Use ONLY information explicitly supported by the retrieved context.
- Never invent feed quantities, prices, production gains, or health claims.
- If exact values are unavailable, clearly state that the data is not specified in the documents.
- Prefer realistic and conservative recommendations.
- Adapt recommendations to semi-arid Moroccan livestock conditions when possible.
- Do not generate veterinary or medical treatment advice unless explicitly supported in the retrieved documents.
- If the user's request lacks important livestock parameters (weight, age, climate, production goal, season), state the limitations of the recommendation.
- - Mention the source documents used for major recommendations.

Generate a structured report including:
1. Feeding recommendations
2. Water recommendations
3. Grazing/rest schedule
4. Environmental considerations
5. Intended management objective
6. Source references

If pricing information exists in the retrieved context, include estimated costs.
Otherwise, state that local market prices are required.

Context:
{context}
'''
        ans = llm.invoke(prompt)
        return {"result": ans.content, "source_documents": docs}
    
    print("\n" + "="*50)
    print("Livestock Concrete Plan Generator is ready!")
    print("Type 'quit' or 'exit' to stop.")
    print("="*50 + "\n")
    
    while True:
        animal = input("\nEnter livestock type and amount (e.g. '10 Sheep', '1 Cow'): ")
        if animal.lower() in ['quit', 'exit']:
            break
            
        if not animal.strip():
            continue
            
        duration = input("Enter duration for the plan (e.g. '1 day', '1 week'): ")
        if duration.lower() in ['quit', 'exit']:
            break
            
        print("\nThinking and analyzing scientific PDFs...")
        try:
            response = generate_plan({"animal": animal, "duration": duration})
            
            print("\n" + "-"*50)
            print(f"LIVESTOCK PLAN:\n{response['result']}")
            print("-"*50)
            
            print("\nSOURCES USED:")
            sources = response.get("source_documents", [])
            seen_urls = set()
            for doc in sources:
                url = doc.metadata.get("source", "Unknown URL")
                title = doc.metadata.get("title", "Unknown Title")
                if url not in seen_urls:
                    print(f"- {title}: {url}")
                    seen_urls.add(url)
                    
        except Exception as e:
            print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()