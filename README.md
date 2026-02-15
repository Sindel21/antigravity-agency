# Antigravity Agency - Lead Processor

Tento nástroj automatizuje zpracování leadů pro akvizici B2B klientů.

## Struktura
- `processor.py`: Hlavní skript s logikou (kvalifikace, jazykové mutace, šablony).
- `leads_sample.json`: Vstupní data (auditované weby).

## Jak skript spustit

Skript spustíte pomocí standardního Pythonu 3:

```bash
python3 /Users/jansindelovsky/.gemini/antigravity/scratch/antigravity-agency/processor.py
```

## Výstup
Skript vygeneruje JSON pole, kde každý záznam obsahuje:
- `status`: `ready_to_send` nebo `skip`.
- `subject`: Předmět e-mailu.
- `email_body`: Kompletní text e-mailu.
- `phone_number`: Telefonní číslo firmy.
- `reasoning`: Zdůvodnění zvoleného postupu.
