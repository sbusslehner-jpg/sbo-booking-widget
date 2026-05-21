import { describe, it, expect } from 'vitest'
import { decodePrefillToken, tokenToPrefill } from './prefillToken'

function b64url(s: string): string {
  return Buffer.from(s)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function mintToken(payload: Record<string, unknown>): string {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = b64url(JSON.stringify(payload))
  return `${header}.${body}.sig-not-verified-clientside`
}

describe('decodePrefillToken', () => {
  it('decodes a valid token', () => {
    const t = mintToken({
      exp: Math.floor(Date.now() / 1000) + 600,
      customer: { email: 'a@b.de' },
    })
    const decoded = decodePrefillToken(t)
    expect(decoded?.payload.customer?.email).toBe('a@b.de')
  })

  it('rejects an expired token', () => {
    const t = mintToken({
      exp: Math.floor(Date.now() / 1000) - 60,
      customer: { email: 'a@b.de' },
    })
    expect(decodePrefillToken(t)).toBeNull()
  })

  it('rejects malformed input', () => {
    expect(decodePrefillToken('not.a.jwt!!!')).toBeNull()
    expect(decodePrefillToken('')).toBeNull()
    expect(decodePrefillToken(undefined)).toBeNull()
  })

  it('rejects token without exp claim', () => {
    const t = mintToken({ customer: { email: 'a@b.de' } })
    expect(decodePrefillToken(t)).toBeNull()
  })

  it('tokenToPrefill produces a PrefillData shape', () => {
    const t = mintToken({
      exp: Math.floor(Date.now() / 1000) + 600,
      customer: { email: 'x@y.de' },
      vehicle: { brand: 'vw', model: 'polo' },
      step: 3,
    })
    const decoded = decodePrefillToken(t)!
    const prefill = tokenToPrefill(decoded)
    expect(prefill.customer?.email).toBe('x@y.de')
    expect(prefill.vehicle?.brand).toBe('vw')
    expect(prefill.step).toBe(3)
  })
})
