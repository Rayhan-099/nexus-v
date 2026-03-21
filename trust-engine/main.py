from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np

app = FastAPI(title="Trust Engine")

# Allow CORS for hackathon MVP
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "Trust Engine is running"}

@app.post("/validate-image")
async def validate_image(file: UploadFile = File(...)):
    try:
        # Read image to memory
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            return {"isValid": False, "reason": "Could not decode image"}

        # Quick Validation logic
        # 1. Blur detection (Laplacian variance)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        blur_val = cv2.Laplacian(gray, cv2.CV_64F).var()

        # 2. Brightness detection (mean brightness)
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        brightness = hsv[...,2].mean()

        is_valid = True
        reason = "Valid image"

        if blur_val < 50:  # Threshold for blurry
            is_valid = False
            reason = "Image is too blurry"
        elif brightness < 30: # Threshold for dark
            is_valid = False
            reason = "Image is too dark"

        return {
            "isValid": is_valid,
            "reason": reason,
            "metrics": {
                "blur_variance": float(blur_val),
                "brightness": float(brightness)
            }
        }
    except Exception as e:
        return {"isValid": False, "reason": str(e)}
