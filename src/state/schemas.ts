import { z } from 'zod'

export const customerSchema = z.object({
  salutation: z.string().min(1, 'required'),
  email: z.string().email('email'),
  firstName: z.string().min(1, 'required'),
  lastName: z.string().min(1, 'required'),
  phoneCountry: z.string().min(1, 'required'),
  phone: z.string().regex(/^[0-9\s\-]{6,15}$/, 'phone'),
  address: z.string().min(1, 'required'),
  zip: z.string().regex(/^\d{4}$/, 'zip'),
  city: z.string().min(1, 'required'),
  country: z.string().min(1, 'required'),
  hasTopcard: z.boolean(),
  acceptedTerms: z.literal(true, {
    errorMap: () => ({ message: 'terms' }),
  }),
})

export const appointmentSchema = z.object({
  date: z.string().min(1, 'required'),
  time: z.string().min(1, 'required'),
  needsReplacementCar: z.boolean(),
})

export const vehicleSchema = z.object({
  brand: z.string().min(1, 'required'),
  model: z.string().min(1, 'required'),
  vin: z.string().optional(),
  mileage: z.number().optional(),
})

export const servicesSchema = z
  .object({
    selected: z.array(z.string()).min(1, 'required'),
    tireStorage: z.boolean(),
  })
  .refine((d) => d.selected.length > 0, { message: 'required' })

export type CustomerInput = z.infer<typeof customerSchema>
