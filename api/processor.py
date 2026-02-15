import json
import sys
from analyst import scrape_homepage_content


def process_lead(lead, deep_analysis=False):
    performance_score = lead.get("performance_score", 0)
    location = lead.get("location", "USA")
    lcp_value = lead.get("lcp_value", 0)
    company_name = lead.get("company_name", "your company")
    phone_number = lead.get("phone_number", "unknown")
    url = lead.get("url", "")
    
    website_context = ""
    if deep_analysis and url:
        website_context = scrape_homepage_content(url)


    
    # Updated Scoring Model
    # Proceed only if: Performance Score < 60 OR LCP > 4s
    if performance_score >= 60 and lcp_value <= 4:
        return {
            "status": "skip",
            "reasoning": f"Web is in good shape (Score: {performance_score}, LCP: {lcp_value}s). Not a priority lead."
        }


    # Language and Tone
    is_us = location.upper() == "USA"
    
    if is_us:
        subject = f"Technical health of {company_name} - identified issues"
        body = (
            f"Hello,\n\n"
            f"While analyzing companies in your industry, I came across your website {lead.get('url')}. "
            "As a web development specialist, I noticed that you are struggling with a critical slowdown "
            f"on mobile devices—specifically, the main content takes {lcp_value}s to load.\n\n"
            f"According to current Google data, your performance score is only {performance_score}/100. "
            "In practice, this means Google may be pushing you down below competitors who have optimized websites.\n\n"
            "I have prepared a brief list of 3 things that would immediately double your speed. "
            "If you'd be interested, I'd be happy to send them over or have a quick chat on the phone.\n\n"
            "Best regards,\n"
            "Antigravity Agency"
        )
        reasoning = "Senior Consultant tone (US). Specific data points (PSI) and 'fear of loss' argument."
    else:
        subject = f"Technický stav webu {company_name} – nalezené chyby"
        body = (
            f"Dobrý den,\n\n"
            f"při analýze firem v oboru jsem narazil na váš web {lead.get('url')}. "
            "Jako specialistu na webový vývoj mě zaujalo, že se potýkáte s poměrně kritickým zpomalením "
            f"na mobilních zařízeních – konkrétně se hlavní obsah načítá {lcp_value} s.\n\n"
            f"Podle aktuálních dat Googlu je vaše skóre výkonu pouze {performance_score}/100. "
            "To v praxi znamená, že vás Google může odsouvat na nižší pozice za konkurenci, která má web optimalizovaný.\n\n"
            "Připravil jsem pro vás stručný seznam 3 věcí, které by vaši rychlost okamžitě zdvojnásobily. "
            "Pokud by vás to zajímalo, rád vám je pošlu nebo se o nich krátce pobavíme po telefonu.\n\n"
            "S pozdravem,\n"
            "Antigravity Agency"
        )
        reasoning = "Seniorní obchodní konzultant (CZ). Důraz na konkrétní data a ztrátu pozic."


    return {
        "status": "ready_to_send",
        "subject": subject,
        "email_body": body,
        "phone_number": phone_number,
        "reasoning": reasoning
    }


def main():
    try:
        with open("/Users/jansindelovsky/.gemini/antigravity/scratch/antigravity-agency/leads_sample.json", "r") as f:
            leads = json.load(f)
    except FileNotFoundError:
        print("Sample file not found.")
        return

    results = []
    for lead in leads:
        results.append({
            "lead_name": lead.get("company_name"),
            "result": process_lead(lead)
        })

    print(json.dumps(results, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()
