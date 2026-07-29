import { z } from 'zod'

export const uuidSchema = z.string().uuid()

export const loginBodySchema = z.object({
  username: z.string().min(3).max(16),
  password: z.string().min(6).max(255),
})

export const createUserBodySchema = z.object({
  username: z.string().min(3).max(16),
  password: z.string().min(6).max(255),
})

export const updateUsernameBodySchema = z.object({
  username: z.string().min(3).max(16),
})

export const updatePasswordBodySchema = z.object({
  password: z.string().min(6).max(255),
})

export const vmPermissionsBodySchema = z.object({
  canStart: z.boolean(),
  canStop: z.boolean(),
  canRemoveVM: z.boolean(),
  canRemoveVMAndDisks: z.boolean(),
  canForceStop: z.boolean(),
  canRestart: z.boolean(),
  canPause: z.boolean(),
  canHibernate: z.boolean(),
  canResume: z.boolean(),
})

export const vmUuidParamSchema = z.object({
  unraidVMId: z.string().uuid(),
})

export const userIdParamSchema = z.object({
  userId: z.string().uuid(),
})

export const unraidVMUserIdParamSchema = z.object({
  unraidVMId: z.string().uuid(),
  userId: z.string().uuid(),
})
