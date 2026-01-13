import wikipedia
import requests
import urllib.parse
import re

class IngestionService:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "WikiSmartEdu/1.0 (contact: oussamaqasdaoui@gmail.com)"
        })
        wikipedia.requests = self.session

    def parse_wiki_url(self, url: str):

        parsed_url = urllib.parse.urlparse(url)
        

        domain_parts = parsed_url.netloc.split('.')
        lang_code = domain_parts[0] if len(domain_parts) > 1 else "en"

        path_parts = parsed_url.path.split('/')
        article_id = path_parts[-1] if path_parts[-1] else path_parts[-2]
        clean_title = article_id.replace('_', ' ')

        return lang_code, clean_title

    def fetch_wikipedia_data(self, url: str):

        lang, title = self.parse_wiki_url(url)
        

        wikipedia.set_lang(lang)
        
        try:
            page = wikipedia.page(title, auto_suggest=False)
            
            sections_dict = self.segment_content(page.content)
            
            return {
                "title": page.title,
                "language": lang, 
                "url": url,
                "sections": sections_dict
            }
        except wikipedia.exceptions.DisambiguationError as e:
            return {"error": "Ambiguous title", "options": e.options[:5]}
        except wikipedia.exceptions.PageError:
            return {"error": f"Article not found in language '{lang}'"}
        except Exception as e:
            return {"error": str(e)}

    def segment_content(self, raw_text: str) -> dict:
        sections = re.split(r'\n==+\s*(.*?)\s*==+\n', raw_text)
        segmented_data = {"Introduction": sections[0].strip()}
        for i in range(1, len(sections), 2):
            title, content = sections[i].strip(), sections[i+1].strip()
            if title.lower() not in ["references", "external links", "see also", "further reading", "notes"]:
                segmented_data[title] = content
        return segmented_data

ingestion_service = IngestionService()