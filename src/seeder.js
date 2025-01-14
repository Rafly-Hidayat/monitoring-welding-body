import bcrypt from 'bcrypt'
import * as XLSX from 'xlsx'
import fs from 'fs'
import prisma from './database.js';

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
        asset.partCd = asset.partCd.toString().padStart(4, "0")
        await prisma.asset.upsert({
            where: { tagCd: asset.tagCd },
            update: {},
            create: asset
        });
    }

    // Create Cycles
    const cycles = XLSX.utils.sheet_to_json(workbook.Sheets['Cycles']);
    for (const cycle of cycles) {
        await prisma.cycle.upsert({
            where: { name: cycle.name },
            update: {},
            create: {
                name: cycle.name
            }
        });
    }

    // Create Ohc
    const ohcs = XLSX.utils.sheet_to_json(workbook.Sheets['Ohc']);
    for (const ohc of ohcs) {
        const cycle = await prisma.cycle.findUnique({
            where: { name: ohc.cycleName }
        });

        await prisma.ohc.upsert({
            where: { name: ohc.name },
            update: {},
            create: {
                name: ohc.name,
                cycleId: cycle.id
            }
        });
    }

    // Create Sp
    const sps = XLSX.utils.sheet_to_json(workbook.Sheets['Sp']);
    for (const sp of sps) {
        const cycle = await prisma.cycle.findUnique({
            where: { name: sp.cycleName }
        });
        const ohc = sp.ohcName ? await prisma.ohc.findUnique({
            where: { name: sp.ohcName }
        }) : null;

        await prisma.sp.upsert({
            where: { name: sp.name },
            update: {},
            create: {
                name: sp.name,
                cycleId: cycle.id,
                ohcId: ohc?.id || null,
                assetTagCd: sp.assetTagCd
            }
        });
    }

    // Create OhcDescriptions
    const ohcDescriptions = XLSX.utils.sheet_to_json(workbook.Sheets['OhcDescriptions']);
    for (const desc of ohcDescriptions) {
        const ohc = await prisma.ohc.findUnique({
            where: { name: desc.ohcName }
        });

        await prisma.ohcDescription.create({
            data: {
                ohcId: ohc.id,
                assetTagCd: desc.assetTagCd
            }
        });
    }

    // Create SpDescriptions
    const spDescriptions = XLSX.utils.sheet_to_json(workbook.Sheets['SpDescriptions']);
    for (const desc of spDescriptions) {
        const sp = await prisma.sp.findUnique({
            where: { name: desc.spName }
        });

        await prisma.spDescription.create({
            data: {
                spId: sp.id,
                assetTagCd: desc.assetTagCd
            }
        });
    }

    // Create CycleDescriptions
    const cycleDescriptions = XLSX.utils.sheet_to_json(workbook.Sheets['CycleDescriptions']);
    for (const desc of cycleDescriptions) {
        const cycle = await prisma.cycle.findUnique({
            where: { name: desc.cycleName }
        });

        await prisma.cycleDescription.create({
            data: {
                name: desc.name,
                actualValue: desc.actualValue,
                standardValue: desc.standardValue,
                cycleId: cycle.id
            }
        });
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        console.log('success feed database!')
        await prisma.$disconnect()
    })