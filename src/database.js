import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
const prisma = new PrismaClient()

async function main() {
    // Create Permissions
    const permissions = await Promise.all([
        prisma.permission.upsert({
            where: { code: 'user.create' },
            update: {},
            create: {
                name: 'Create User',
                code: 'user.create',
            },
        }),
        prisma.permission.upsert({
            where: { code: 'user.read' },
            update: {},
            create: {
                name: 'Read User',
                code: 'user.read',
            },
        }),
        prisma.permission.upsert({
            where: { code: 'user.update' },
            update: {},
            create: {
                name: 'Update User',
                code: 'user.update',
            },
        }),
        prisma.permission.upsert({
            where: { code: 'user.delete' },
            update: {},
            create: {
                name: 'Delete User',
                code: 'user.delete',
            },
        }),
    ])

    // Create Admin Role with all permissions
    const adminRole = await prisma.role.upsert({
        where: { code: 'admin' },
        update: {
            permissions: {
                connect: permissions.map(p => ({ id: p.id })),
            },
        },
        create: {
            description: 'Administrator',
            code: 'admin',
            permissions: {
                connect: permissions.map(p => ({ id: p.id })),
            },
        },
    })

    // Create Operation Role with only read permission
    const operationRole = await prisma.role.upsert({
        where: { code: 'operation' },
        update: {
            permissions: {
                connect: [{ code: 'user.read' }],
            },
        },
        create: {
            description: 'Operation',
            code: 'operation',
            permissions: {
                connect: [{ code: 'user.read' }],
            },
        },
    })

    // Hash default password
    const saltRounds = 10
    const defaultPassword = await bcrypt.hash('password123', saltRounds)

    // Create default admin user
    await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            name: 'Default Admin',
            username: 'admin',
            password: defaultPassword,
            roleId: adminRole.id
        },
    })

    // Create default operation user
    await prisma.user.upsert({
        where: { username: 'operation' },
        update: {},
        create: {
            name: 'Default Operation',
            username: 'operation',
            password: defaultPassword,
            roleId: operationRole.id
        },
    })
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

export default prisma;
