from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from io import BytesIO
import textwrap

class ExportService:
    @staticmethod
    def export_to_txt(title: str, content: str) -> BytesIO:
        buffer = BytesIO()
        text = f"Title: {title}\n\n{content}"
        buffer.write(text.encode('utf-8'))
        buffer.seek(0)
        return buffer

    @staticmethod
    def export_to_pdf(title: str, content: str) -> BytesIO:
        buffer = BytesIO()
        c = canvas.Canvas(buffer, pagesize=letter)
        width, height = letter
        
        c.setFont("Helvetica-Bold", 16)
        c.drawString(1*inch, height - 1*inch, title)
        
        c.setFont("Helvetica", 11)
        y_position = height - 1.5*inch
        
        wrapped_lines = []
        for paragraph in content.split('\n'):
            if paragraph.strip():
                wrapped_lines.extend(textwrap.wrap(paragraph, width=80))
                wrapped_lines.append('')
        
        for line in wrapped_lines:
            if y_position < 1*inch:
                c.showPage()
                c.setFont("Helvetica", 11)
                y_position = height - 1*inch
            
            c.drawString(1*inch, y_position, line)
            y_position -= 0.2*inch
        
        c.save()
        buffer.seek(0)
        return buffer

export_service = ExportService()
