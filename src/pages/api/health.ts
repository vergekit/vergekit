import { jsonSuccess } from '@vergekit/core/http';

export function GET() {
  return jsonSuccess({
    ok: true,
    service: 'vk',
  });
}
