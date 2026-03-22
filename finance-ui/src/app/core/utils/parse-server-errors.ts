import { HttpErrorResponse } from '@angular/common/http';

export interface ServerErrors {
  general: string;
  fields: Record<string, string[]>;
}

export function parseServerErrors(err: unknown): ServerErrors {
  if (!(err instanceof HttpErrorResponse)) {
    return { general: 'Something went wrong. Please try again.', fields: {} };
  }

  const body = err.error as Record<string, unknown> | null;

  if (body && typeof body === 'object') {
    // Rails 422: { errors: { field: ['msg', ...] } }
    if ('errors' in body && typeof body['errors'] === 'object' && body['errors'] !== null) {
      const errObj = body['errors'] as Record<string, string[]>;
      const fields: Record<string, string[]> = {};
      const messages: string[] = [];
      for (const [field, msgs] of Object.entries(errObj)) {
        fields[field] = msgs;
        if (msgs.length) messages.push(msgs[0]);
      }
      return { general: messages.join('. ') || 'Validation failed.', fields };
    }

    // { error: 'msg' }
    if ('error' in body && typeof body['error'] === 'string') {
      return { general: body['error'], fields: {} };
    }
  }

  return { general: 'Something went wrong. Please try again.', fields: {} };
}
