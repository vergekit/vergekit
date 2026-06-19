import { jsonSuccess } from '@/lib/http/json';

export function GET() {
  return jsonSuccess({
    ok: true,
    service: 'vk',
  });
}
