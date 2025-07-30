'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { ChevronDown, Loader2, Trash2, User, Eye, EyeOff, Key, Settings } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { getUsers, createUser, updateUser, updateUserPassword, deleteUser } from '@/app/actions/user-management-action'
import { UserRole } from '@prisma/client'
import { logger } from '@/lib/utils'

interface UserWithClient {
  id: string
  email: string
  role: UserRole
  clientId: string | null
  createdAt: Date
  client: {
    id: string
    name: string
    slug: string
  } | null
}

interface Client {
  id: string
  name: string
  slug: string
}

interface UserManagementProps {
  clients: Client[]
}

export function UserManagement({ clients }: UserManagementProps) {
  const [users, setUsers] = useState<UserWithClient[]>([])
  const [showUserForm, setShowUserForm] = useState(false)
  const [editingUser, setEditingUser] = useState<UserWithClient | null>(null)
  const [userFormData, setUserFormData] = useState({
    email: '',
    password: '',
    role: UserRole.CLIENT as UserRole,
    clientId: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [creatingUser, setCreatingUser] = useState(false)
  const [updatingUser, setUpdatingUser] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [passwordUserId, setPasswordUserId] = useState<string | null>(null)
  const { toast } = useToast()

  // Load users on component mount
  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    const result = await getUsers()
    if (result.success && result.data) {
      setUsers(result.data)
    }
  }

  const handleCreateUser = async () => {
    setCreatingUser(true)
    try {
      const result = await createUser(userFormData)
      if (result.success) {
        toast({
          title: 'User created successfully',
          description: `User ${userFormData.email} has been created`
        })
        setShowUserForm(false)
        setUserFormData({
          email: '',
          password: '',
          role: UserRole.CLIENT,
          clientId: ''
        })
        await loadUsers()
      } else {
        throw new Error(result.error || 'Failed to create user')
      }
    } catch (error) {
      logger.error('Create user error:', error)
      toast({
        title: 'Failed to create user',
        description: error instanceof Error ? error.message : 'An error occurred while creating user',
        variant: 'destructive'
      })
    } finally {
      setCreatingUser(false)
    }
  }

  const handleUpdateUser = async () => {
    if (!editingUser) return
    
    setUpdatingUser(true)
    try {
      const result = await updateUser(editingUser.id, {
        email: userFormData.email,
        role: userFormData.role,
        clientId: userFormData.role === UserRole.CLIENT ? userFormData.clientId : null
      })
      
      if (result.success) {
        toast({
          title: 'User updated successfully',
          description: `User ${userFormData.email} has been updated`
        })
        setEditingUser(null)
        setUserFormData({
          email: '',
          password: '',
          role: UserRole.CLIENT,
          clientId: ''
        })
        await loadUsers()
      } else {
        throw new Error(result.error || 'Failed to update user')
      }
    } catch (error) {
      logger.error('Update user error:', error)
      toast({
        title: 'Failed to update user',
        description: error instanceof Error ? error.message : 'An error occurred while updating user',
        variant: 'destructive'
      })
    } finally {
      setUpdatingUser(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    const result = await deleteUser(userId)
    if (result.success) {
      toast({
        title: 'User deleted successfully'
      })
      await loadUsers()
    } else {
      toast({
        title: 'Failed to delete user',
        description: result.error || 'An error occurred',
        variant: 'destructive'
      })
    }
    setUserToDelete(null)
  }

  const handleUpdatePassword = async () => {
    if (!passwordUserId || !newPassword) return
    
    try {
      const result = await updateUserPassword(passwordUserId, newPassword)
      if (result.success) {
        toast({
          title: 'Password updated successfully'
        })
        setShowPasswordDialog(false)
        setNewPassword('')
        setPasswordUserId(null)
      } else {
        throw new Error(result.error || 'Failed to update password')
      }
    } catch (error) {
      toast({
        title: 'Failed to update password',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      })
    }
  }

  const openEditUser = (user: UserWithClient) => {
    setEditingUser(user)
    setUserFormData({
      email: user.email,
      password: '',
      role: user.role,
      clientId: user.clientId || ''
    })
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Registered Users</h3>
            <Button
              onClick={() => setShowUserForm(true)}
              variant="outline"
              size="sm"
              disabled={creatingUser || updatingUser}
            >
              <User className="mr-2 h-4 w-4" />
              New User
            </Button>
          </div>

          {(showUserForm || editingUser) && (
            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium">{editingUser ? 'Edit User' : 'Create New User'}</h4>
              
              <div className="space-y-2">
                <Label htmlFor="user-email">Email</Label>
                <Input
                  id="user-email"
                  type="email"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({...userFormData, email: e.target.value})}
                  placeholder="Enter email"
                  disabled={creatingUser || updatingUser}
                />
              </div>

              {!editingUser && (
                <div className="space-y-2">
                  <Label htmlFor="user-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="user-password"
                      type={showPassword ? "text" : "password"}
                      value={userFormData.password}
                      onChange={(e) => setUserFormData({...userFormData, password: e.target.value})}
                      placeholder="Enter password"
                      disabled={creatingUser}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={creatingUser}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="user-role">Role</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between h-10"
                      disabled={creatingUser || updatingUser}
                    >
                      {userFormData.role}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    <DropdownMenuItem onClick={() => setUserFormData({...userFormData, role: UserRole.ADMIN})}>
                      {UserRole.ADMIN}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setUserFormData({...userFormData, role: UserRole.CLIENT})}>
                      {UserRole.CLIENT}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {userFormData.role === UserRole.CLIENT && (
                <div className="space-y-2">
                  <Label htmlFor="user-client">Assigned Client</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between h-10"
                        disabled={creatingUser || updatingUser || clients.length === 0}
                      >
                        {userFormData.clientId 
                          ? clients.find(c => c.id === userFormData.clientId)?.name || 'Select a client'
                          : 'Select a client'
                        }
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full">
                      {clients.map((client) => (
                        <DropdownMenuItem
                          key={client.id}
                          onClick={() => setUserFormData({...userFormData, clientId: client.id})}
                        >
                          {client.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={editingUser ? handleUpdateUser : handleCreateUser}
                  disabled={!userFormData.email || (!editingUser && !userFormData.password) || 
                           (userFormData.role === UserRole.CLIENT && !userFormData.clientId) || 
                           creatingUser || updatingUser}
                >
                  {creatingUser || updatingUser ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingUser ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    editingUser ? 'Update' : 'Create'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowUserForm(false)
                    setEditingUser(null)
                    setUserFormData({
                      email: '',
                      password: '',
                      role: UserRole.CLIENT,
                      clientId: ''
                    })
                    setShowPassword(false)
                  }}
                  disabled={creatingUser || updatingUser}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {users.length === 0 ? (
              <p className="text-sm text-muted-foreground">No users found.</p>
            ) : (
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-2 font-medium">Email</th>
                      <th className="text-left p-2 font-medium">Role</th>
                      <th className="text-left p-2 font-medium">Client</th>
                      <th className="text-left p-2 font-medium">Created</th>
                      <th className="text-left p-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b">
                        <td className="p-2">{user.email}</td>
                        <td className="p-2">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                            user.role === UserRole.ADMIN 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-2 text-sm text-muted-foreground">
                          {user.client ? user.client.name : '-'}
                        </td>
                        <td className="p-2 text-sm text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-2">
                          <div className="flex gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditUser(user)}
                                  disabled={creatingUser || updatingUser}
                                >
                                  <Settings className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit user</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setPasswordUserId(user.id)
                                    setShowPasswordDialog(true)
                                  }}
                                  disabled={creatingUser || updatingUser}
                                >
                                  <Key className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Reset password</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setUserToDelete(user.id)}
                                  disabled={creatingUser || updatingUser}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete user</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showPasswordDialog} onOpenChange={(open) => {
        if (!open) {
          setShowPasswordDialog(false)
          setNewPassword('')
          setPasswordUserId(null)
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter a new password for this user. They will need to use this password to log in.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPasswordDialog(false)
                setNewPassword('')
                setPasswordUserId(null)
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdatePassword}
              disabled={!newPassword || newPassword.length < 6}
              className="bg-accent hover:bg-accent/90"
            >
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? They will no longer be able to access the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => userToDelete && handleDeleteUser(userToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}