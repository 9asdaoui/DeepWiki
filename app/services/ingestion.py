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

    def get_article_id(self, url: str) -> str:
        """
        Parses the URL to get the article title (tag).
        Replaces underscores with spaces.
        """
        parsed_url = urllib.parse.urlparse(url)
        path_parts = parsed_url.path.split('/')
        article_id = path_parts[-1] if path_parts[-1] else path_parts[-2]
        return article_id.replace('_', ' ')

    def segment_content(self, raw_text: str) -> dict:
        """
        Segments the article using regex to find '== Section ==' titles.
        Returns a dictionary: { "Introduction": "...", "History": "...", ... }
        """

        sections = re.split(r'\n==+\s*(.*?)\s*==+\n', raw_text)
        
        segmented_data = {}
        
        segmented_data["Introduction"] = sections[0].strip()
        
        for i in range(1, len(sections), 2):
            title = sections[i].strip()
            content = sections[i+1].strip()
            
            if title.lower() not in ["references", "external links", "see also", "further reading", "notes"]:
                segmented_data[title] = content
                
        return segmented_data

    def fetch_wikipedia_data(self, url: str):
        """Main method to get and process data."""
        title = self.get_article_id(url)
        try:
            page = wikipedia.page(title, auto_suggest=False)
            
            sections_dict = self.segment_content(page.content)
            
            return {
                "title": page.title,
                "url": url,
                "sections": sections_dict
            }
        except wikipedia.exceptions.DisambiguationError as e:
            return {"error": "Ambiguous title", "options": e.options[:5]}
        except wikipedia.exceptions.PageError:
            return {"error": "Article not found"}
        except Exception as e:
            return {"error": str(e)}

ingestion_service = IngestionService()