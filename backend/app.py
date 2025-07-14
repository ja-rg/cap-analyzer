from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import tempfile
import os
from analizer import PcapAnalyzer

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    contents = await file.read()

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pcap") as temp:
        temp.write(contents)
        temp_path = temp.name

    try:
        analyzer = PcapAnalyzer(temp_path)
        analyzer.analyze()
        return analyzer.info
    finally:
        try:
            os.remove(temp_path)
        except Exception as e:
            print(f"Could not delete temp file: {e}")
