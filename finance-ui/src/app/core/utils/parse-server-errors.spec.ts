import { describe, it, expect } from 'vitest';
import { HttpErrorResponse } from '@angular/common/http';
import { parseServerErrors } from './parse-server-errors';

const FALLBACK = 'Something went wrong. Please try again.';

describe('parseServerErrors', () => {
  it('returns fallback for non-HTTP errors', () => {
    expect(parseServerErrors(new Error('network'))).toEqual({ general: FALLBACK, fields: {} });
  });

  it('returns fallback for a plain string', () => {
    expect(parseServerErrors('oops').general).toBe(FALLBACK);
  });

  it('returns fallback for null HTTP body', () => {
    expect(parseServerErrors(new HttpErrorResponse({ error: null, status: 500 }))).toEqual({
      general: FALLBACK,
      fields: {}
    });
  });

  it('parses Rails 422 field errors into fields and general', () => {
    const err = new HttpErrorResponse({
      error: { errors: { email: ['has already been taken'], name: ['is too short'] } },
      status: 422
    });
    const result = parseServerErrors(err);
    expect(result.fields['email']).toEqual(['has already been taken']);
    expect(result.fields['name']).toEqual(['is too short']);
    expect(result.general).toContain('has already been taken');
    expect(result.general).toContain('is too short');
  });

  it('joins multiple field messages with ". "', () => {
    const err = new HttpErrorResponse({
      error: { errors: { email: ['is invalid'], password: ['is too short'] } },
      status: 422
    });
    expect(parseServerErrors(err).general).toBe('is invalid. is too short');
  });

  it('returns "Validation failed." when errors object is empty', () => {
    const err = new HttpErrorResponse({ error: { errors: {} }, status: 422 });
    expect(parseServerErrors(err).general).toBe('Validation failed.');
    expect(parseServerErrors(err).fields).toEqual({});
  });

  it('parses { error: message } format', () => {
    const err = new HttpErrorResponse({ error: { error: 'Invalid credentials' }, status: 401 });
    expect(parseServerErrors(err)).toEqual({ general: 'Invalid credentials', fields: {} });
  });
});
