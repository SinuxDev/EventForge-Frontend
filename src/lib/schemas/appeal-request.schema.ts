import { z } from 'zod';

export const appealRequestSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  workEmail: z.string().email('Please enter a valid work email'),
  company: z.string().min(2, 'Company name is required'),
  accountEmail: z.string().email('Please enter the account email tied to enforcement notice'),
  issueType: z.enum([
    'account_suspension',
    'policy_warning',
    'payment_restriction',
    'content_violation',
    'other',
  ]),
  timeline: z.string().min(10, 'Please provide timeline context').max(1000, 'Timeline is too long'),
  whatHappened: z
    .string()
    .min(20, 'Please explain what happened in enough detail')
    .max(2000, 'Response is too long'),
  correctiveActions: z
    .string()
    .min(20, 'Please include corrective actions')
    .max(2000, 'Response is too long'),
  evidenceLinksInput: z.string().optional(),
  consent: z.boolean().refine((value) => value, {
    message: 'You must confirm the information is accurate',
  }),
});

export type AppealRequestInput = z.infer<typeof appealRequestSchema>;
