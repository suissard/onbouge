export interface ImageProcessOptions {
    targetWidth: number;
    targetHeight: number;
    quality?: number; // 0 to 1
    zoom?: number;    // 1.0 means fit cover
    offsetX?: number; // 0 to 1, default 0.5 (center)
    offsetY?: number; // 0 to 1, default 0.5 (center)
}

/**
 * Processes an image file: resizes it and compresses it with fixed dimensions and zoom.
 * @param file The original image file
 * @param options Processing options (targetWidth, targetHeight, quality, zoom)
 * @returns A promise that resolves to the processed Blob
 */
export async function processImage(file: File, options: ImageProcessOptions): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = options.targetWidth;
                canvas.height = options.targetHeight;
                
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject(new Error('Canvas context not available'));

                // Calculate base scale to achieve "cover" fit
                const scaleX = options.targetWidth / img.width;
                const scaleY = options.targetHeight / img.height;
                const minScale = Math.max(scaleX, scaleY);
                
                // Final scale includes zoom (1.0 = baseline cover)
                const finalScale = minScale * (options.zoom || 1);
                
                // Dimensions of the source area we will extract
                const sourceWidth = options.targetWidth / finalScale;
                const sourceHeight = options.targetHeight / finalScale;
                
                // Position of the source area (default to center)
                const offsetX = options.offsetX !== undefined ? options.offsetX : 0.5;
                const offsetY = options.offsetY !== undefined ? options.offsetY : 0.5;
                
                const sx = (img.width - sourceWidth) * offsetX;
                const sy = (img.height - sourceHeight) * offsetY;

                // Draw the scaled and cropped image
                ctx.drawImage(img, sx, sy, sourceWidth, sourceHeight, 0, 0, options.targetWidth, options.targetHeight);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Canvas toBlob failed'));
                        }
                    },
                    'image/jpeg',
                    options.quality || 0.8
                );
            };
            img.onerror = () => reject(new Error('Image load failed'));
            img.src = e.target?.result as string;
        };
        reader.onerror = () => reject(new Error('File reader failed'));
        reader.readAsDataURL(file);
    });
}
