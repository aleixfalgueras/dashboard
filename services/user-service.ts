import {userRepository} from '@/repositories/user-repository'
import { UserRole, Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'
import {UserWithClient} from "@/lib/types/user-types";

export class UserService {
  async getUsers(): Promise<UserWithClient[] | null> {
    return await userRepository.findMany()
  }

  async createUser(data: {
    email: string
    password: string
    role: UserRole
    clientId?: string
  }): Promise<UserWithClient> {
    // Validate email uniqueness
    const existingUser = await userRepository.findByEmail(data.email)
    if (existingUser) {
      throw new Error('A user with this email already exists')
    }

    // Validate client assignment
    this.validateClientAssignment(data.role, data.clientId)

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12)

    // Create user
    const userData: Prisma.UserCreateInput = {
      email: data.email,
      password: hashedPassword,
      role: data.role,
      ...(data.role === UserRole.CLIENT && data.clientId
        ? { client: { connect: { id: data.clientId } } }
        : {})
    }

    return await userRepository.create(userData)
  }

  async updateUser(
    userId: string,
    data: {
      email?: string
      role?: UserRole
      clientId?: string | null
    }
  ): Promise<UserWithClient> {
    // Validate email uniqueness if updating email
    if (data.email) {
      await this.validateEmailUniqueness(data.email, userId)
    }

    // Validate client assignment if updating role
    if (data.role) {
      this.validateClientAssignment(data.role, data.clientId)
    }

    // Prepare update data
    const updateData: Prisma.UserUpdateInput = {
      ...(data.email && { email: data.email }),
      ...(data.role && { role: data.role }),
      ...(data.role === UserRole.CLIENT && data.clientId
        ? { client: { connect: { id: data.clientId } } }
        : data.role === UserRole.ADMIN
        ? { client: { disconnect: true } }
        : {})
    }

    return userRepository.update(userId, updateData)
  }

  async updateUserPassword(userId: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    await userRepository.update(userId, { password: hashedPassword })
  }

  async deleteUser(userId: string): Promise<void> {
    // Get user to check role
    const userToDelete = await userRepository.findById(userId)
    if (!userToDelete) {
      throw new Error('User not found')
    }

    // Prevent deleting the last admin
    if (userToDelete.role === UserRole.ADMIN) {
      const adminCount = await userRepository.count({ role: UserRole.ADMIN })
      if (adminCount === 1) {
        throw new Error('Cannot delete the last admin user')
      }
    }

    await userRepository.delete(userId)
  }

  private async validateEmailUniqueness(email: string, excludeUserId?: string): Promise<void> {
    const existingUser = await userRepository.findFirst({
      email,
      ...(excludeUserId && { NOT: { id: excludeUserId } })
    })

    if (existingUser) {
      throw new Error('A user with this email already exists')
    }
  }

  private validateClientAssignment(role: UserRole, clientId?: string | null): void {
    if (role === UserRole.CLIENT && !clientId) {
      throw new Error('Client users must be assigned to a client')
    }
  }

  async findByEmailWithClient(email: string): Promise<UserWithClient | null> {
    return await userRepository.findByEmail(email, { client: true }) as UserWithClient | null
  }

  async authenticateUser(email: string, password: string): Promise<UserWithClient | null> {
    const user = await this.findByEmailWithClient(email)
    
    if (!user || !user.password) {
      return null
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if (!isPasswordValid) {
      return null
    }

    return user
  }

}

export const userService = new UserService()