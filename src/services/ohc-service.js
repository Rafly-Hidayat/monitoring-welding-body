import moment from 'moment-timezone';
import cron from 'node-cron';
import prisma from "../database.js";
import assetService from './asset-service.js';

moment.tz.setDefault("Asia/Jakarta");

const MONITORING_CONFIG = {
    UPDATE_INTERVAL: 1000,
    WORKING_HOURS: {
        SHIFT_1: { start: 7, end: 15 },
        SHIFT_2: { start: 16, end: 24 }
    },
    THRESHOLDS: {
        MOTOR_CURRENT: {
            MIN: 261,
            MAX: 290
        },
        MOTOR_TEMP: {
            MIN: 112,
            MAX: 125
        }
    }
};

export class TimeUtils {
    static isWorkingDay() {
        const now = moment();
        const day = now.day();
        return day >= 1 && day <= 5;
    }

    static isWorkingHours() {
        const now = moment();
        const hour = now.hour();
        const { SHIFT_1, SHIFT_2 } = MONITORING_CONFIG.WORKING_HOURS;

        const isShift1 = hour >= SHIFT_1.start && hour < SHIFT_1.end;
        const isShift2 = hour >= SHIFT_2.start && hour < SHIFT_2.end;

        return isShift1 || isShift2;
    }

    static formatDuration(seconds) {
        return moment.utc(seconds * 1000).format('HH:mm:ss');
    }

    static formatTime(momentDate) {
        return momentDate.format('HH:mm:ss');
    }

    static getCurrentTimestamp() {
        return moment();
    }
}

export class MetricsCalculator {
    static calculateEfficiency(runningTime, stopTime) {
        const total = Number(runningTime) + Number(stopTime);
        return total > 0 ? Number((Number(runningTime) / total) * 100).toFixed(1) : '0.0';
    }

    static calculatePerformance(okCondition, ngCondition) {
        const total = Number(okCondition) + Number(ngCondition);
        return total > 0 ? Number((Number(okCondition) / total) * 100).toFixed(1) : '0.0';
    }

    static isOutOfRange(value, min, max) {
        return value < min || value > max;
    }

    static checkAbnormalities(data) {
        const { MOTOR_CURRENT, MOTOR_TEMP } = MONITORING_CONFIG.THRESHOLDS;

        return [
            this.isOutOfRange(Number(data.currentMotorLifterAsset.value), MOTOR_CURRENT.MIN, MOTOR_CURRENT.MAX),
            this.isOutOfRange(Number(data.currentMotorTransferAsset.value), MOTOR_CURRENT.MIN, MOTOR_CURRENT.MAX),
            this.isOutOfRange(Number(data.tempMotorLifterAsset.value), MOTOR_TEMP.MIN, MOTOR_TEMP.MAX),
            this.isOutOfRange(Number(data.tempMotorTransferAsset.value), MOTOR_TEMP.MIN, MOTOR_TEMP.MAX)
        ].filter(Boolean).length;
    }
}

export class OHCMonitoringSystem {
    async updateOHCs() {
        // Get all OHCs before update
        const ohcs = await prisma.ohc.findMany({
            include: { sp: true, asset: true }
        });

        // Use asset service to update base values
        // await assetService.updateAssetInterval();

        const allSaveOhc = ohcs.filter(ohc => ohc.asset.value === '0');
        const defaultPerformance = ohcs.length > 0 ? ((allSaveOhc.length / ohcs.length) * 100).toFixed(1) : '0.0';

        // Update calculated metrics for each OHC
        for (const ohc of ohcs) {
            const { status, isRunning, isStopped } = this.determineStatus(ohc);

            const runningTime = Number(ohc.runningTime) + (isRunning ? 1 : 0);
            const stopTime = Number(ohc.stopTime) + (isStopped ? 1 : 0);

            // Get latest OHC data after asset service update
            const updatedOhc = await prisma.ohc.findUnique({
                where: { id: ohc.id },
                include: {
                    currentMotorLifterAsset: { select: { value: true } },
                    currentMotorTransferAsset: { select: { value: true } },
                    tempMotorLifterAsset: { select: { value: true } },
                    tempMotorTransferAsset: { select: { value: true } },
                }
            });

            // Calculate metrics
            const efficiency = MetricsCalculator.calculateEfficiency(runningTime, stopTime);
            const performance = MetricsCalculator.calculatePerformance(ohc.okCondition, ohc.ngCondition);
            const abnormalityCount = MetricsCalculator.checkAbnormalities(updatedOhc);

            // Update OHC with new calculations
            await prisma.ohc.update({
                where: { id: ohc.id },
                data: {
                    status,
                    runningTime: runningTime,
                    stopTime: stopTime,
                    efficiency: parseFloat(efficiency),
                    // performance: parseFloat(performance),
                    performance: parseFloat(defaultPerformance),
                    abnormalityCount
                }
            });
        }
    }

