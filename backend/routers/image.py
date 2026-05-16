import io
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from PIL import Image

router = APIRouter()

SUPPORTED_FORMATS = {"jpeg", "jpg", "png", "webp", "gif", "bmp"}


def _load_image(file: UploadFile) -> Image.Image:
    ext = (file.filename or "").rsplit(".", 1)[-1].lower()
    if ext not in SUPPORTED_FORMATS:
        raise HTTPException(400, f"Unsupported format: {ext}")
    return Image.open(io.BytesIO(file.file.read()))


def _stream(buf: io.BytesIO, media_type: str, filename: str) -> StreamingResponse:
    buf.seek(0)
    return StreamingResponse(
        buf,
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post("/compress")
async def compress_image(
    file: UploadFile = File(...),
    quality: int = Form(80),
    target_kb: int = Form(0),
):
    img = _load_image(file)
    if img.mode in ("RGBA", "P"):
        img = img.convert("RGB")

    buf = io.BytesIO()

    if target_kb > 0:
        # Binary search for quality that hits target size
        lo, hi = 10, 95
        while lo < hi - 1:
            mid = (lo + hi) // 2
            buf = io.BytesIO()
            img.save(buf, format="JPEG", quality=mid, optimize=True)
            if buf.tell() <= target_kb * 1024:
                lo = mid
            else:
                hi = mid
        quality = lo
        buf = io.BytesIO()

    img.save(buf, format="JPEG", quality=quality, optimize=True)
    stem = (file.filename or "image").rsplit(".", 1)[0]
    return _stream(buf, "image/jpeg", f"{stem}_compressed.jpg")


@router.post("/resize")
async def resize_image(
    file: UploadFile = File(...),
    width: int = Form(0),
    height: int = Form(0),
    keep_ratio: bool = Form(True),
):
    img = _load_image(file)
    orig_w, orig_h = img.size

    if width == 0 and height == 0:
        raise HTTPException(400, "Provide at least width or height")

    if keep_ratio:
        if width and not height:
            height = int(orig_h * width / orig_w)
        elif height and not width:
            width = int(orig_w * height / orig_h)

    img = img.resize((width, height), Image.LANCZOS)
    buf = io.BytesIO()
    fmt = (file.filename or "x.jpg").rsplit(".", 1)[-1].upper()
    fmt = "JPEG" if fmt in ("JPG",) else fmt
    img.save(buf, format=fmt)
    stem = (file.filename or "image").rsplit(".", 1)[0]
    return _stream(buf, f"image/{fmt.lower()}", f"{stem}_resized.{fmt.lower()}")


@router.post("/convert")
async def convert_image(
    file: UploadFile = File(...),
    to_format: str = Form("png"),
):
    to_format = to_format.lower().strip(".")
    if to_format not in SUPPORTED_FORMATS:
        raise HTTPException(400, f"Unsupported output format: {to_format}")

    img = _load_image(file)
    save_fmt = "JPEG" if to_format in ("jpg", "jpeg") else to_format.upper()

    if save_fmt == "JPEG" and img.mode in ("RGBA", "P"):
        img = img.convert("RGB")

    buf = io.BytesIO()
    img.save(buf, format=save_fmt)
    stem = (file.filename or "image").rsplit(".", 1)[0]
    out_ext = "jpg" if to_format in ("jpg", "jpeg") else to_format
    return _stream(buf, f"image/{out_ext}", f"{stem}.{out_ext}")


@router.post("/passport")
async def passport_photo(
    file: UploadFile = File(...),
    preset: str = Form("35x45"),
    dpi: int = Form(300),
):
    # preset = "WxH" in mm
    presets = {
        "35x45": (35, 45),   # India passport / most visas
        "51x51": (51, 51),   # US passport
        "40x40": (40, 40),   # UK passport
        "35x35": (35, 35),   # Schengen
    }
    dims_mm = presets.get(preset, (35, 45))
    px_w = int(dims_mm[0] / 25.4 * dpi)
    px_h = int(dims_mm[1] / 25.4 * dpi)

    img = _load_image(file)
    if img.mode in ("RGBA", "P"):
        img = img.convert("RGB")

    # Centre-crop to target aspect ratio before resizing
    target_ratio = px_w / px_h
    src_w, src_h = img.size
    src_ratio = src_w / src_h

    if src_ratio > target_ratio:
        new_w = int(src_h * target_ratio)
        left = (src_w - new_w) // 2
        img = img.crop((left, 0, left + new_w, src_h))
    else:
        new_h = int(src_w / target_ratio)
        top = (src_h - new_h) // 2
        img = img.crop((0, top, src_w, top + new_h))

    img = img.resize((px_w, px_h), Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=95, dpi=(dpi, dpi))
    return _stream(buf, "image/jpeg", f"passport_{preset}mm_{dpi}dpi.jpg")
