from datetime import datetime
import sys

def validate_date_string(date_str):
    formats = [
        "%Y-%m-%d",
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d %H:%M:%S.%f"
    ]
    
    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt)
        except ValueError:
            continue
    return None

def alert(message):
    BOLD_RED = "\033[1;31m"
    RESET = "\033[0m"
    
    lines = message.splitlines()
    max_len = max(len(line) for line in lines)
    border = "!" * (max_len + 6)    
    output = [f"\n{BOLD_RED}{border}"]
    
    for line in lines:
        output.append(f"!! {line.ljust(max_len)} !!")
    output.append(f"{border}{RESET}\n")
    
    sys.stderr.write("\n".join(output))
    sys.exit(1)