import requests
import os
import json
from dotenv import load_dotenv

load_dotenv()

APOLLO_API_KEY = os.getenv("APOLLO_API_KEY")

def enrich_lead_with_apollo(domain):
    """
    Uses Apollo.io People Search/Enrichment API to find contact details for a domain.
    """
    if not APOLLO_API_KEY:
        return {"error": "Apollo API Key not configured"}

    url = "https://api.apollo.io/v1/people/match"
    
    # We try to find the person with titles like "Owner", "Founder", "CEO", "Marketing Manager"
    payload = {
        "api_key": APOLLO_API_KEY,
        "domain": domain,
        "reveal_personal_emails": True
    }
    
    headers = {
        "Cache-Control": "no-cache",
        "Content-Type": "application/json"
    }

    print(f"🕵️  Enriching domain: {domain} via Apollo...")
    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        
        person = data.get("person", {})
        if not person:
            return {"status": "not_found", "message": "No specific contact found for this domain"}
            
        return {
            "status": "success",
            "owner_name": f"{person.get('first_name', '')} {person.get('last_name', '')}".strip(),
            "owner_email": person.get("email", "Not revealed"),
            "owner_title": person.get("title", "Unknown"),
            "linkedin_url": person.get("linkedin_url", ""),
            "apollo_id": person.get("id", "")
        }
    except Exception as e:
        print(f"❌ Apollo error: {str(e)}")
        return {"error": str(e)}

if __name__ == "__main__":
    # Test enrichment
    result = enrich_lead_with_apollo("microsoft.com")
    print(json.dumps(result, indent=2))
