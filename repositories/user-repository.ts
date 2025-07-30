import {prisma} from '@/lib/prisma'
import {Prisma, User} from '@prisma/client'
import {logger} from '@/lib/utils'
import {UserWithClient} from "@/lib/types/user-types";

export class UserRepository {
  async findMany(): Promise<UserWithClient[] | null> {
    return prisma.user.findMany({
      include: { client: true },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  async findById(id: string, include?: Prisma.UserInclude): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
      include
    })
  }

  async findByEmail(email: string, include?: Prisma.UserInclude): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
      include
    })
  }

  async findFirst(where: Prisma.UserWhereInput, include?: Prisma.UserInclude): Promise<User | null> {
    return prisma.user.findFirst({
      where,
      include
    })
  }

  async create(data: Prisma.UserCreateInput): Promise<UserWithClient> {
    return prisma.user.create({
      data,
      include: {
        client: true
      }
    })
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<UserWithClient> {
    return prisma.user.update({
      where: { id },
      data,
      include: {
        client: true
      }
    })
  }

  async delete(id: string): Promise<User> {
    logger.info(`Deleting user with id: ${id}`)
    return prisma.user.delete({
      where: { id }
    })
  }

  async count(where?: Prisma.UserWhereInput): Promise<number> {
    return prisma.user.count({ where })
  }
}

export const userRepository = new UserRepository()