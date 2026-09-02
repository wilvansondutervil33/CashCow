set -e

echo "== Robopulse Setup =="

cd backend

if [ ! -d ".venv"]; then
    echo "Create Virtual Envionmrnt..."
    python -m venv .venv

fi

