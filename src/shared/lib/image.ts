/** Resizes an image file client-side (cover-crop to a square) and returns it as a JPEG data URL. */
export function resizeImageToDataUrl(file: File, size = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D context unavailable'));
        return;
      }

      const scale = Math.max(size / img.width, size / img.height);
      const drawWidth = img.width * scale;
      const drawHeight = img.height * scale;
      ctx.drawImage(img, (size - drawWidth) / 2, (size - drawHeight) / 2, drawWidth, drawHeight);

      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image'));
    };
    img.src = objectUrl;
  });
}

/** A crop region in the source image's own pixel coordinates — the shape react-easy-crop's
 * `onCropComplete` reports as its second (`croppedAreaPixels`) argument. */
export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}

/** Re-encodes `canvas` as a JPEG data URL, shrinking it — dimensions first (via a fresh smaller
 * canvas), then JPEG quality — until it's at or under `maxDataUrlLength`. Plain quality-0.85
 * resizing alone isn't enough to keep a big, detailed photo small: gallery/profile photos are
 * stored as base64 text in Postgres (see MAX_PHOTO_DATA_URL_LENGTH), so this is what actually
 * keeps "limite a 3 imagens" from still meaning "3 huge rows". */
function compressCanvasToDataUrl(
  canvas: HTMLCanvasElement,
  {
    maxDim = 1280,
    maxDataUrlLength = 500_000,
  }: { maxDim?: number; maxDataUrlLength?: number } = {},
): string {
  const scale = Math.min(1, maxDim / Math.max(canvas.width, canvas.height));
  const width = Math.max(1, Math.round(canvas.width * scale));
  const height = Math.max(1, Math.round(canvas.height * scale));

  const scaled = document.createElement('canvas');
  scaled.width = width;
  scaled.height = height;
  const ctx = scaled.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');
  ctx.drawImage(canvas, 0, 0, width, height);

  let quality = 0.85;
  let dataUrl = scaled.toDataURL('image/jpeg', quality);
  while (dataUrl.length > maxDataUrlLength && quality > 0.35) {
    quality -= 0.1;
    dataUrl = scaled.toDataURL('image/jpeg', quality);
  }
  // Still too big at the quality floor (a very large/busy source image) — shrink the dimensions
  // and try the whole thing again, down to a sane floor so this can't recurse forever.
  if (dataUrl.length > maxDataUrlLength && maxDim > 480) {
    return compressCanvasToDataUrl(canvas, {
      maxDim: Math.round(maxDim * 0.7),
      maxDataUrlLength,
    });
  }
  return dataUrl;
}

/** Crops `file` to `area` (in the source image's pixel coordinates) and compresses the result —
 * the single entry point the photo gallery uses once the user confirms a crop in
 * `ImageCropDialog`. Replaces the old resizeImageKeepingAspect, which only resized and had no
 * byte-size ceiling at all. */
export async function cropAndCompressImage(
  file: File,
  area: CropArea,
  opts?: { maxDim?: number; maxDataUrlLength?: number },
): Promise<string> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(area.width);
    canvas.height = Math.round(area.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable');
    ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, canvas.width, canvas.height);
    return compressCanvasToDataUrl(canvas, opts);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
