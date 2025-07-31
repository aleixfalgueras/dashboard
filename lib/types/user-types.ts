import {Prisma} from "@prisma/client";

export type UserWithClient = Prisma.UserGetPayload<{
  include: { client: true }
}>