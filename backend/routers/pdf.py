import io
import zipfile
from typing import List
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
import pikepdf
import fitz  # PyMuPDF

router = APIRouter()


def _stream(buf: io.BytesIO, media_type: str, filename: str) -> StreamingResponse:
    buf.seek(0)
    return StreamingResponse(
        buf,
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post("/compress")
async def compress_pdf(
    file: UploadFile = File(...),
    level: str = Form("medium"),
):
    data = await file.read()
    pdf = pikepdf.open(io.BytesIO(data))

    compress_args: dict = {}
    if level == "low":
        compress_args = {"compress_streams": True, "object_stream_mode": pikepdf.ObjectStreamMode.generate}
    elif level == "medium":
        compress_args = {
            "compress_streams": True,
            "object_stream_mode": pikepdf.ObjectStreamMode.generate,
            "recompress_flate": True,
        }
    elif level == "high":
        compress_args = {
            "compress_streams": True,
            "object_stream_mode": pikepdf.ObjectStreamMode.generate,
            "recompress_flate": True,
        }
        # Remove metadata and flatten
        with pdf.open_metadata() as meta:
            for key in list(meta.keys()):
                del meta[key]

    buf = io.BytesIO()
    pdf.save(buf, **compress_args)
    stem = (file.filename or "file").rsplit(".", 1)[0]
    return _stream(buf, "application/pdf", f"{stem}_compressed.pdf")


@router.post("/merge")
async def merge_pdfs(files: List[UploadFile] = File(...)):
    if len(files) < 2:
        raise HTTPException(400, "Upload at least 2 PDF files")

    merged = pikepdf.Pdf.new()
    for f in files:
        data = await f.read()
        src = pikepdf.open(io.BytesIO(data))
        merged.pages.extend(src.pages)

    buf = io.BytesIO()
    merged.save(buf)
    return _stream(buf, "application/pdf", "merged.pdf")


@router.post("/split")
async def split_pdf(
    file: UploadFile = File(...),
    mode: str = Form("all"),     # "all" | "range"
    pages: str = Form(""),       # e.g. "1-3,5,7-9"
):
    data = await file.read()
    src = pikepdf.open(io.BytesIO(data))
    total = len(src.pages)

    def parse_ranges(spec: str) -> List[int]:
        result = []
        for part in spec.split(","):
            part = part.strip()
            if "-" in part:
                a, b = part.split("-", 1)
                result.extend(range(int(a) - 1, min(int(b), total)))
            elif part.isdigit():
                idx = int(part) - 1
                if 0 <= idx < total:
                    result.append(idx)
        return sorted(set(result))

    zip_buf = io.BytesIO()
    stem = (file.filename or "file").rsplit(".", 1)[0]

    with zipfile.ZipFile(zip_buf, "w", zipfile.ZIP_DEFLATED) as zf:
        if mode == "range" and pages:
            indices = parse_ranges(pages)
            out = pikepdf.Pdf.new()
            for i in indices:
                out.pages.append(src.pages[i])
            page_buf = io.BytesIO()
            out.save(page_buf)
            zf.writestr(f"{stem}_pages_{pages.replace(',', '_')}.pdf", page_buf.getvalue())
        else:
            # One PDF per page
            for i, page in enumerate(src.pages):
                out = pikepdf.Pdf.new()
                out.pages.append(page)
                page_buf = io.BytesIO()
                out.save(page_buf)
                zf.writestr(f"{stem}_page_{i+1}.pdf", page_buf.getvalue())

    return _stream(zip_buf, "application/zip", f"{stem}_split.zip")


@router.post("/to-images")
async def pdf_to_images(
    file: UploadFile = File(...),
    dpi: int = Form(150),
):
    data = await file.read()
    doc = fitz.open(stream=data, filetype="pdf")
    stem = (file.filename or "file").rsplit(".", 1)[0]

    zip_buf = io.BytesIO()
    with zipfile.ZipFile(zip_buf, "w", zipfile.ZIP_DEFLATED) as zf:
        for i, page in enumerate(doc):
            mat = fitz.Matrix(dpi / 72, dpi / 72)
            pix = page.get_pixmap(matrix=mat)
            img_bytes = pix.tobytes("jpeg")
            zf.writestr(f"{stem}_page_{i+1}.jpg", img_bytes)

    return _stream(zip_buf, "application/zip", f"{stem}_images.zip")
