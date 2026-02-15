import json
import os
import argparse
import time
from apify_client import ApifyClient
from dotenv import load_dotenv

load_dotenv()

APIFY_API_TOKEN = os.getenv("APIFY_API_TOKEN")
LEADS_FILE = "/Users/jansindelovsky/.gemini/antigravity/scratch/antigravity-agency/leads_discovered.json"

def save_leads_to_file(leads):
    """
    Merges new leads with existing ones and saves to LEADS_FILE.
    """
    existing_leads = []
    if os.path.exists(LEADS_FILE):
        try:
            with open(LEADS_FILE, "r", encoding="utf-8") as f:
                existing_leads = json.load(f)
        except:
            existing_leads = []
            
    existing_urls = {l.get("url") for l in existing_leads if l.get("url")}
    merged_leads = existing_leads
    
    added_count = 0
    for nl in leads:
        if nl.get("url") and nl.get("url") not in existing_urls:
            merged_leads.append(nl)
            existing_urls.add(nl.get("url"))
            added_count += 1

    with open(LEADS_FILE, "w", encoding="utf-8") as f:
        json.dump(merged_leads, f, indent=2, ensure_ascii=False)
    
    return added_count

def scrape_leads_apify(niche, location, limit=20):
    """
    Uses Apify Google Maps Scraper to find real business leads with incremental updates.
    """
    if not APIFY_API_TOKEN:
        print("❌ Error: APIFY_API_TOKEN not found in .env")
        return []

    client = ApifyClient(APIFY_API_TOKEN)
    run_input = {
        "searchStringsArray": [f"{niche} in {location}"],
        "maxItems": limit,
        "language": "en",
        "exportPlaceId": True
    }

    print(f"🚀 Launching streaming Apify scraper for '{niche}' in '{location}' (Limit: {limit})...")
    try:
        # Use start() to not block, allowing us to poll progress
        run = client.actor("compass/crawler-google-places").start(run_input=run_input)
        run_id = run["id"]
        dataset_id = run["defaultDatasetId"]

        all_processed_urls = set()
        
        while True:
            # Check run status
            status_obj = client.run(run_id).get()
            status = status_obj["status"]
            
            # Fetch items found so far
            dataset_items = client.dataset(dataset_id).list_items().items
            
            new_batch = []
            for item in dataset_items:
                url = item.get("website")
                if url and url not in all_processed_urls:
                    new_batch.append({
                        "company_name": item.get("title"),
                        "url": url,
                        "location": item.get("address"),
                        "phone_number": item.get("phone"),
                        "city": item.get("city"),
                        "category": item.get("categoryName")
                    })
                    all_processed_urls.add(url)
            
            if new_batch:
                added = save_leads_to_file(new_batch)
                print(f"📥 Found {len(new_batch)} new leads ({added} new to database). Total this run: {len(all_processed_urls)}")
            
            if status in ["SUCCEEDED", "FAILED", "ABORTED", "TIMED-OUT"]:
                break
                
            time.sleep(5) # Poll every 5 seconds
            
        print(f"✅ Scraping finished with status: {status}")
        return list(all_processed_urls) # Returning count/list not strictly needed but good for CLI
        
    except Exception as e:
        print(f"❌ Apify Scraper Error: {str(e)}")
        return []

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Streaming Lead Scraper via Apify')
    parser.add_argument('--niche', type=str, default='roofers', help='The niche to search for')
    parser.add_argument('--location', type=str, default='Prague', help='The location to search in')
    parser.add_argument('--limit', type=int, default=20, help='Max items to scrape')
    
    args = parser.parse_args()
    scrape_leads_apify(args.niche, args.location, args.limit)
