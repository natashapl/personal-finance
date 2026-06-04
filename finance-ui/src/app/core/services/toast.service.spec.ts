import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  afterEach(() => {
    vi.useRealTimers();
    TestBed.resetTestingModule();
  });

  it('show() adds a toast with the correct type and message', () => {
    service.show('success', 'Saved!');
    expect(service.toasts()).toHaveLength(1);
    expect(service.toasts()[0]).toMatchObject({ type: 'success', message: 'Saved!' });
  });

  it('show() assigns unique ids when multiple toasts are added', () => {
    service.show('success', 'First');
    service.show('error', 'Second');
    const ids = service.toasts().map(t => t.id);
    expect(new Set(ids).size).toBe(2);
  });

  it('dismiss() removes a toast by id', () => {
    service.show('error', 'Oops');
    const { id } = service.toasts()[0];
    service.dismiss(id);
    expect(service.toasts()).toHaveLength(0);
  });

  it('dismiss() leaves other toasts untouched', () => {
    service.show('success', 'First');
    service.show('error', 'Second');
    const firstId = service.toasts()[0].id;
    service.dismiss(firstId);
    expect(service.toasts()).toHaveLength(1);
    expect(service.toasts()[0].message).toBe('Second');
  });

  it('show() auto-dismisses after 4 seconds', () => {
    service.show('success', 'Hello');
    expect(service.toasts()).toHaveLength(1);
    vi.advanceTimersByTime(4000);
    expect(service.toasts()).toHaveLength(0);
  });

  it('show() does not dismiss before 4 seconds', () => {
    service.show('success', 'Hello');
    vi.advanceTimersByTime(3999);
    expect(service.toasts()).toHaveLength(1);
  });

  it('announce() sets statusMessage', () => {
    service.announce('Pots loaded');
    expect(service.statusMessage()).toBe('Pots loaded');
  });

  it('announce() clears statusMessage after 100ms', () => {
    service.announce('Pots loaded');
    vi.advanceTimersByTime(100);
    expect(service.statusMessage()).toBe('');
  });
});
