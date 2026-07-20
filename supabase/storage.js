/**
 * Generic Supabase Storage helpers used by every upload feature in the
 * admin panel. Client-side validation here is a UX nicety (fail fast, clear
 * error message) — the real enforcement is the file_size_limit /
 * allowed_mime_types set per bucket in storage-setup.sql, which Supabase
 * Storage applies server-side regardless of what this code does.
 */
import { supabase } from './client.js';
import { BUCKETS } from './config.js';

// Re-exported so callers can `import { uploadFile, ..., BUCKETS } from './storage.js'`
// without a second import line pointing at config.js.
export { BUCKETS };

/** Mirrors storage-setup.sql — keep in sync if bucket limits change there. */
const BUCKET_LIMITS = {
  [BUCKETS.GALLERY]:   { maxBytes: 10 * 1024 * 1024, types: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'] },
  [BUCKETS.VIDEOS]:    { maxBytes: 100 * 1024 * 1024, types: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'] },
  [BUCKETS.DOCUMENTS]: { maxBytes: 20 * 1024 * 1024, types: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] },
  [BUCKETS.SPONSORS]:  { maxBytes: 5 * 1024 * 1024, types: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'] },
  [BUCKETS.PARTNERS]:  { maxBytes: 5 * 1024 * 1024, types: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'] },
  [BUCKETS.TEAM]:      { maxBytes: 5 * 1024 * 1024, types: ['image/jpeg', 'image/png', 'image/webp'] },
  [BUCKETS.MEDIA]:     { maxBytes: 10 * 1024 * 1024, types: ['image/jpeg', 'image/png', 'image/webp'] },
};

export class FileValidationError extends Error {}

function validateFile(bucket, file) {
  const limit = BUCKET_LIMITS[bucket];
  if (!limit) throw new FileValidationError(`Unknown bucket "${bucket}".`);
  if (!limit.types.includes(file.type)) {
    throw new FileValidationError(`"${file.type || 'unknown type'}" is not allowed in ${bucket}. Allowed: ${limit.types.join(', ')}`);
  }
  if (file.size > limit.maxBytes) {
    throw new FileValidationError(`File is ${(file.size / 1024 / 1024).toFixed(1)}MB — max for ${bucket} is ${(limit.maxBytes / 1024 / 1024).toFixed(0)}MB.`);
  }
}

/** Strips anything that isn't safe in a storage path/filename. */
function sanitizeFilename(name) {
  const dot = name.lastIndexOf('.');
  const ext = dot > -1 ? name.slice(dot).toLowerCase().replace(/[^a-z0-9.]/g, '') : '';
  const base = (dot > -1 ? name.slice(0, dot) : name)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return `${base || 'file'}${ext}`;
}

/**
 * Uploads a single file to `bucket` (optionally inside `folder`) and
 * returns its public URL. Throws FileValidationError before any network
 * call if the file fails client-side checks.
 */
export async function uploadFile(bucket, file, { folder = '' } = {}) {
  validateFile(bucket, file);

  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const path = [folder, `${unique}-${sanitizeFilename(file.name)}`].filter(Boolean).join('/');

  const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
}

/** Uploads several files in parallel; returns results in the same order, with per-file errors captured instead of aborting the whole batch. */
export async function uploadFiles(bucket, files, { folder = '' } = {}) {
  return Promise.all(
    Array.from(files).map(async (file) => {
      try {
        return { file, ...(await uploadFile(bucket, file, { folder })), error: null };
      } catch (error) {
        return { file, path: null, publicUrl: null, error };
      }
    })
  );
}

/** Deletes an object by its storage path (not its public URL). */
export async function deleteFile(bucket, path) {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}

/** Extracts the storage path from a public URL previously returned by uploadFile(), for later deletion. */
export function pathFromPublicUrl(bucket, publicUrl) {
  const marker = `/object/public/${bucket}/`;
  const idx = publicUrl.indexOf(marker);
  return idx === -1 ? null : decodeURIComponent(publicUrl.slice(idx + marker.length));
}
