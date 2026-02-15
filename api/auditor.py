import requests
import os
import json
from dotenv import load_dotenv

load_dotenv()

PSI_API_KEY = os.getenv("GOOGLE_PSI_API_KEY")

def run_performance_audit(url):
    """
    Runs a real Google PageSpeed Insights audit for a given URL.
    Returns the performance score and LCP value.
    """
    if not url:
        return None
        
    if not url.startswith('http'):
        url = 'https://' + url

    if not PSI_API_KEY:
        print("⚠️  No PSI API Key found. Using mock data for audit.")
        import time
        time.sleep(1) # Simulate audit
        return {
            "performance_score": 45,
            "lcp_value": 4.2
        }

    print(f"🚀 Running PSI Audit for: {url}...")
    try:
        api_url = f"https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url={url}&key={PSI_API_KEY}&category=PERFORMANCE"
        response = requests.get(api_url, timeout=60)
        response.raise_for_status()
        data = response.json()
        
        lighthouse_result = data.get("lighthouseResult", {})
        performance_score = int(lighthouse_result.get("categories", {}).get("performance", {}).get("score", 0) * 100)
        
        # Get LCP (Largest Contentful Paint) from audits
        lcp_audit = lighthouse_result.get("audits", {}).get("largest-contentful-paint", {})
        lcp_value = round(lcp_audit.get("numericValue", 0) / 1000, 1) # in seconds
        
        return {
            "performance_score": performance_score,
            "lcp_value": lcp_value
        }
    except Exception as e:
        print(f"❌ PSI Audit error: {str(e)}")
        return None

if __name__ == "__main__":
    # Test
    res = run_performance_audit("https://www.google.com")
    print(res)
