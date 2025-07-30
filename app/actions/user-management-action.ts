'use server'

import { userService } from '@/services/user-service'
import { UserRole } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export async function getUsers() {
  try {
    const users = await userService.getUsers()
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
    const user = await userService.createUser(data)
    revalidatePath('/admin')
    return {
      success: true,
      data: user
    }
  } catch (error) {
    console.error('Error creating user:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create user'
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
    const user = await userService.updateUser(userId, data)
    revalidatePath('/admin')
    return {
      success: true,
      data: user
    }
  } catch (error) {
    console.error('Error updating user:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update user'
    }
  }
}

export async function updateUserPassword(userId: string, newPassword: string) {
  try {
    await userService.updateUserPassword(userId, newPassword)
    revalidatePath('/admin')
    return {
      success: true
    }
  } catch (error) {
    console.error('Error updating password:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update password'
    }
  }
}

export async function deleteUser(userId: string) {
  try {
    await userService.deleteUser(userId)
    revalidatePath('/admin')
    return {
      success: true
    }
  } catch (error) {
    console.error('Error deleting user:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete user'
    }
  }
}