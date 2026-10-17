import { z } from "zod";

/**
 * Zod schema for a photo object attached to a user/profile
 */
export const PhotoSchema = z.object({
  id: z.string().optional(),
  url: z.string().url().or(z.string().min(1)),
  isPrimary: z.boolean().optional(),
  isVerified: z.boolean().optional(),
});

export type PhotoData = z.infer<typeof PhotoSchema>;

/**
 * Zod schema for user partner profile details
 */
export const PartnerProfileSchema = z.object({
  id: z.string().min(1),
  profileId: z.string().optional().nullable(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  dateOfBirth: z.string().or(z.date()).optional().nullable(),
  age: z.number().int().min(18).max(120).optional(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  occupation: z.string().optional().nullable(),
  profession: z.string().optional().nullable(),
  education: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  about: z.string().optional().nullable(),
  height: z.string().or(z.number()).optional().nullable(),
  maritalStatus: z.string().optional().nullable(),
  religion: z.string().optional().nullable(),
  motherTongue: z.string().optional().nullable(),
  family: z.string().optional().nullable(),
  isVerified: z.boolean().optional(),
  online: z.boolean().optional(),
  compatibility: z.number().optional(),
  photos: z.array(PhotoSchema).optional().default([]),
  image: z.string().optional(),
});

export type PartnerProfile = z.infer<typeof PartnerProfileSchema>;

/**
 * Zod schema for a live connection record from /connections endpoint
 */
export const LiveConnectionSchema = z.object({
  id: z.string().min(1),
  senderId: z.string().min(1),
  receiverId: z.string().min(1),
  status: z.enum(["PENDING", "ACCEPTED", "REJECTED", "SHORTLISTED", "BLOCKED"]).or(z.string()),
  createdAt: z.string().or(z.date()).optional(),
  updatedAt: z.string().or(z.date()).optional(),
  sender: PartnerProfileSchema.optional().nullable(),
  receiver: PartnerProfileSchema.optional().nullable(),
  partner: PartnerProfileSchema.optional().nullable(),
  isMutualMatch: z.boolean().optional(),
});

export type LiveConnection = z.infer<typeof LiveConnectionSchema>;

/**
 * Zod schema for matches response list
 */
export const MatchesResponseSchema = z.array(LiveConnectionSchema);

/**
 * Zod schema for chat initialization endpoint response
 */
export const InitiateChatResponseSchema = z.object({
  success: z.boolean(),
  conversationId: z.string().min(1),
  contactId: z.string().min(1),
  partner: z.object({
    id: z.string().min(1),
    name: z.string().optional().nullable(),
    photo: z.string().optional().nullable(),
    bio: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    occupation: z.string().optional().nullable(),
  }).optional().nullable(),
  message: z.string().optional(),
});

export type InitiateChatResponse = z.infer<typeof InitiateChatResponseSchema>;

/**
 * Zod schema for celebration modal trigger payload
 */
export const CelebrationPayloadSchema = z.object({
  match: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    age: z.number().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    profession: z.string().optional(),
    education: z.string().optional(),
    image: z.string().optional(),
    compatibility: z.number().optional(),
    verified: z.boolean().optional(),
    about: z.string().optional(),
    maritalStatus: z.string().optional(),
    religion: z.string().optional(),
  }),
  currentUser: z.object({
    name: z.string().optional(),
    image: z.string().optional(),
    city: z.string().optional(),
    verified: z.boolean().optional(),
  }).optional(),
  initialGreeting: z.string().optional(),
});

export type CelebrationPayload = z.infer<typeof CelebrationPayloadSchema>;
