import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';

export async function pickAndUploadAvatar(userId: string) {
  if (!supabase) throw new Error('Account services are not configured yet.');

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.85,
    exif: false,
  });

  if (result.canceled || !result.assets[0]?.uri) return null;

  const asset = result.assets[0];
  const bytes = await fetch(asset.uri).then((response) => response.arrayBuffer());
  const extension = asset.fileName?.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${userId}/avatar-${Date.now()}.${extension}`;

  const { error } = await supabase.storage.from('avatars').upload(path, bytes, {
    contentType: asset.mimeType || 'image/jpeg',
    upsert: false,
  });

  if (error) throw error;
  return path;
}

export async function getAvatarUrl(path: string | null) {
  if (!supabase || !path) return null;
  const { data, error } = await supabase.storage.from('avatars').createSignedUrl(path, 60 * 60);
  if (error) return null;
  return data.signedUrl;
}
