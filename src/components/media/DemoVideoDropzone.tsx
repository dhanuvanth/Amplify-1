import { useCallback, useRef, useState } from 'react';
import { Loader2, Upload, X } from 'lucide-react';
import { isFirebaseConfigured } from '../../lib/firebase';
import { uploadDemoMedia } from '../../lib/uploadDemoMedia';
import { isLikelyImageDemoUrl } from '../../lib/demoMediaUrl';

type DemoVideoDropzoneProps = {
  videoUrl: string;
  onVideoUrlChange: (url: string) => void;
  disabled?: boolean;
};

function demoReadyLabel(url: string): string {
  const u = url.trim();
  if (!u) return 'Demo media';
  return isLikelyImageDemoUrl(u) ? 'Image demo ready' : 'Video demo ready';
}

export function DemoVideoDropzone({ videoUrl, onVideoUrlChange, disabled }: DemoVideoDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const firebaseReady = isFirebaseConfigured();
  const hasMedia = Boolean(videoUrl.trim());

  const runUpload = useCallback(
    async (file: File | undefined) => {
      if (!file || disabled || !firebaseReady || hasMedia) return;
      setError('');
      setUploading(true);
      setProgress(0);
      try {
        const url = await uploadDemoMedia(file, setProgress);
        onVideoUrlChange(url);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Upload failed.');
      } finally {
        setUploading(false);
        setProgress(0);
      }
    },
    [disabled, firebaseReady, hasMedia, onVideoUrlChange],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (hasMedia) return;
      const file = e.dataTransfer.files?.[0];
      void runUpload(file);
    },
    [hasMedia, runUpload],
  );

  const onBrowse = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (hasMedia) return;
    const file = e.target.files?.[0];
    void runUpload(file);
    e.target.value = '';
  };

  const readyRow = (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/80 px-3 py-2 text-xs text-emerald-900">
      <span className="font-bold">{demoReadyLabel(videoUrl)}:</span>
      <span className="max-w-[min(100%,28rem)] truncate font-mono text-emerald-800">{videoUrl}</span>
      <button
        type="button"
        disabled={disabled || uploading}
        onClick={(e) => {
          e.stopPropagation();
          onVideoUrlChange('');
        }}
        className="ml-auto inline-flex items-center gap-1 rounded-md border border-emerald-300 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
      >
        <X className="h-3 w-3" /> Remove
      </button>
    </div>
  );

  if (!firebaseReady) {
    if (hasMedia) {
      return <div className="space-y-3">{readyRow}</div>;
    }
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-900">
          <span className="font-bold">Firebase Storage is not configured.</span>{' '}
          Add <code className="rounded bg-amber-100 px-1 font-mono text-xs">VITE_FIREBASE_*</code> variables in{' '}
          <code className="rounded bg-amber-100 px-1 font-mono text-xs">.env.local</code> and deploy{' '}
          <code className="rounded bg-amber-100 px-1 font-mono text-xs">storage.rules</code> (
          <code className="rounded bg-amber-100 px-1 font-mono text-xs">firebase deploy --only storage</code>). Paste a
          direct link below until uploads are enabled. The URL is stored in Supabase as{' '}
          <code className="rounded bg-amber-100 px-1 font-mono text-xs">video_url</code> (video, YouTube, or image
          URL).
        </div>
        <p className="text-xs font-medium text-gray-500">
          Paste a hosted demo URL: direct MP4/WebM, YouTube, or a link to an image (PNG, JPG, WebP, …).
        </p>
        <input
          value={videoUrl}
          onChange={(e) => onVideoUrlChange(e.target.value)}
          placeholder="https://…"
          className="field-input font-mono text-xs"
          spellCheck={false}
          disabled={disabled}
        />
      </div>
    );
  }

  const zoneMinH = 'min-h-[168px]';

  return (
    <div className="space-y-3">
      {!hasMedia && (
        <div
          onDragEnter={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={`relative flex ${zoneMinH} flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 transition ${
            disabled || uploading
              ? 'cursor-default border-gray-200 bg-gray-50 opacity-70'
              : isDragging
                ? 'border-sky-500 bg-sky-50'
                : 'border-gray-300 bg-gray-50/50 hover:border-sky-400 hover:bg-sky-50/40'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="video/*,image/*"
            className="hidden"
            disabled={disabled || uploading}
            onChange={onBrowse}
          />
          {uploading ? (
            <div className="flex w-full flex-1 flex-col items-center justify-center gap-3 text-sky-700">
              <Loader2 className="h-10 w-10 shrink-0 animate-spin" />
              <span className="text-sm font-bold">Uploading… {progress}%</span>
              <div className="h-1.5 w-48 max-w-full overflow-hidden rounded-full bg-sky-100">
                <div className="h-full bg-sky-500 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          ) : (
            <div className="flex w-full flex-1 flex-col items-center justify-center gap-3 text-center text-gray-600">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-200">
                <Upload className="h-6 w-6 text-sky-500" />
              </div>
              <div className="text-sm font-bold text-gray-900">Upload video or image demo</div>
              <div className="max-w-md text-xs leading-relaxed text-gray-500">
                One file only: drag and drop or Browse. No app size limit on video (Firebase and your browser still impose practical limits). Images up to 25 MB.
              </div>
              <button
                type="button"
                disabled={disabled || uploading}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  inputRef.current?.click();
                }}
                className="mt-1 shrink-0 rounded-lg border border-sky-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-sky-700 shadow-sm transition hover:border-sky-400 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Browse files
              </button>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-sm font-medium text-rose-600">{error}</p>}

      {hasMedia && readyRow}
    </div>
  );
}
