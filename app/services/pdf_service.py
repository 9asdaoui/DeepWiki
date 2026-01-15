from langchain_community.document_loaders import PyPDFLoader
from io import BytesIO
import tempfile
import os

class PDFService:
    @staticmethod
    def extract_text_from_pdf(file_content: bytes) -> str:
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
            tmp_file.write(file_content)
            tmp_file_path = tmp_file.name
        
        try:
            loader = PyPDFLoader(tmp_file_path)
            pages = loader.load()
            text = "\n\n".join([page.page_content for page in pages])
            return text
        finally:
            if os.path.exists(tmp_file_path):
                os.unlink(tmp_file_path)

pdf_service = PDFService()
