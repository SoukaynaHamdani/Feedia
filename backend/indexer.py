import os
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from drive_auth import get_drive_service
from dotenv import load_dotenv

load_dotenv()

def fetch_documents(service):
    """Fetch Google Docs from the Drive."""
    query = "mimeType='application/vnd.google-apps.document'"
    results = service.files().list(q=query, pageSize=20, fields="nextPageToken, files(id, name, webViewLink)").execute()
    return results.get('files', [])

def export_doc_as_text(service, file_id):
    """Export a Google Doc as plain text."""
    try:
        content = service.files().export(fileId=file_id, mimeType='text/plain').execute()
        return content.decode('utf-8')
    except Exception as e:
        print(f"Error exporting {file_id}: {e}")
        return ""

def index_documents():
    service = get_drive_service()
    files = fetch_documents(service)
    
    if not files:
        print("No documents found to index.")
        return
        
    print(f"Found {len(files)} documents. Fetching contents...")
    
    documents = []
    from langchain_core.documents import Document
    
    for f in files:
        print(f"Processing: {f['name']}")
        text = export_doc_as_text(service, f['id'])
        if text:
            doc = Document(page_content=text, metadata={"source": f['webViewLink'], "title": f['name']})
            documents.append(doc)
            
    if not documents:
        print("No content could be extracted.")
        return
        
    print("Splitting text into chunks...")
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    chunks = text_splitter.split_documents(documents)
    
    print(f"Created {len(chunks)} chunks. Indexing into ChromaDB...")
    
    print("Using local sentence-transformers for embeddings...")
    from langchain_community.embeddings import HuggingFaceEmbeddings
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        
    # We persist the database to disk
    db = Chroma.from_documents(chunks, embeddings, persist_directory="./chroma_db")
    db.persist()
    print("Indexing complete! Vector database saved to ./chroma_db")

if __name__ == "__main__":
    index_documents()