export interface ProcessedImageResult {
  dataUrl: string;
  fileName: string;
  width: number;
  height: number;
  sizeKb: number;
}

const MAX_DATA_URL_CHARS = 180000;

export async function processImageFile(file: File): Promise<ProcessedImageResult> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select a valid image file (JPG, PNG, or WebP).');
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Unable to read the selected image file.'));
      el.src = objectUrl;
    });

    const maxDim = 720;
    let targetW = img.naturalWidth || 720;
    let targetH = img.naturalHeight || 540;

    if (targetW > maxDim || targetH > maxDim) {
      const ratio = Math.min(maxDim / targetW, maxDim / targetH);
      targetW = Math.max(1, Math.round(targetW * ratio));
      targetH = Math.max(1, Math.round(targetH * ratio));
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Image processing canvas is unavailable in this browser.');
    }

    ctx.fillStyle = '#FAF6EA';
    ctx.fillRect(0, 0, targetW, targetH);
    ctx.drawImage(img, 0, 0, targetW, targetH);

    // Prefer compact WebP for sub-second loading; fallback to JPEG if unsupported
    let mime = 'image/webp';
    let quality = 0.78;
    let dataUrl = canvas.toDataURL(mime, quality);
    if (!dataUrl.startsWith('data:image/webp')) {
      mime = 'image/jpeg';
      dataUrl = canvas.toDataURL(mime, quality);
    }

    while (dataUrl.length > MAX_DATA_URL_CHARS && quality > 0.38) {
      quality -= 0.12;
      dataUrl = canvas.toDataURL(mime, quality);
    }

    if (dataUrl.length > MAX_DATA_URL_CHARS) {
      const scale = 0.72;
      canvas.width = Math.max(1, Math.round(targetW * scale));
      canvas.height = Math.max(1, Math.round(targetH * scale));
      const ctx2 = canvas.getContext('2d');
      if (ctx2) {
        ctx2.fillStyle = '#FAF6EA';
        ctx2.fillRect(0, 0, canvas.width, canvas.height);
        ctx2.drawImage(img, 0, 0, canvas.width, canvas.height);
        dataUrl = canvas.toDataURL(mime, 0.7);
        targetW = canvas.width;
        targetH = canvas.height;
      }
    }

    if (dataUrl.length > MAX_DATA_URL_CHARS) {
      throw new Error('Image is too large even after compression. Please use a smaller image.');
    }

    return {
      dataUrl,
      fileName: file.name,
      width: targetW,
      height: targetH,
      sizeKb: Math.max(1, Math.round((dataUrl.length * 0.75) / 1024)),
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
