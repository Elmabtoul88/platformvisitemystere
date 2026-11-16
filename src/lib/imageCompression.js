/**
 * Utilitaire de compression d'images côté client (Navigateur / Smartphone)
 * Emberton Group - Optimisation du stockage cPanel & Débit 4G
 *
 * Réduit les photos de 8-12 Mo à ~300-600 Ko en WebP/JPEG avant l'envoi au serveur.
 */

export async function compressImage(file, options = {}) {
  // Si le fichier n'est pas une image ou est déjà un SVG, le retourner tel quel
  if (!file || !file.type.startsWith("image/") || file.type === "image/svg+xml") {
    return file;
  }

  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.82,
    outputType = "image/webp", // WebP par défaut avec fallback JPEG
  } = options;

  return new Promise((resolve, reject) => {
    // Si l'environnement n'a pas accès à Image ou FileReader (SSR), retourner le fichier
    if (typeof window === "undefined" || !window.FileReader) {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.onerror = () => resolve(file); // Fallback silencieux vers le fichier original
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => resolve(file);
      img.onload = () => {
        try {
          let { width, height } = img;

          // Calcul des proportions
          if (width > maxWidth || height > maxHeight) {
            if (width / height > maxWidth / maxHeight) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) return resolve(file);

          // Lissage de haute qualité
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, width, height);

          // Détecter si WebP est supporté
          const isWebPSupported = canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0;
          const finalMime = isWebPSupported ? outputType : "image/jpeg";

          canvas.toBlob(
            (blob) => {
              if (!blob) return resolve(file);

              // Si le fichier compressé est plus volumineux (très rare), garder l'original
              if (blob.size >= file.size) {
                return resolve(file);
              }

              const ext = finalMime === "image/webp" ? ".webp" : ".jpg";
              const originalBaseName = file.name.replace(/\.[^/.]+$/, "");
              const newFileName = `${originalBaseName}${ext}`;

              const compressedFile = new File([blob], newFileName, {
                type: finalMime,
                lastModified: Date.now(),
              });

              const origMb = (file.size / (1024 * 1024)).toFixed(2);
              const compMb = (compressedFile.size / (1024 * 1024)).toFixed(2);
              const reduction = Math.round((1 - compressedFile.size / file.size) * 100);

              console.log(
                `⚡ Photo compressée avec succès: ${file.name} (${origMb} Mo -> ${compMb} Mo, -${reduction}%)`
              );

              resolve(compressedFile);
            },
            finalMime,
            quality
          );
        } catch (err) {
          console.warn("Erreur lors de la compression canvas, utilisation du fichier original:", err);
          resolve(file);
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Compresse une liste de fichiers
 */
export async function compressImages(files, options = {}) {
  if (!Array.isArray(files) || files.length === 0) return [];
  return Promise.all(files.map((file) => compressImage(file, options)));
}
