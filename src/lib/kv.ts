import { createClient } from '@vercel/kv';

export const kv = createClient({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export const CONTENT_KEY = 'gathering-hub:content';
export const CONTENT_BACKUP_PREFIX = 'gathering-hub:content:backup:';
