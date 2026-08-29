from app.models import Atm, ATMStatus, CallStatus, CallPriority, Branch, DiagnosticReport, ServiceCall

from fastapi import FastAPI

from app.routes import atm, auth

#set up the FastAPI application with a title, description, and version. 
# This metadata is used in the automatically generated OpenAPI documentation.
app = FastAPI(
    title="CashCow Fleet Command Center",
    description=(
        "Meridian Trust Bank operates a network of retail branches, each equipped with a shared pool of ATMs used for "
        "customer cash withdrawals and deposits. Currently, cash reserve levels, maintenance schedules, technician "
        "assignments, and service records are scattered across paper logs and spreadsheet files kept at each branch."
    ),
    version="0.1.0",
)

#include the /robots router in the FastAPI application. This means that all routes defined
# in the robots router will be available under the /robots path.
app.include_router(atm.router)
#app.include_router(missions.router)
app.include_router(auth.router) 

#A simple health check endpoint to verify that the API is running.
@app.get("/health", tags=["health"])
async def health_check() -> dict[str, str]:
    return {"status": "ok"}