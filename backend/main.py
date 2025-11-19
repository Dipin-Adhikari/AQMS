# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import schemas, crud, database


app = FastAPI()

# CORS
origins = [
    "http://localhost:3000",
    "https://your-frontend.onrender.com"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB startup / shutdown
@app.on_event("startup")
async def startup_event():
    await database.connect()

@app.on_event("shutdown")
async def shutdown_event():
    await database.close()

# ESP32 POST
@app.post("/api/data", response_model=schemas.AQMSFullDataResponse)
async def upload_full_data(data: schemas.AQMSFullDataCreate):
    return await crud.create_full_data(data)

# Frontend GET
@app.get("/api/data", response_model=list[schemas.AQMSFullDataResponse])
async def get_full_data():
    return await crud.get_all_full_data()
