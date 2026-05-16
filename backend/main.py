from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import image, pdf, word

app = FastAPI(title="ZipZop API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://zipzop.tools"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(image.router, prefix="/api/image", tags=["image"])
app.include_router(pdf.router, prefix="/api/pdf", tags=["pdf"])
app.include_router(word.router, prefix="/api/word", tags=["word"])

@app.get("/health")
def health():
    return {"status": "ok"}
