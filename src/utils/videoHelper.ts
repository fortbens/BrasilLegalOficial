/**
 * Utilitário para conversão, normalização e validação de URLs de vídeo
 * Suporta YouTube (watch, shorts, embed, youtu.be), Vimeo e MP4 direto.
 */

export interface VideoEmbedInfo {
  embedUrl: string;
  originalUrl: string;
  videoId?: string;
  isValid: boolean;
  type: 'youtube' | 'vimeo' | 'mp4' | 'iframe' | 'unknown';
  thumbnailUrl?: string;
}

export function getEmbedVideoUrl(rawUrl: string | undefined): VideoEmbedInfo {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { embedUrl: '', originalUrl: '', isValid: false, type: 'unknown' };
  }

  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return { embedUrl: '', originalUrl: '', isValid: false, type: 'unknown' };
  }

  // 1. YouTube Matchers
  // Matches:
  // - https://www.youtube.com/watch?v=VIDEO_ID
  // - https://youtu.be/VIDEO_ID
  // - https://www.youtube.com/embed/VIDEO_ID
  // - https://www.youtube.com/shorts/VIDEO_ID
  // - https://m.youtube.com/watch?v=VIDEO_ID
  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const ytMatch = trimmed.match(ytRegex);

  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      embedUrl: `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1`,
      originalUrl: trimmed,
      videoId,
      isValid: true,
      type: 'youtube',
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    };
  }

  // 2. Vimeo Matcher
  // Matches: https://vimeo.com/123456789 or https://player.vimeo.com/video/123456789
  const vimeoRegex = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/i;
  const vimeoMatch = trimmed.match(vimeoRegex);
  if (vimeoMatch && vimeoMatch[1]) {
    const videoId = vimeoMatch[1];
    return {
      embedUrl: `https://player.vimeo.com/video/${videoId}?autoplay=1`,
      originalUrl: trimmed,
      videoId,
      isValid: true,
      type: 'vimeo'
    };
  }

  // 3. Direct HTML5 Video (.mp4, .webm, .ogg)
  if (trimmed.match(/\.(mp4|webm|ogg)($|\?)/i)) {
    return {
      embedUrl: trimmed,
      originalUrl: trimmed,
      isValid: true,
      type: 'mp4'
    };
  }

  // 4. Se já for uma URL genérica HTTP/HTTPS
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return {
      embedUrl: trimmed,
      originalUrl: trimmed,
      isValid: true,
      type: 'iframe'
    };
  }

  return {
    embedUrl: trimmed,
    originalUrl: trimmed,
    isValid: false,
    type: 'unknown'
  };
}

/**
 * Vídeos padrão de exemplo recomendados para regularização imobiliária
 */
export const PRESET_VIDEOS = [
  {
    titulo: 'Regularização Imobiliária em Cartório (Explicativo)',
    url: 'https://www.youtube.com/watch?v=d_k8Q85nC40',
    descricao: 'Vídeo institucional sobre Usucapião Extrajudicial e Provimento 65 do CNJ'
  },
  {
    titulo: 'Como Funciona a Regularização Fundiária',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    descricao: 'Apresentação resumida dos procedimentos registrais em 2 minutos'
  }
];
