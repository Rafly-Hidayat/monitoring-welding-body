import prisma from './database.js';

const warningData = [
    {
        date: "30",
        month: "October",
        year: "2025",
        type: "High Temp",
        detail: "OHC 3"
    },
    {
        date: "30",
        month: "October",
        year: "2025",
        type: "High Current",
        detail: "OHC 5"
    },
    {
        date: "30",
        month: "October",
        year: "2025",
        type: "High Current",
        detail: "OHC 3"
    },
    {
        date: "30",
        month: "October",
        year: "2025",
        type: "High Current",
        detail: "OHC 5"
    },
    {
        date: "30",
        month: "October",
        year: "2025",
        type: "High Current",
        detail: "OHC 3"
    },
    {
        date: "30",
        month: "October",
        year: "2025",
        type: "High Temp",
        detail: "OHC 5"
    },
    {
        date: "30",
        month: "October",
        year: "2025",
        type: "High Temp",
        detail: "OHC 3"
    },
    {
        date: "30",
        month: "October",
        year: "2025",
        type: "High Temp",
        detail: "OHC 5"
    },
    {
        date: "30",
        month: "October",
        year: "2025",
        type: "High Temp",
        detail: "OHC 3"
    },
    {
        date: "30",
        month: "October",
        year: "2025",
        type: "High Temp",
        detail: "OHC 5"
    },
    {
        date: "30",
        month: "October",
        year: "2025",
        type: "High Temp",
        detail: "OHC 3"
    },
    {
        date: "30",
        month: "October",
        year: "2025",
        type: "High Temp",
        detail: "OHC 5"
    },
    {
        date: "30",
        month: "October",
        year: "2025",
        type: "High Temp",
        detail: "OHC 3"
    },
    {
        date: "30",
        month: "October",
        year: "2025",
        type: "High Temp",
        detail: "OHC 5"
    },
    {
        date: "30",
        month: "October",
        year: "2025",
        type: "High Temp",
        detail: "OHC 3"
    },
    {
        date: "30",
        month: "October",
        year: "2025",
        type: "High Temp",
        detail: "OHC 5"
    },
    {
        date: "30",
        month: "October",
        year: "2025",
        type: "High Temp",
        detail: "OHC 3"
    },
    {
        date: "30",
        month: "October",
        year: "2025",
        type: "High Temp",
        detail: "OHC 5"
    },
    {
        date: "30",
        month: "October",
        year: "2025",
        type: "High Temp",
        detail: "OHC 3"
    },
    {
        date: "30",
        month: "October",
        year: "2025",
        type: "High Temp",
        detail: "OHC 5"
    },
    {
        date: "30",
        month: "October",
        year: "2025",
        type: "High Temp",
        detail: "OHC 3"
    },
    {
        date: "30",
        month: "October",
        year: "2025",
        type: "High Temp",
        detail: "OHC 5"
    },
    {
        date: "30",
        month: "October",
        year: "2025",
        type: "High Temp",
        detail: "OHC 3"
    },
    {
        date: "30",
        month: "October",
        year: "2025",
        type: "High Temp",
        detail: "OHC 5"
    },
    {
        date: "30",
        month: "October",
        year: "2025",
        type: "High Temp",
        detail: "OHC 3"
    },
    {
        date: "30",
        month: "October",
        year: "2025",
        type: "High Temp",
        detail: "OHC 5"
    },
    {
        date: "30",
        month: "October",
        year: "2025",
        type: "High Temp",
        detail: "OHC 3"
    },
    {
        date: "30",
        month: "October",
        year: "2025",
        type: "High Current",
        detail: "OHC 5"
    },
    {
        date: "30",
        month: "October",
        year: "2025",
        type: "High Current",
        detail: "OHC 3"
    },
    {
        date: "30",
        month: "October",
        year: "2025",
        type: "High Current",
        detail: "OHC 5"
    },
    {
        date: "30",
        month: "October",
        year: "2025",
        type: "High Current",
        detail: "OHC 3"
    },
    {
        date: "30",
        month: "October",
        year: "2025",
        type: "High Temp",
        detail: "OHC 5"
    },
    {
        date: "30",
        month: "October",
        year: "2025",
        type: "High Temp",
        detail: "OHC 3"
    },
    {
        date: "30",
        month: "October",
        year: "2025",
        type: "High Temp",
        detail: "OHC 5"
    },
    {
        date: "30",
        month: "October",
        year: "2025",
        type: "High Temp",
        detail: "OHC 3"
    },
    {
        date: "30",
        month: "October",
        year: "2025",
        type: "High Temp",
        detail: "OHC 5"
    },
    {
        date: "30",
        month: "October",
        year: "2025",
        type: "High Temp",
        detail: "OHC 3"
    },
    {
        date: "30",
        month: "October",
        year: "2025",
        type: "High Temp",
        detail: "OHC 5"
    },
    {
        date: "30",
        month: "October",
        year: "2025",
        type: "High Temp",
        detail: "OHC 3"
    },
    {
        date: "30",
        month: "October",
        year: "2025",
        type: "High Temp",
        detail: "OHC 5"
    },
    {
        date: "30",
        month: "October",
        year: "2025",
        type: "High Temp",
        detail: "OHC 3"
    },
    {
        date: "30",
        month: "October",
        year: "2025",
        type: "High Temp",
        detail: "OHC 5"
    },
    {
        date: "21",
        month: "November",
        year: "2025",
        type: "High Temp",
        detail: "OHC 3"
    },
    {
        date: "21",
        month: "November",
        year: "2025",
        type: "High Temp",
        detail: "OHC 5"
    },
    {
        date: "21",
        month: "November",
        year: "2025",
        type: "High Temp",
        detail: "OHC 3"
    },
    {
        date: "21",
        month: "November",
        year: "2025",
        type: "High Current",
        detail: "OHC 5"
    },
    {
        date: "21",
        month: "November",
        year: "2025",
        type: "High Current",
        detail: "OHC 3"
    },
    {
        date: "21",
        month: "November",
        year: "2025",
        type: "High Current",
        detail: "OHC 5"
    },
    {
        date: "21",
        month: "November",
        year: "2025",
        type: "High Current",
        detail: "OHC 3"
    },
    {
        date: "21",
        month: "November",
        year: "2025",
        type: "High Current",
        detail: "OHC 5"
    },
    {
        date: "21",
        month: "November",
        year: "2025",
        type: "High Current",
        detail: "OHC 3"
    },
    {
        date: "21",
        month: "November",
        year: "2025",
        type: "High Temp",
        detail: "OHC 5"
    },
];

async function main() {
    for (const warning of warningData) {
        await prisma.warningRecord.create({
            data: warning
        });
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });