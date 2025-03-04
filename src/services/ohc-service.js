import moment from 'moment-timezone';
import cron from 'node-cron';
import prisma from "../database.js";
import NodeCache from 'node-cache'
import assetService from './asset-service.js';
import { updateCycleValidation } from '../validation/ohc-schema.js';
import { validation } from '../validation/validation.js';
import 'moment/locale/id.js';
import dataHelper from '../helper/data-helper.js';
import { ResponseError } from '../err/err-response.js';

moment.tz.setDefault("Asia/Jakarta");

const MONITORING_CONFIG = {
    UPDATE_INTERVAL: 1000,
    WORKING_HOURS: {
        SHIFT_1: { start: 7, end: 15 },
        SHIFT_2: { start: 15, end: 24 }
    },
    THRESHOLDS: {
        MOTOR_CURRENT: {
            MIN: 70,
            MAX: 90
        },
        MOTOR_TEMP: {
            MIN: 70,
            MAX: 90
        }
    }
};

const cache = new NodeCache({ stdTTL: 6000 });

// Cache mapping dan threshold
const getThresholds = () => {
    const cacheKey = 'thresholds';
    let thresholds = cache.get(cacheKey);
    if (!thresholds) {
        thresholds = MONITORING_CONFIG.THRESHOLDS;
        cache.set(cacheKey, thresholds);
    }
    return thresholds;
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
        const { MOTOR_CURRENT, MOTOR_TEMP } = getThresholds();

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
            // const updatedOhc = await prisma.ohc.findUnique({
            //     where: { id: ohc.id },
            //     include: {
            //         currentMotorLifterAsset: { select: { value: true } },
            //         currentMotorTransferAsset: { select: { value: true } },
            //         tempMotorLifterAsset: { select: { value: true } },
            //         tempMotorTransferAsset: { select: { value: true } },
            //     }
            // });

            // Calculate metrics
            const efficiency = MetricsCalculator.calculateEfficiency(runningTime, stopTime);
            const performance = MetricsCalculator.calculatePerformance(ohc.okCondition, ohc.ngCondition);
            // const abnormalityCount = MetricsCalculator.checkAbnormalities(updatedOhc);

            // Update OHC with new calculations
            prisma.ohc.update({
                where: { id: ohc.id },
                data: {
                    status,
                    runningTime: runningTime,
                    stopTime: stopTime,
                    efficiency: parseFloat(efficiency),
                    // performance: parseFloat(performance),
                    performance: parseFloat(defaultPerformance),
                    abnormalityCount: 0
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

    async getOHCMetrics(message = null) {
        const ohcData = await prisma.ohc.findMany({
            orderBy: { name: 'asc' },
            include: {
                asset: true,
                sp: true,
                cycle: { include: { cycleDescription: true } },
                ohcConditions: true,
                ohcConditionRecord: true,
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
                spConditions: { include: { asset: true } },
                spConditionRecord: true,
            }
        });

        const convertBigIntToNumber = (data) => {
            return JSON.parse(JSON.stringify(data, (key, value) =>
                typeof value === 'bigint'
                    ? Number(value)
                    : value
            ));
        };

        let ohcs = convertBigIntToNumber(ohcData);
        const summary = {
            runningTime: TimeUtils.formatDuration(ohcs.reduce((sum, ohc) => sum + Number(ohc.runningTime), 0) / ohcs.length),
            stopTime: TimeUtils.formatDuration(ohcs.reduce((sum, ohc) => sum + Number(ohc.stopTime), 0) / ohcs.length),
            efficiency: (ohcs.reduce((sum, ohc) => sum + Number(ohc.efficiency), 0) / ohcs.length).toFixed(1),
            performance: ohcs[1].performance,
        };

        function getIndicator(currentValue, history, threshold) {
            if (currentValue < threshold.MAX) {
                return "hijau";
            }

            // Check if current value equals or exceeds MAX
            if (currentValue >= threshold.MAX) {
                const lastThreeValues = history.slice(-3).map(h => h.value);

                // If have 3 consecutive values above MAX
                if (lastThreeValues.length === 3 &&
                    lastThreeValues.every(val => val > threshold.MAX)) {
                    return "merah";
                }
                return "kuning";
            }

            return "hijau";
        }

        const { MOTOR_CURRENT, MOTOR_TEMP } = getThresholds();

        const startTime = moment().subtract(24, 'hours').toDate();

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

        const historyByOhc = histories.reduce((acc, history) => {
            if (!acc[history.ohcId]) {
                acc[history.ohcId] = [];
            }
            acc[history.ohcId].push(history);
            return acc;
        }, {});

        ohcs = ohcs.map(element => {
            const ohcHistory = historyByOhc[element.id] || [];

            const monitoringGraphic = {
                currentLifter: {
                    indicator: getIndicator(
                        Number(element.currentMotorLifterAsset.value),
                        ohcHistory.map(h => ({
                            time: moment(h.timestamp).format('HH:mm'),
                            value: h.currentMotorLifter
                        })),
                        MOTOR_CURRENT
                    ),
                    data: ohcHistory.map(h => ({
                        time: moment(h.timestamp).format('HH:mm'),
                        value: h.currentMotorLifter
                    }))
                },
                currentTransfer: {
                    indicator: getIndicator(
                        Number(element.currentMotorTransferAsset.value),
                        ohcHistory.map(h => ({
                            time: moment(h.timestamp).format('HH:mm'),
                            value: h.currentMotorTransfer
                        })),
                        MOTOR_CURRENT
                    ),
                    data: ohcHistory.map(h => ({
                        time: moment(h.timestamp).format('HH:mm'),
                        value: h.currentMotorTransfer
                    }))
                },
                tempLifter: {
                    indicator: getIndicator(
                        Number(element.tempMotorLifterAsset.value),
                        ohcHistory.map(h => ({
                            time: moment(h.timestamp).format('HH:mm'),
                            value: h.tempMotorLifter
                        })),
                        MOTOR_TEMP
                    ),
                    data: ohcHistory.map(h => ({
                        time: moment(h.timestamp).format('HH:mm'),
                        value: h.tempMotorLifter
                    }))
                },
                tempTransfer: {
                    indicator: getIndicator(
                        Number(element.tempMotorTransferAsset.value),
                        ohcHistory.map(h => ({
                            time: moment(h.timestamp).format('HH:mm'),
                            value: h.tempMotorTransfer
                        })),
                        MOTOR_TEMP
                    ),
                    data: ohcHistory.map(h => ({
                        time: moment(h.timestamp).format('HH:mm'),
                        value: h.tempMotorTransfer
                    }))
                },
                threshold: { MOTOR_CURRENT, MOTOR_TEMP }
            };

            return {
                ...element,
                monitoringGraphic,
                runningTime: TimeUtils.formatDuration(element.runningTime),
                stopTime: TimeUtils.formatDuration(element.stopTime),
                cycleTime: TimeUtils.formatDuration(element.cycleTime)
            }
        });
        const warningRecords = await prisma.warningRecord.findMany({})

        const year = message?.year || moment().format('YYYY');
        const month = message?.month || moment().format('MMMM')

        // Get warning records with filters
        const whereClause = { year };
        if (month) whereClause.month = month;
        // Get type-based statistics
        const typeDataRaw = await prisma.warningRecord.groupBy({
            by: ['type'],
            where: whereClause,
            _count: {
                id: true
            }
        });
        const typeData = typeDataRaw.map(record => ({
            type: record.type,
            count: record._count.id
        }));

        // Get monthly statistics
        const allMonths = Array.from({ length: 12 }, (_, i) =>
            moment().month(i).format('MMMM')
        );
        const baseMonthlyData = allMonths.map(month => ({
            month: month,
            count: 0
        }));


        // Get actual monthly data from database
        const monthlyDataRaw = await prisma.warningRecord.groupBy({
            by: ['month'],
            where: { year },
            _count: {
                id: true
            }
        });

        // Convert English month names to Indonesian and merge with base data
        const monthlyDataMap = monthlyDataRaw.reduce((acc, record) => {
            const indonesianMonth = moment().month(record.month).format('MMMM');
            acc[indonesianMonth] = record._count.id;
            return acc;
        }, {});

        // Merge actual counts with base data
        const monthlyData = baseMonthlyData.map(item => ({
            month: item.month,
            count: monthlyDataMap[item.month] || 0
        }));

        // Get yearly statistics
        const yearlyDataRaw = await prisma.warningRecord.groupBy({
            by: ['year'],
            _count: {
                id: true
            }
        });
        const yearlyData = yearlyDataRaw.map(record => ({
            year: record.year,
            count: record._count.id
        }));

        const warningRecord = {
            data: warningRecords,
            byType: typeData,
            byMonth: monthlyData,
            byYear: yearlyData
        }
        return { summary, ohcs, sp, warningRecord };
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

        // if (TimeUtils.isWorkingDay()) {
        if (TimeUtils.isWorkingHours()) {
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

export const updateCycle = async (request) => {
    const data = validation(updateCycleValidation, request);
    const isOhc = data.isOhc;

    const conditionTable = isOhc ? prisma.ohcCondition : prisma.spCondition;
    const recordTable = isOhc ? prisma.ohcConditionRecord : prisma.spConditionRecord;
    const queryCondition = isOhc
        ? { tagCd: data.tagCd, ohcId: data.ohc }
        : { assetTagCd: data.tagCd };

    const existingCondition = await conditionTable.findFirst({
        where: queryCondition,
        select: {
            id: true,
            value: true,
            name: true,
            standardValue: true,
            actualValue: true,
            spId: isOhc ? false : true,
        }
    });

    if (!existingCondition) {
        throw new ResponseError(404, "Data tagCd not found");
    }

    const updatedData = await conditionTable.update({
        where: { id: existingCondition.id },
        data: { value: data.value },
        select: {
            tagCd: isOhc ? true : false,
            ohcId: isOhc ? true : false,
            assetTagCd: isOhc ? false : true,
            value: true,
            actualValue: true,
            standardValue: true,
        }
    });

    const tagCd = isOhc
        ? `${updatedData.tagCd}${updatedData.ohcId}`
        : updatedData.assetTagCd;

    const valueChanges = [{
        groupName: '',
        tagCd,
        oldValue: existingCondition.value,
        newValue: updatedData.value,
        changed: existingCondition.value !== updatedData.value,
    }];

    const processPromises = [
        assetService.processConditionUpdates(valueChanges, dataHelper.sensorConditionMapping)
    ];

    if (dataHelper.cycleAsset.includes(tagCd)) {
        processPromises.push(
            assetService.processCycleUpdates(valueChanges, dataHelper.sensorCycleMapping)
        );
    }

    if (updatedData.actualValue > updatedData.standardValue) {
        const now = moment();
        const recordData = {
            tagCd: data.tagCd,
            date: now.format('DD'),
            month: now.format('MMMM'),
            year: now.format('YYYY'),
            description: existingCondition.name,
        };

        if (isOhc) {
            recordData.ohcId = data.ohc;
        } else {
            recordData.spId = existingCondition.spId;
        }

        processPromises.push(
            (async () => {
                const recordQueryCondition = isOhc
                    ? { ohcId: data.ohc, tagCd: data.tagCd }
                    : { spId: existingCondition.spId, assetTagCd: data.tagCd };

                const existingRecord = await recordTable.findFirst({
                    where: recordQueryCondition,
                    orderBy: { createdAt: 'desc' },
                    select: { counter: true }
                });

                recordData.counter = existingRecord ? existingRecord.counter + 1 : 1;

                return recordTable.create({ data: recordData });
            })()
        );
    }

    await Promise.all(processPromises);

    return updatedData;
};

export default { MONITORING_CONFIG }