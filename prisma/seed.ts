import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Check if admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: {
      email: 'admin@dicoard.com'
    }
  })

  if (!existingAdmin) {
    // Create admin user
    const hashedPassword = await bcrypt.hash('Admin123!', 12)
    
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@dicoard.com',
        password: hashedPassword,
        role: UserRole.ADMIN
      }
    })

    console.log('Admin user created:', adminUser.email)
  } else {
    console.log('Admin user already exists')
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })