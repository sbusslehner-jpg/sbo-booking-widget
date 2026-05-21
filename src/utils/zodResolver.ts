import type { Resolver } from 'react-hook-form'
import type { ZodTypeAny, z } from 'zod'

/**
 * Minimaler Adapter zwischen zod und react-hook-form, damit wir keine
 * zusätzliche `@hookform/resolvers`-Dependency brauchen.
 */
export function zodResolver<S extends ZodTypeAny>(schema: S): Resolver<z.infer<S>> {
  return async (values) => {
    const result = schema.safeParse(values)
    if (result.success) {
      return { values: result.data as z.infer<S>, errors: {} }
    }
    const errors: Record<string, { type: string; message: string }> = {}
    for (const issue of result.error.issues) {
      const path = issue.path.join('.')
      if (!errors[path]) {
        errors[path] = { type: issue.code, message: issue.message }
      }
    }
    return { values: {} as z.infer<S>, errors: errors as never }
  }
}
