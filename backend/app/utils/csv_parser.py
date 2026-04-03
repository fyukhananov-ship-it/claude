"""CSV parsing utilities for terminal uploads."""
import csv
import io


def parse_terminals_csv(content: str) -> list[dict]:
    """Parse terminal CSV. Expected columns: terminal_id, mcc (optional)."""
    reader = csv.DictReader(io.StringIO(content))
    terminals = []
    for row in reader:
        tid = row.get("terminal_id", "").strip()
        if not tid:
            continue
        terminals.append({
            "terminal_id": tid,
            "mcc": row.get("mcc", "").strip() or None,
        })
    return terminals
