import { z } from 'zod';
import { MeetingType } from '@prisma/client';

const idParams = z.object({ id: z.string().min(1) });
const stringArray = z.array(z.string().trim().min(1));

// Note: summaryBullets and actionItems are intentionally NOT accepted as input.
// They are always derived from rawNotes by the enrichment service.

export const createReportSchema = z.object({
  body: z.object({
    type: z.nativeEnum(MeetingType),
    countryId: z.string().min(1),
    companyId: z.string().min(1).optional(),
    meetingDate: z.coerce.date(),
    location: z.string().trim().max(300).optional(),
    attendees: stringArray.optional(),
    rawNotes: z.string().max(50000).optional(),
    tags: stringArray.optional(),
  }),
});

export const updateReportSchema = z.object({
  params: idParams,
  body: z.object({
    type: z.nativeEnum(MeetingType).optional(),
    countryId: z.string().min(1).optional(),
    companyId: z.string().min(1).nullable().optional(),
    meetingDate: z.coerce.date().optional(),
    location: z.string().trim().max(300).nullable().optional(),
    attendees: stringArray.optional(),
    rawNotes: z.string().max(50000).optional(),
    tags: stringArray.optional(),
  }),
});

export const reportIdParamSchema = z.object({ params: idParams });

export const listReportsSchema = z.object({
  query: z.object({
    countryId: z.string().min(1).optional(),
    companyId: z.string().min(1).optional(),
    type: z.nativeEnum(MeetingType).optional(),
    authorId: z.string().min(1).optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  }),
});

export type CreateReportInput = z.infer<typeof createReportSchema>['body'];
export type UpdateReportInput = z.infer<typeof updateReportSchema>['body'];
export type ListReportsQuery = z.infer<typeof listReportsSchema>['query'];
