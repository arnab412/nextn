import { z } from 'zod';

export const FeeCollectionFormSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required.'),
  studentName: z.string().min(1, 'Student Name is required.'),
  class: z.string().min(1, 'Class is required.'),
  
  primaryTuition: z.coerce.number().optional(),
  primaryExam: z.coerce.number().optional(),
  primaryFine: z.coerce.number().optional(),
  
  highTuition: z.coerce.number().optional(),
  highExam: z.coerce.number().optional(),
  highFine: z.coerce.number().optional(),
});
