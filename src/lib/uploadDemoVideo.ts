import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getFirebaseStorage, isFirebaseConfigured } from './firebase';

const MAX_BYTES = 500 * 1024 * 1024;

function safeFileName(name: string) {
  const base = name.replace(/[^\w.\-]+/g, '_').slice(0, 180);
  return base || 'demo.mp4';
}

/**
 * Upload a demo video to Firebase Storage under `demo-videos/` and return a download URL
 * suitable for storing in `videoUrl` and playing in a `<video>` element.
 */
export async function uploadDemoVideo(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<string> {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase is not configured.');
  }
  if (!file.type.startsWith('video/')) {
    throw new Error('Please choose a video file (MP4, WebM, etc.).');
  }
  if (file.size > MAX_BYTES) {
    throw new Error('Video must be 500 MB or smaller.');
  }

  const storage = getFirebaseStorage();
  const path = `demo-videos/${crypto.randomUUID()}_${safeFileName(file.name)}`;
  const storageRef = ref(storage, path);
  const metadata = { contentType: file.type || 'video/mp4' };

  const task = uploadBytesResumable(storageRef, file, metadata);

  await new Promise<void>((resolve, reject) => {
    task.on(
      'state_changed',
      (snapshot) => {
        const pct = snapshot.totalBytes ? Math.round((100 * snapshot.bytesTransferred) / snapshot.totalBytes) : 0;
        onProgress?.(pct);
      },
      (err) => reject(err),
      () => resolve(),
    );
  });

  return getDownloadURL(task.snapshot.ref);
}
