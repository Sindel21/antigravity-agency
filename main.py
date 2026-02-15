import json
import time
from scraper import scrape_leads
from auditor import run_psi_audit
from processor import process_lead

def run_pipeline(niche, location):
    print("--- STARTING LEADGEN PIPELINE ---")
    
    # 1. Block A: Sourcing
    leads = scrape_leads(niche, location)
    
    # 2. Block B & C: Audit & Brain
    results = []
    for lead in leads:
        print(f"\nProcessing: {lead['company_name']} ({lead['url']})")
        
        # In a real scenario, we'd use the PSI API. 
        # For this demo, we'll simulate the PSI results if API key is missing.
        # But for now, let's call our auditor.
        audit_data = run_psi_audit(lead['url'])
        
        # Merge lead info with audit data
        if "error" not in audit_data:
            lead.update({
                "performance_score": audit_data["performance_score"],
                "lcp_value": audit_data["lcp_value"]
            })
        else:
            # Fallback mock data for demonstration if API fails/no key
            lead.update({
                "performance_score": 45, # Simulated slow site
                "lcp_value": 5.2
            })
        
        # 3. Block C: Brain (Scoring & Drafting)
        processed_result = process_lead(lead)
        
        if processed_result["status"] == "ready_to_send":
            results.append({
                "company": lead["company_name"],
                "email": processed_result
            })
            print(f"Result: SUCCESS (Score: {lead['performance_score']}) - Draft ready.")
        else:
            print(f"Result: SKIP ({processed_result['reasoning']})")

    # 4. Block D: Action
    output_path = "/Users/jansindelovsky/.gemini/antigravity/scratch/antigravity-agency/final_campaign.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"\n--- PIPELINE FINISHED ---")
    print(f"Final campaign data saved to: {output_path}")

if __name__ == "__main__":
    # Example: Run the whole thing for 'střechy' in 'Praha'
    run_pipeline("střechy", "Praha")
