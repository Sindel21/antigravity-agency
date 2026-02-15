import requests
from bs4 import BeautifulSoup
import os

def scrape_homepage_content(url):
    """
    Scrapes the text content of a website's homepage to help GPT-4o 
    personalize the email.
    """
    if not url.startswith('http'):
        url = 'https://' + url
        
    print(f"🔍 Analyzing content for {url}...")
    try:
        response = requests.get(url, timeout=10, headers={'User-Agent': 'AntigravityAuditBot/1.0'})
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.extract()

        # Get text and clean it up
        text = soup.get_text()
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = '\n'.join(chunk for chunk in chunks if chunk)
        
        # Return first 2000 characters to stay within context limits
        return text[:2000]
    except Exception as e:
        return f"Could not scrape content: {str(e)}"

if __name__ == "__main__":
    # Test with a known site
    content = scrape_homepage_content("https://www.czechia.cz")
    print(f"Content length: {len(content)}")
    print(content[:500] + "...")