    determineStatus(ohc) {
        if (ohc.asset.value != "0") return { status: 'NG', isRunning: false, isStopped: true };
        switch (ohc.sp[0]?.name ?? '') {
            case 'SP8':
                return { status: 'Ready', isRunning: true, isStopped: false };
            case 'SP0':
                return { status: 'Repair', isRunning: true, isStopped: false };
            default:
                return { status: '', isRunning: false, isStopped: false };
        }
    }

    async getOHCMetrics() {
        const ohcData = await prisma.ohc.findMany({
            orderBy: { name: 'asc' },
            include: {
                asset: true,
                sp: true,
                cycle: { include: { cycleDescription: true } },
                ohcDescriptions: { include: { asset: true } },
                currentMotorLifterAsset: { select: { value: true } },
                currentMotorTransferAsset: { select: { value: true } },
                tempMotorLifterAsset: { select: { value: true } },
                tempMotorTransferAsset: { select: { value: true } },
            }
        });

        const sp = await prisma.sp.findMany({
            orderBy: { name: 'asc' },
            include: {
                ohc: { select: { name: true } },
                cycle: { include: { cycleDescription: true } },
                spDescriptions: { include: { asset: true } },
            }
        });

        // Contoh fungsi helper untuk mengkonversi BigInt
        const convertBigIntToNumber = (data) => {
            return JSON.parse(JSON.stringify(data, (key, value) =>
                typeof value === 'bigint'
                    ? Number(value)
                    : value
            ));
        };

        // Penggunaan
        let ohcs = convertBigIntToNumber(ohcData);
        const summary = {
            runningTime: TimeUtils.formatDuration(ohcs.reduce((sum, ohc) => sum + Number(ohc.runningTime), 0) / ohcs.length),
            stopTime: TimeUtils.formatDuration(ohcs.reduce((sum, ohc) => sum + Number(ohc.stopTime), 0) / ohcs.length),
            efficiency: (ohcs.reduce((sum, ohc) => sum + Number(ohc.efficiency), 0) / ohcs.length).toFixed(1),
            // performance: (ohcs.reduce((sum, ohc) => sum + Number(ohc.performance), 0) / ohcs.length).toFixed(1),
            performance: ohcs[1].performance,
        };

        const generateTimePoints = () => {
            const timePoints = [];
            for (let hour = 0; hour < 24; hour++) {
                for (let minute of [0, 30]) {
                    const time = moment().hour(hour).minute(minute).format('HH:mm');
                    timePoints.push(time);
                }
            }
            return timePoints;
        };

        const timePoints = generateTimePoints();
        function isAbnormal(value, min, max) {
            return value < min || value > max;
        }
        const { MOTOR_CURRENT, MOTOR_TEMP } = MONITORING_CONFIG.THRESHOLDS;

        // Ambil data history 24 jam terakhir
        const startTime = moment().subtract(24, 'hours').toDate();

        // Ambil history untuk semua OHC
        const histories = await prisma.oHCMonitoringHistory.findMany({
            where: {
                timestamp: {
                    gte: startTime
                }
            },
            orderBy: {
                timestamp: 'asc'
            }
        });

        // Kelompokkan history berdasarkan OHC
        const historyByOhc = histories.reduce((acc, history) => {
            if (!acc[history.ohcId]) {
                acc[history.ohcId] = [];
            }
            acc[history.ohcId].push(history);
            return acc;
        }, {});

        ohcs = ohcs.map(element => {
            const ohcHistory = historyByOhc[element.id] || [];

            const monitoringData = {
                currentLifter: {
                    abnormal: isAbnormal(Number(element.currentMotorLifterAsset.value), MOTOR_CURRENT.MIN, MOTOR_CURRENT.MAX),
                    data: ohcHistory.map(h => ({
                        time: moment(h.timestamp).format('HH:mm'),
                        value: h.currentMotorLifter
                    }))
                },
                currentTransfer: {
                    abnormal: isAbnormal(Number(element.currentMotorTransferAsset.value), MOTOR_CURRENT.MIN, MOTOR_CURRENT.MAX),
                    data: ohcHistory.map(h => ({
                        time: moment(h.timestamp).format('HH:mm'),
                        value: h.currentMotorTransfer
                    }))
                },
                tempLifter: {
                    abnormal: isAbnormal(Number(element.tempMotorLifterAsset.value), MOTOR_TEMP.MIN, MOTOR_TEMP.MAX),
                    data: ohcHistory.map(h => ({
                        time: moment(h.timestamp).format('HH:mm'),
                        value: h.tempMotorLifter
                    }))
                },
                tempTransfer: {
                    abnormal: isAbnormal(Number(element.tempMotorTransferAsset.value), MOTOR_TEMP.MIN, MOTOR_TEMP.MAX),
                    data: ohcHistory.map(h => ({
                        time: moment(h.timestamp).format('HH:mm'),
                        value: h.tempMotorTransfer
                    }))
                }
            };

            return {
                ...element,
                monitoringData,
                runningTime: TimeUtils.formatDuration(element.runningTime),
                stopTime: TimeUtils.formatDuration(element.stopTime),
                cycleTime: TimeUtils.formatDuration(element.cycleTime)
            }
        });

        return { summary, ohcs, sp };
    }
}

