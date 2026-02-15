from fastapi import FastAPI, HTTPException, APIRouter, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import os
import subprocess
from .enricher import enrich_lead_with_apollo
from .ads_detector import detect_google_ads
from .auditor import run_performance_audit

app = FastAPI(title="Antigravity LeadGen CRM API")

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

LEADS_FILE = os.path.join(os.path.dirname(__file__), "leads_discovered.json")

class SearchRequest(BaseModel):
    niche: str
    location: str

# Define router FIRST
api_router = APIRouter(prefix="/api")

@api_router.get("/")
async def root():
    return {"message": "Antigravity CRM Backend is running"}

@api_router.get("/leads")
async def get_leads():
    if not os.path.exists(LEADS_FILE):
        return []
    with open(LEADS_FILE, "r") as f:
        try:
            return json.load(f)
        except:
            return []

@api_router.post("/discover")
async def discover_leads_api(request: SearchRequest):
    try:
        script_path = os.path.join(os.path.dirname(__file__), "scraper.py")
        subprocess.run([
            "python3", script_path, 
            "--niche", request.niche, 
            "--location", request.location,
            "--limit", "15" 
        ], check=True)
        
        if os.path.exists(LEADS_FILE):
            with open(LEADS_FILE, "r") as f:
                return json.load(f)
        return []
    except Exception as e:
        print(f"Discovery Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/audit/{lead_id}")
async def audit_lead(lead_id: int):
    try:
        if not os.path.exists(LEADS_FILE):
            raise HTTPException(status_code=404, detail="Leads file not found")
        with open(LEADS_FILE, "r") as f:
            leads = json.load(f)
        if lead_id >= len(leads):
            raise HTTPException(status_code=404, detail="Lead not found")
        lead = leads[lead_id]
        url = lead.get("url", "")
        has_ads = detect_google_ads(url)
        lead["uses_ads"] = has_ads
        audit_res = run_performance_audit(url)
        if audit_res:
            lead.update(audit_res)
            with open(LEADS_FILE, "w") as f:
                json.dump(leads, f, indent=2, ensure_ascii=False)
            return lead
        else:
            raise HTTPException(status_code=500, detail="Audit failed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/auto-pilot")
async def run_auto_pilot():
    try:
        script_path = os.path.join(os.path.dirname(__file__), "harvester.py")
        subprocess.Popen(["python3", script_path])
        return {"message": "Auto-Pilot Harvest started", "status": "processing"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/pilot-status")
async def get_pilot_status():
    status_file = os.path.join(os.path.dirname(__file__), "harvester_status.json")
    if not os.path.exists(status_file):
        return {"status": "idle"}
    with open(status_file, "r") as f:
        return json.load(f)

@api_router.post("/enrich/{lead_id}")
async def enrich_lead(lead_id: int):
    try:
        if not os.path.exists(LEADS_FILE):
            raise HTTPException(status_code=404, detail="Leads file not found")
        with open(LEADS_FILE, "r") as f:
            leads = json.load(f)
        if lead_id >= len(leads):
            raise HTTPException(status_code=404, detail="Lead not found")
        lead = leads[lead_id]
        url = lead.get("url", "")
        domain = url.replace("https://", "").replace("http://", "").split("/")[0]
        if domain.startswith("www."): domain = domain[4:]
        enrichment_data = enrich_lead_with_apollo(domain)
        if enrichment_data.get("status") == "success":
            lead.update({
                "owner_name": enrichment_data["owner_name"],
                "owner_email": enrichment_data["owner_email"],
                "owner_title": enrichment_data["owner_title"],
                "linkedin": enrichment_data["linkedin_url"]
            })
            with open(LEADS_FILE, "w") as f:
                json.dump(leads, f, indent=2, ensure_ascii=False)
            return lead
        else:
            return {"message": "Enrichment failed", "reason": enrichment_data.get("message", "Unknown error")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# IMPORTANT: Include router in the app
app.include_router(api_router)

# Also expose leads at root for some legacy fetch attempts
@app.get("/leads")
async def leads_root():
    return await get_leads()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
