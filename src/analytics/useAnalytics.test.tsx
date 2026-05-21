import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAnalytics } from './useAnalytics'
import { FULL_CONSENT, NO_CONSENT } from '../state/consent'

describe('useAnalytics consent gating', () => {
  beforeEach(() => {
    ;(window as unknown as { dataLayer?: unknown[] }).dataLayer = []
  })

  it('does NOT push events when analytics consent is false', () => {
    const sink = vi.fn()
    const { result } = renderHook(() => useAnalytics(NO_CONSENT, sink))
    act(() => {
      result.current.track({ event: 'sbo_step_view', step: 1, dealer: 'x' })
    })
    expect(sink).not.toHaveBeenCalled()
  })

  it('pushes when analytics consent is true', () => {
    const sink = vi.fn()
    const { result } = renderHook(() => useAnalytics(FULL_CONSENT, sink))
    act(() => {
      result.current.track({ event: 'sbo_step_view', step: 1, dealer: 'x' })
    })
    expect(sink).toHaveBeenCalledOnce()
    const arg = sink.mock.calls[0][0]
    expect(arg.event).toBe('sbo_step_view')
    expect(arg.step).toBe(1)
    expect(typeof arg.sbo_timestamp).toBe('number')
  })

  it('uses default dataLayer sink when no sink given', () => {
    const { result } = renderHook(() => useAnalytics(FULL_CONSENT))
    act(() => {
      result.current.track({ event: 'sbo_widget_close', last_step: 1, completed: false, dealer: 'x' })
    })
    const dl = (window as unknown as { dataLayer: unknown[] }).dataLayer
    expect(dl.length).toBe(1)
  })

  it('does not throw if sink throws', () => {
    const sink = vi.fn(() => {
      throw new Error('boom')
    })
    const { result } = renderHook(() => useAnalytics(FULL_CONSENT, sink))
    expect(() =>
      act(() => {
        result.current.track({ event: 'sbo_step_view', step: 1, dealer: 'x' })
      }),
    ).not.toThrow()
  })
})
