'use server'

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { UserRole } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      include: {
        client: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return {
      success: true,
      data: users
    }
  } catch (error) {
    console.error('Error fetching users:', error)
    return {
      success: false,
      error: 'Failed to fetch users'
    }
  }
}

export async function createUser(data: {
  email: string
  password: string
  role: UserRole
  clientId?: string
}) {
  try {
    // Validate email uniqueness
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (existingUser) {
      return {
        success: false,
        error: 'A user with this email already exists'
      }
    }

    // Validate client assignment for CLIENT role
    if (data.role === UserRole.CLIENT && !data.clientId) {
      return {
        success: false,
        error: 'Client users must be assigned to a client'
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        role: data.role,
        clientId: data.role === UserRole.CLIENT ? data.clientId : null
      },
      include: {
        client: true
      }
    })

    revalidatePath('/admin')

    return {
      success: true,
      data: user
    }
  } catch (error) {
    console.error('Error creating user:', error)
    return {
      success: false,
      error: 'Failed to create user'
    }
  }
}

export async function updateUser(
  userId: string,
  data: {
    email?: string
    role?: UserRole
    clientId?: string | null
  }
) {
  try {
    // If updating email, check uniqueness
    if (data.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: data.email,
          NOT: { id: userId }
        }
      })

      if (existingUser) {
        return {
          success: false,
          error: 'A user with this email already exists'
        }
      }
    }

    // Validate client assignment for CLIENT role
    if (data.role === UserRole.CLIENT && !data.clientId) {
      return {
        success: false,
        error: 'Client users must be assigned to a client'
      }
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        email: data.email,
        role: data.role,
        clientId: data.role === UserRole.CLIENT ? data.clientId : null
      },
      include: {
        client: true
      }
    })

    revalidatePath('/admin')

    return {
      success: true,
      data: user
    }
  } catch (error) {
    console.error('Error updating user:', error)
    return {
      success: false,
      error: 'Failed to update user'
    }
  }
}

export async function updateUserPassword(userId: string, newPassword: string) {
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword
      }
    })

    revalidatePath('/admin')

    return {
      success: true
    }
  } catch (error) {
    console.error('Error updating password:', error)
    return {
      success: false,
      error: 'Failed to update password'
    }
  }
}

export async function deleteUser(userId: string) {
  try {
    // Prevent deleting the last admin
    const adminCount = await prisma.user.count({
      where: { role: UserRole.ADMIN }
    })

    const userToDelete = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (userToDelete?.role === UserRole.ADMIN && adminCount === 1) {
      return {
        success: false,
        error: 'Cannot delete the last admin user'
      }
    }

    await prisma.user.delete({
      where: { id: userId }
    })

    revalidatePath('/admin')

    return {
      success: true
    }
  } catch (error) {
    console.error('Error deleting user:', error)
    return {
      success: false,
      error: 'Failed to delete user'
    }
  }
}