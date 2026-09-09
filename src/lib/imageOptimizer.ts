/**
 * Resizes and compresses image files on client-side before sending to backend.
 * Keeps resolution optimal for OCR (max 1600px) while reducing payload from ~10MB to ~250KB.
 * Prevents Railway container memory exhaustion (OOM) and gateway timeouts ("Application failed to respond").
 */
export async function optimizeImageForOCR(
  file: File,
  maxDimension = 1600,
  quality = 0.85
): Promise<File> {
  // If file is already small (< 400KB), return as is
  if (file.size < 400 * 1024 && (file.type === "image/jpeg" || file.type === "image/png")) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        return resolve(file);
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return resolve(file);
          }
          const optimizedFile = new File(
            [blob],
            file.name.replace(/\.[^/.]+$/, "") + ".jpg",
            { type: "image/jpeg" }
          );
          resolve(optimizedFile);
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });
}
