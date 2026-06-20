import { z } from 'zod';

export const dashboardIdParamSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});
