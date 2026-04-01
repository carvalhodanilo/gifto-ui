import * as React from 'react';
import { Button, cn } from '@core-ui/ui';
import { Upload, X } from 'lucide-react';
import {
  IMAGE_UPLOAD_VARIANTS,
  type ImageUploadVariant,
  validateImageFile,
} from './imageUploadPresets';

export type ImageUploadFieldProps = {
  variant: ImageUploadVariant;
  id: string;
  label: string;
  value: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
  className?: string;
};

const previewMaxClass: Record<ImageUploadVariant, string> = {
  tenantLogo: 'max-h-24',
  campaignBanner: 'max-h-36 w-full',
  merchantLogo: 'max-h-24',
};

/**
 * Upload local com preview, dicas de resolução e validação por variant (sem envio ao backend).
 */
export function ImageUploadField({
  variant,
  id,
  label,
  value,
  onChange,
  disabled = false,
  className,
}: ImageUploadFieldProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = React.useState<string | null>(null);
  const preset = IMAGE_UPLOAD_VARIANTS[variant];

  const previewUrl = React.useMemo(() => {
    if (!value) return null;
    return URL.createObjectURL(value);
  }, [value]);

  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handlePick = () => inputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    e.target.value = '';
    if (!file) return;
    setLocalError(null);
    const err = await validateImageFile(variant, file);
    if (err) {
      setLocalError(err);
      return;
    }
    onChange(file);
  };

  const handleRemove = () => {
    setLocalError(null);
    onChange(null);
  };

  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium text-foreground" htmlFor={id}>
        {label}
      </label>
      <p className="text-xs text-muted-foreground">{preset.tip}</p>

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={preset.accept}
        className="sr-only"
        disabled={disabled}
        onChange={handleFileChange}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          disabled={disabled}
          onClick={handlePick}
        >
          <Upload className="h-4 w-4" />
          Escolher arquivo
        </Button>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground"
            disabled={disabled}
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
            Remover
          </Button>
        )}
      </div>

      {localError && <p className="text-sm text-destructive">{localError}</p>}

      {previewUrl && (
        <div
          className={cn(
            'overflow-hidden rounded-md border border-border bg-muted/30',
            variant === 'campaignBanner' && 'w-full'
          )}
        >
          <img
            src={previewUrl}
            alt=""
            className={cn('object-contain', previewMaxClass[variant])}
          />
        </div>
      )}
    </div>
  );
}
