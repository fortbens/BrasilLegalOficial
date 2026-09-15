/**
 * Utilitário de compressão e otimização de imagens no navegador.
 * Reduz fotos de perfil e logotipos para tamanhos ultraleves (~25KB a 50KB),
 * permitindo que sejam persistidos de forma 100% autossuficiente no Firebase Firestore
 * e no LocalStorage sem risco de ultrapassar limites e sem depender de uploads em disco transitório.
 */

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 a 1.0
  format?: 'image/jpeg' | 'image/png' | 'image/webp';
}

export async function compressImage(
  input: File | string,
  options: CompressOptions = {}
): Promise<string> {
  const {
    maxWidth = 400,
    maxHeight = 400,
    quality = 0.85,
    format = 'image/jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    // 1. Obter Data URL da entrada
    const processDataUrl = (dataUrl: string) => {
      // Se for SVG, não precisa de compressão via Canvas (já é vetorial leve)
      if (dataUrl.startsWith('data:image/svg+xml') || dataUrl.endsWith('.svg')) {
        resolve(dataUrl);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          let { width, height } = img;

          // Se a imagem já for menor que os limites e for razoavelmente leve (< 60KB), mantém
          if (width <= maxWidth && height <= maxHeight && dataUrl.length < 80000) {
            resolve(dataUrl);
            return;
          }

          // Calcula novas dimensões mantendo proporção
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = Math.max(width, 1);
          canvas.height = Math.max(height, 1);

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(dataUrl); // fallback
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Se for JPEG, pinta fundo branco para preservar transparências de PNGs convertidos
          if (format === 'image/jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Tenta exportar no formato escolhido
          try {
            const compressed = canvas.toDataURL(format, quality);
            // Se o comprimido for de fato menor ou válido, usa
            resolve(compressed);
          } catch (e) {
            // Fallback para PNG
            const fallback = canvas.toDataURL('image/png');
            resolve(fallback);
          }
        } catch (err) {
          console.warn('[imageCompressor] Falha ao redimensionar canvas, mantendo original:', err);
          resolve(dataUrl);
        }
      };

      img.onerror = () => {
        console.warn('[imageCompressor] Falha ao carregar imagem para compressão.');
        resolve(dataUrl);
      };

      img.src = dataUrl;
    };

    if (typeof input === 'string') {
      if (input.startsWith('data:') || input.startsWith('blob:') || input.startsWith('http') || input.startsWith('/')) {
        processDataUrl(input);
      } else {
        resolve(input);
      }
    } else if (input instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          processDataUrl(result);
        } else {
          reject(new Error('Falha ao ler arquivo de imagem.'));
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(input);
    } else {
      resolve('');
    }
  });
}
