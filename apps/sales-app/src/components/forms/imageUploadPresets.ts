export type ImageUploadVariant = 'tenantLogo' | 'campaignBanner' | 'merchantLogo';

export const IMAGE_UPLOAD_VARIANTS: Record<
  ImageUploadVariant,
  {
    accept: string;
    maxBytes: number;
    tip: string;
  }
> = {
  tenantLogo: {
    accept: 'image/png,image/webp,image/svg+xml',
    maxBytes: 2 * 1024 * 1024,
    tip:
      'PNG, WebP ou SVG. Raster: entre 128 e 2048 px por lado; a maior dimensão deve ter pelo menos 256 px. Ideal até ~800 px de largura. Máx. 2 MB.',
  },
  campaignBanner: {
    accept: 'image/png,image/jpeg,image/webp',
    maxBytes: 5 * 1024 * 1024,
    tip:
      'JPEG, PNG ou WebP. Largura entre 1200 e 4096 px; altura entre 300 e 2048 px; proporção largura/altura entre 2:1 e 4:1 (ex.: 1920×640). Máx. 5 MB.',
  },
  merchantLogo: {
    accept: 'image/png,image/webp',
    maxBytes: 1024 * 1024,
    tip:
      'PNG ou WebP. Entre 96 e 512 px de largura e altura; formato quase quadrado (proporção próxima de 1:1). Máx. 1 MB.',
  },
};

function isAllowedMime(variant: ImageUploadVariant, mime: string): boolean {
  const allowed = IMAGE_UPLOAD_VARIANTS[variant].accept.split(',').map((s) => s.trim());
  return allowed.includes(mime);
}

function loadRasterDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Não foi possível ler a imagem.'));
    };
    img.src = url;
  });
}

/**
 * Valida arquivo conforme o variant. Retorna mensagem de erro em PT-BR ou null se OK.
 */
export async function validateImageFile(
  variant: ImageUploadVariant,
  file: File
): Promise<string | null> {
  const preset = IMAGE_UPLOAD_VARIANTS[variant];
  if (!isAllowedMime(variant, file.type)) {
    return 'Tipo de arquivo não permitido para este campo.';
  }
  if (file.size > preset.maxBytes) {
    const mb = (preset.maxBytes / (1024 * 1024)).toFixed(file.size > 1024 * 1024 ? 1 : 0);
    return `Arquivo muito grande. Tamanho máximo: ${mb} MB.`;
  }

  if (variant === 'tenantLogo') {
    if (file.type === 'image/svg+xml') {
      return null;
    }
    try {
      const { width, height } = await loadRasterDimensions(file);
      if (width < 128 || width > 2048 || height < 128 || height > 2048) {
        return 'Cada lado deve estar entre 128 e 2048 px.';
      }
      if (Math.max(width, height) < 256) {
        return 'A maior dimensão deve ter pelo menos 256 px.';
      }
      return null;
    } catch (e) {
      return e instanceof Error ? e.message : 'Erro ao validar a imagem.';
    }
  }

  if (variant === 'campaignBanner') {
    try {
      const { width, height } = await loadRasterDimensions(file);
      if (width < 1200 || width > 4096) {
        return 'A largura deve estar entre 1200 e 4096 px.';
      }
      if (height < 300 || height > 2048) {
        return 'A altura deve estar entre 300 e 2048 px.';
      }
      const ratio = width / height;
      if (ratio < 2 || ratio > 4) {
        return 'A proporção largura/altura deve estar entre 2:1 e 4:1 (banner horizontal).';
      }
      return null;
    } catch (e) {
      return e instanceof Error ? e.message : 'Erro ao validar a imagem.';
    }
  }

  if (variant === 'merchantLogo') {
    try {
      const { width, height } = await loadRasterDimensions(file);
      if (width < 96 || width > 512 || height < 96 || height > 512) {
        return 'Largura e altura devem estar entre 96 e 512 px.';
      }
      const ratio = width / height;
      if (Math.abs(ratio - 1) > 0.35) {
        return 'Use uma imagem quase quadrada (proporção próxima de 1:1, entre ~5:4 e 4:5).';
      }
      return null;
    } catch (e) {
      return e instanceof Error ? e.message : 'Erro ao validar a imagem.';
    }
  }

  return null;
}
