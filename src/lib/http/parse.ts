import { z, type ZodType } from 'zod';
import { jsonFailure } from './json';

type AnySchema = ZodType;

export type ParseResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      issues?: unknown;
      response: Response;
    };

export function parseWithSchema<TSchema extends AnySchema>(
  schema: TSchema,
  input: unknown,
): ParseResult<z.output<TSchema>> {
  const parsed = schema.safeParse(input);

  if (parsed.success) {
    return { ok: true, data: parsed.data };
  }

  const issues = z.flattenError(parsed.error);

  return {
    ok: false,
    issues,
    response: jsonFailure('Invalid request body', {
      status: 400,
      issues,
    }),
  };
}

export async function parseJsonRequest<TSchema extends AnySchema>(
  request: Request,
  schema: TSchema,
): Promise<ParseResult<z.output<TSchema>>> {
  let input: unknown;

  try {
    input = await request.json();
  } catch {
    return {
      ok: false,
      response: jsonFailure('Invalid JSON request body', { status: 400 }),
    };
  }

  return parseWithSchema(schema, input);
}
