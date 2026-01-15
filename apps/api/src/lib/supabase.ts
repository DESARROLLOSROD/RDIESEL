import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

console.log('Initializing Supabase client...');
export const supabase = createClient(supabaseUrl, supabaseServiceKey);
console.log('Supabase client initialized.');

// Buckets de storage
export const STORAGE_BUCKETS = {
  EVIDENCIAS: 'evidencias',
  FIRMAS: 'firmas',
} as const;

// Función para subir archivo
export async function uploadFile(
  bucket: string,
  path: string,
  file: Buffer,
  contentType: string
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType,
      upsert: false,
    });

  if (error) {
    throw new Error(`Error uploading file: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

// Función para eliminar archivo
export async function deleteFile(bucket: string, path: string): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    throw new Error(`Error deleting file: ${error.message}`);
  }
}
