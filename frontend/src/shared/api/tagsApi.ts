import type { Tag } from '../types';
import { buildUrl, handleJsonOrThrow } from './client';

export async function fetchTags(): Promise<Tag[]> {
  const res = await fetch(buildUrl('/tags'));
  return handleJsonOrThrow<Tag[]>(res, 'Не вдалося завантажити теги');
}