export class OHCMonitoringService {
    constructor() {
        this.ohcSystem = new OHCMonitoringSystem();
        this.monitoringJob = null;
        this.shift1Job = null;
        this.shift2Job = null;
    }

    startMonitoringJob() {
        this.monitoringJob = setInterval(async () => {
            await this.ohcSystem.updateOHCs();
            await this.logStatus();
        }, MONITORING_CONFIG.UPDATE_INTERVAL);

        console.log('Monitoring started:', TimeUtils.formatTime(TimeUtils.getCurrentTimestamp()));
    }

    stopMonitoringJob() {
        if (this.monitoringJob) {
            clearInterval(this.monitoringJob);
            this.monitoringJob = null;
            console.log('Monitoring stopped:', TimeUtils.formatTime(TimeUtils.getCurrentTimestamp()));
        }
    }

    setupCronJobs() {
        // Schedule Shift 1 start (Monday-Friday at 7:00)
        this.shift1Job = cron.schedule('0 7 * * 1-5', () => {
            console.log('Starting Shift 1 monitoring');
            this.startMonitoringJob();
        }, {
            timezone: "Asia/Jakarta"
        });

        // Schedule Shift 1 end (Monday-Friday at 15:00)
        cron.schedule('0 15 * * 1-5', () => {
            console.log('Ending Shift 1 monitoring');
            this.stopMonitoringJob();
        }, {
            timezone: "Asia/Jakarta"
        });

        // Schedule Shift 2 start (Monday-Friday at 16:00)
        this.shift2Job = cron.schedule('0 16 * * 1-5', () => {
            console.log('Starting Shift 2 monitoring');
            this.startMonitoringJob();
        }, {
            timezone: "Asia/Jakarta"
        });

        // Schedule Shift 2 end (Monday-Friday at 24:00/00:00)
        cron.schedule('0 0 * * 2-6', () => {
            console.log('Ending Shift 2 monitoring');
            this.stopMonitoringJob();
        }, {
            timezone: "Asia/Jakarta"
        });

        // Tambahkan job untuk menyimpan history setiap 30 menit
        cron.schedule('*/30 * * * *', async () => {
            console.log('Saving monitoring history');
            await this.saveMonitoringHistory();
        }, {
            timezone: "Asia/Jakarta"
        });

        console.log('Cron jobs scheduled for monitoring');
    }

    async saveMonitoringHistory() {
        const ohcs = await prisma.ohc.findMany({
            include: {
                currentMotorLifterAsset: true,
                currentMotorTransferAsset: true,
                tempMotorLifterAsset: true,
                tempMotorTransferAsset: true,
            }
        });

        const timestamp = moment().startOf('minute');

        for (const ohc of ohcs) {
            await prisma.oHCMonitoringHistory.create({
                data: {
                    ohcId: ohc.id,
                    timestamp: timestamp.toDate(),
                    currentMotorLifter: Number(ohc.currentMotorLifterAsset.value),
                    currentMotorTransfer: Number(ohc.currentMotorTransferAsset.value),
                    tempMotorLifter: Number(ohc.tempMotorLifterAsset.value),
                    tempMotorTransfer: Number(ohc.tempMotorTransferAsset.value)
                }
            });
        }
    }

    async logStatus() {
        await this.ohcSystem.getOHCMetrics();
    }

    async start() {
        this.setupCronJobs();
        console.log('start')

        // If we're starting during working hours, begin monitoring immediately
        const now = moment();
        const hour = now.hour();
        const isWorkday = now.day() >= 1 && now.day() <= 5;

        // if (isWorkday) {
        const { SHIFT_1, SHIFT_2 } = MONITORING_CONFIG.WORKING_HOURS;
        if ((hour >= SHIFT_1.start && hour < SHIFT_1.end) ||
            (hour >= SHIFT_2.start && hour < SHIFT_2.end)) {
            this.startMonitoringJob();
        }
        // }
    }

    stop() {
        this.stopMonitoringJob();
        if (this.shift1Job) {
            this.shift1Job.stop();
        }
        if (this.shift2Job) {
            this.shift2Job.stop();
        }
        console.log('Monitoring system stopped');
    }
}