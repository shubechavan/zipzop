import io
import subprocess
import tempfile
import os
from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from docx import Document

router = APIRouter()


def _stream(buf: io.BytesIO, media_type: str, filename: str) -> StreamingResponse:
    buf.seek(0)
    return StreamingResponse(
        buf,
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post("/to-text")
async def word_to_text(file: UploadFile = File(...)):
    data = await file.read()
    doc = Document(io.BytesIO(data))
    text = "\n".join(p.text for p in doc.paragraphs)
    buf = io.BytesIO(text.encode("utf-8"))
    stem = (file.filename or "file").rsplit(".", 1)[0]
    return _stream(buf, "text/plain", f"{stem}.txt")


@router.post("/to-pdf")
async def word_to_pdf(file: UploadFile = File(...)):
    """Converts DOCX to PDF using LibreOffice (must be installed)."""
    data = await file.read()
    stem = (file.filename or "file").rsplit(".", 1)[0]

    with tempfile.TemporaryDirectory() as tmpdir:
        in_path = os.path.join(tmpdir, f"{stem}.docx")
        out_path = os.path.join(tmpdir, f"{stem}.pdf")

        with open(in_path, "wb") as f:
            f.write(data)

        result = subprocess.run(
            ["libreoffice", "--headless", "--convert-to", "pdf", "--outdir", tmpdir, in_path],
            capture_output=True,
            timeout=60,
        )

        if result.returncode != 0 or not os.path.exists(out_path):
            raise HTTPException(500, "LibreOffice conversion failed. Ensure LibreOffice is installed.")

        with open(out_path, "rb") as f:
            pdf_bytes = f.read()

    buf = io.BytesIO(pdf_bytes)
    return _stream(buf, "application/pdf", f"{stem}.pdf")
