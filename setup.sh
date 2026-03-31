#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

echo "--- BookLogr Setup ---"

echo "Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed.${NC}"
    echo "Please install Docker first: https://docs.docker.com/get-docker/"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites met.${NC}"

echo "Downloading configuration..."
curl -sL -o docker-compose.yml "https://raw.githubusercontent.com/Mozzo1000/booklogr/main/docker-compose.yml"

if [ ! -f .env ]; then
    echo -e "\n${BLUE}How would you like to run Booklogr?${NC}"
    echo "1) Single User Mode (No login required - best for local usage)"
    echo "2) Multi-User Mode   (Standard login with email/password - best for shared servers)"
    
    while true; do
        read -p "Select an option [1 or 2]: " mode_choice </dev/tty
        case $mode_choice in
            1)
                {
                    echo "SINGLE_USER_MODE=true"
                    echo "BL_SINGLE_USER_MODE=true"
                } > .env
                echo -e "${GREEN}✅ Configured for Single User Mode.${NC}"
                break
                ;;
            2)
                SEC_KEY=$(openssl rand -hex 32)
                echo "SINGLE_USER_MODE=false" > .env
                echo "AUTH_SECRET_KEY=$SEC_KEY" >> .env
                echo -e "${GREEN}✅ Configured for Multi-User Mode (Secret Key generated).${NC}"
                break
                ;;
            *)
                echo -e "${RED}Invalid selection. Please enter 1 or 2.${NC}"
                ;;
        esac
    done
else
    echo -e "\n${BLUE}ℹ .env already exists. Skipping configuration.${NC}"
fi

echo "Starting Booklogr containers..."
if docker compose up -d; then
    echo -e "\n${GREEN}Success! Booklogr is running at http://localhost:5150${NC}"
else
    echo -e "\n${RED}Failed to start containers. Check 'docker compose logs' for details.${NC}"
    exit 1
fi
