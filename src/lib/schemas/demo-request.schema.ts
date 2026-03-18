import { z } from 'zod';

export const demoRequestSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  workEmail: z.string().email('Please enter a valid work email'),
  company: z.string().min(2, 'Company name is required'),
  role: z.string().min(2, 'Role is required'),
  teamSize: z.string().min(1, 'Please select team size'),
  useCase: z.string().min(4, 'Please select your primary use case'),
});

export type DemoRequestInput = z.infer<typeof demoRequestSchema>;
