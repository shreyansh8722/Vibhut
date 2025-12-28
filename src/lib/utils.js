// src/lib/utils.js

// SETTINGS CHANGED:
// maxWidth: 1000 (Perfect for Zoom & Retina screens, but much smaller than 1200)
// quality: 0.8 (Very High Quality, virtually lossless to human eye)
export const compressImage = async (file, maxWidth = 1000, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const elem = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Resize logic: Maintain aspect ratio
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        elem.width = width;
        elem.height = height;
        const ctx = elem.getContext('2d');
        
        // Critical for Quality: Use High Quality Smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP
        ctx.canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas is empty'));
              return;
            }
            
            // Debugging: Check your Console when uploading to see the magic!
            const originalSize = (file.size / 1024).toFixed(2);
            const newSize = (blob.size / 1024).toFixed(2);
            console.log(`✨ Optimized: ${originalSize}KB -> ${newSize}KB (Quality: ${quality})`);

            const newFile = new File(
              [blob], 
              file.name.replace(/\.[^/.]+$/, "").replace(/\s+/g, '_') + ".webp", 
              {
                type: 'image/webp',
                lastModified: Date.now(),
              }
            );
            resolve(newFile);
          },
          'image/webp',
          quality
        );
      };
      reader.onerror = (error) => reject(error);
    };
  });
};

export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN').format(price);
};