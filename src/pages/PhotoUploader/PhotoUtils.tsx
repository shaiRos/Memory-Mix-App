
export function compressImage(photoBlob, maxWidth = 500, quality = 0.7) {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(photoBlob);
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        let width = img.width;
        let height = img.height;
  
        // Maintain aspect ratio
        if (width > maxWidth) {
          height = Math.floor((height * maxWidth) / width);
          width = maxWidth;
        }
  
        canvas.width = width;
        canvas.height = height;
  
        // Draw the image into the canvas
        ctx.drawImage(img, 0, 0, width, height);
  
        // Convert to a compressed blob
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/jpeg', quality);  // Adjust 'image/jpeg' and quality for different formats and compression
      };
    });
  }
  