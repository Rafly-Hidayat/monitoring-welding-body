import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import * as XLSX from 'xlsx'
import fs from 'fs'

const prisma = new PrismaClient()

async function main() {
    const workbook = XLSX.read(fs.readFileSync('./prisma/seed/seed_data.xlsx'));

    // Create Permissions
    const permissions = XLSX.utils.sheet_to_json(workbook.Sheets['Permissions']);
    await Promise.all(permissions.map(p =>
        prisma.permission.upsert({
            where: { code: p.code },
            update: {},
            create: p
        })
    ));

    // Create Roles
    const roles = XLSX.utils.sheet_to_json(workbook.Sheets['Roles']);
    for (const role of roles) {
        await prisma.role.upsert({
            where: { code: role.code },
            update: { description: role.description },
            create: {
                description: role.description,
                code: role.code
            }
        });
    }

    // Assign Permissions to Roles
    const rolePermissions = XLSX.utils.sheet_to_json(workbook.Sheets['RolePermissions']);
    for (const rp of rolePermissions) {
        await prisma.role.update({
            where: { code: rp.roleCode },
            data: {
                permissions: {
                    connect: { code: rp.permissionCode }
                }
            }
        });
    }

    // Create Users
    const users = XLSX.utils.sheet_to_json(workbook.Sheets['Users']);
    const saltRounds = 10;

    for (const user of users) {
        const hashedPassword = await bcrypt.hash(user.password, saltRounds);
        const role = await prisma.role.findUnique({
            where: { code: user.roleCode }
        });

        await prisma.user.upsert({
            where: { username: user.username },
            update: {},
            create: {
                name: user.name,
                email: user.email,
                username: user.username,
                password: hashedPassword,
                roleId: role.id
            }
        });
    }

    // Create Assets
    const assets = XLSX.utils.sheet_to_json(workbook.Sheets['Assets']);
    for (const asset of assets) {
        asset.value = asset.value.toString()
        await prisma.asset.upsert({
            where: { assetId: asset.assetId },
            update: {},
            create: asset
        });
    }
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
