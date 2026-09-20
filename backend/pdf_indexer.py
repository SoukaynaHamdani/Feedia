import os
import shutil
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from dotenv import load_dotenv

load_dotenv()

def index_pdfs():
    pdf_dir = "./pdf"
    db_dir = "./chroma_db_pdf"
    
    if not os.path.exists(pdf_dir):
        print(f"Directory '{pdf_dir}' not found. Please create it and add PDF files.")
        return
        
    # Clear the old database folder if it exists to avoid duplicate chunks!
    if os.path.exists(db_dir):
        print(f"Clearing existing vector database at '{db_dir}' to prevent duplicate indexing...")
        try:
            shutil.rmtree(db_dir)
            print("Database cleared successfully!")
        except Exception as e:
            print(f"Warning: Could not clear database folder: {e}")
        
    print(f"Loading PDF files from {pdf_dir}...")
    # This will load all PDFs from the specified directory
    loader = PyPDFDirectoryLoader(pdf_dir)
    documents = loader.load()
    
    if not documents:
        print(f"No PDF files found in {pdf_dir}.")
        return
        
    print(f"Loaded {len(documents)} pages from PDFs. Splitting text into chunks...")
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    chunks = text_splitter.split_documents(documents)
    
    print(f"Created {len(chunks)} chunks. Indexing into ChromaDB...")
    
    print("Loading local sentence-transformers for embeddings...")
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        
    # Append the newly parsed chunks to the existing database that main.py uses
    db = Chroma.from_documents(chunks, embeddings, persist_directory="./chroma_db_pdf")
    db.persist()
    
    print("PDF indexing complete! Vector database updated at ./chroma_db")

if __name__ == "__main__":
    index_pdfs()
