import os

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError
from fastapi.middleware.cors import CORSMiddleware
from app.routes import atm, auth, branch, call, diagnostic, business

FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "http://localhost:5173")
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

app.add_middleware(
    CORSMiddleware,
    allow_origins= [FRONTEND_ORIGIN],
    allow_credentials= True,
    allow_methods=["*"],
    allow_headers=["*"]
)
#include the /atm router in the FastAPI application. This means that all routes defined
app.include_router(atm.router)
app.include_router(branch.router)
app.include_router(call.router)
app.include_router(diagnostic.router)
app.include_router(auth.router) 
app.include_router(business.router) 

#A simple health check endpoint to verify that the API is running.
@app.get("/health", tags=["health"])
async def health_check() -> dict[str, str]:
    return {"status": "ok"}

##Endpoint to check the version number
@app.get("/version", tags=["health"])
async def version() -> dict[str, str]:
    return {"version": app.version}


##BEGIN EXCEPTIONS

#This exception handles when our database constraint (specifically, our battery_level not being between 0 and 100)
@app.exception_handler(IntegrityError)
async def integrity_error_handler(request: Request, exc: IntegrityError) -> JSONResponse:
    return JSONResponse(
        status_code=409,
        content={"detail": "A database constraint was violated (e.g. a duplicate value)"},
    )

#this is a catch-all exception handler so that ANY unexpected failur (bugs or unknown conditions) returns a
#constant JSON response
@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error has occured."},
    )