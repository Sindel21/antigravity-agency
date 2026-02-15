import json
import time
import subprocess
import os

# Comprehensive list of Czech regional and district towns (77 total)
CZECH_DISTRICT_TOWNS = [
    "Praha", "Brno", "Ostrava", "Plzeň", "Liberec", "Olomouc", "České Budějovice", "Hradec Králové",
    "Ústí nad Labem", "Pardubice", "Zlín", "Havířov", "Kladno", "Most", "Opava", "Frýdek-Místek",
    "Karviná", "Jihlava", "Teplice", "Děčín", "Karlovy Vary", "Chomutov", "Jablonec nad Nisou",
    "Mladá Boleslav", "Prostějov", "Třebíč", "Česká Lípa", "Třinec", "Tábor", "Znojmo",
    "Příbram", "Cheb", "Orlová", "Kolín", "Trutnov", "Písek", "Kroměříž", "Šumperk", "Vsetín",
    "Valašské Meziříčí", "Litvínov", "Uherské Hradiště", "Hodonín", "Břeclav", "Český Těšín",
    "Krnov", "Litoměřice", "Sokolov", "Nový Jičín", "Havlíčkův Brod", "Chrudim", "Strakonice",
    "Kopřivnice", "Klatovy", "Žďár nad Sázavou", "Bohumín", "Jindřichův Hradec", "Vyškov", 
    "Blansko", "Kutná Hora", "Náchod", "Jičín", "Louny", "Hranice", "Otrokovice", "Beroun",
    "Mělník", "Slaný", "Brandýs nad Labem-Stará Boleslav", "Uherský Brod", "Pelhřimov",
    "Rožnov pod Radhoštěm", "Kadaň", "Rumburk", "Svitavy", "Ostrov", "Benešov"
]

NICHES = ["zubaři", "střechy", "truhláři", "kadeřnictví", "elektrikáři", "instalatéři", "autoservis", "reality"]

LEADS_FILE = "/Users/jansindelovsky/.gemini/antigravity/scratch/antigravity-agency/leads_discovered.json"
SCRAPER_PATH = "/Users/jansindelovsky/.gemini/antigravity/scratch/antigravity-agency/scraper.py"
STATUS_FILE = "/Users/jansindelovsky/.gemini/antigravity/scratch/antigravity-agency/harvester_status.json"

def update_status(message, current_step, total_steps):
    status = {
        "status": "running",
        "message": message,
        "progress": round((current_step / total_steps) * 100),
        "last_update": time.time(),
        "step": current_step,
        "total": total_steps
    }
    with open(STATUS_FILE, "w") as f:
        json.dump(status, f)

def run_harvester():
    print(f"🚀 Launching COMPREHENSIVE NATIONWIDE Harvester...")
    
    # Create a queue of all combinations
    work_queue = []
    for niche in NICHES:
        for city in CZECH_DISTRICT_TOWNS:
            work_queue.append({"niche": niche, "location": city})
            
    total = len(work_queue)
    
    if not os.path.exists(LEADS_FILE):
        with open(LEADS_FILE, "w") as f:
            json.dump([], f)

    for i, target in enumerate(work_queue):
        msg = f"Hunting for {target['niche']} in {target['location']} ({i+1}/{total} tasks)"
        print(f"🕵️  {msg}")
        update_status(msg, i, total)
        
        try:
            # Run scraper for this combo
            subprocess.run([
                "python3", SCRAPER_PATH, 
                "--niche", target["niche"], 
                "--location", target["location"],
                "--limit", "15" # Lower limit per combo to cover more ground faster
            ], check=True)
            
        except Exception as e:
            print(f"❌ Error scraping {target['niche']} in {target['location']}: {str(e)}")
        
        time.sleep(1) # Small pause

    update_status("Total nationwide hunt completed!", total, total)
    time.sleep(10)
    if os.path.exists(STATUS_FILE):
        os.remove(STATUS_FILE)
    print("✅ Nationwide Harvester finished.")

if __name__ == "__main__":
    run_harvester()
