import requests
import os
import json
from bs4 import BeautifulSoup

def detect_google_ads(url):
    """
    Scans the website content to detect if Google Ads (GTM, AdWords, gtag) are present.
    """
    if not url:
        return False
        
    if not url.startswith('http'):
        url = 'https://' + url
        
    print(f"🕵️  Detecting Google Ads for: {url}...")
    try:
        response = requests.get(url, timeout=10, headers={'User-Agent': 'AntigravityAuditBot/1.0'})
        response.raise_for_status()
        
        content = response.text.lower()
        
        # Look for common Google Ads / Tracking indicators
        ads_indicators = [
            'googletagmanager.com',
            'googletagservices.com',
            'gtm-',
            'aw-',
            'ads.google.com',
            '_googwcm'
        ]
        
        found = any(indicator in content for indicator in ads_indicators)
        
        # Also check for specific script tags
        soup = BeautifulSoup(response.text, 'html.parser')
        scripts = soup.find_all('script', src=True)
        for s in scripts:
            src = s['src'].lower()
            if any(ind in src for ind in ads_indicators):
                found = True
                break
                
        return found
    except Exception as e:
        print(f"❌ Detection error: {str(e)}")
        return False

if __name__ == "__main__":
    # Test
    print(f"Ads detected: {detect_google_ads('https://www.alza.cz')}")
