from datetime import datetime
import sys
from flask import current_app
from flask_jwt_extended import get_jwt
import re

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

def get_current_user_id():
    if current_app.config.get("SINGLE_USER_MODE").lower() in ["true", "y"]:
        return 1
    return get_jwt().get("id")

def is_valid_email(email):
    # This regex checks for basic structure: characters + @ + characters + . + characters
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(email_regex, email) is not None