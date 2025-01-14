import moment from 'moment-timezone';
import cron from 'node-cron';

moment.tz.setDefault("Asia/Jakarta");
// Existing constants remain the same
const LOCATIONS = {
    SP1: 'SP1',
    SP7: 'SP7',
    SP8: 'SP8'
};

const STATUS = {
    READY: 'Ready',
    REPAIR: 'Repair',
    NG: 'NG'
};

const MONITORING_CONFIG = {
    UPDATE_INTERVAL: 1000,
    WORKING_HOURS: {
        SHIFT_1: { start: 7, end: 15 },
        SHIFT_2: { start: 16, end: 24 }
    },
    THRESHOLDS: {
        MOTOR_CURRENT: {
            MIN: 20,
            MAX: 290
        },
        MOTOR_TEMP: {
            MIN: 112,
            MAX: 125
        }
    }
};

// Types
export class OHCData {
    constructor({
        id,
        location,
        condition,
        runningTime = 0,
        stopTime = 0,
        cycleTime,
        taktTime,
        currentMotorLifter,
        currentMotorTransfer,
        tempMotorLifter,
        tempMotorTransfer,
        okCondition,
        ngCondition
    }) {
        this.id = id;
        this.location = location;
        this.condition = condition;
        this.runningTime = runningTime;
        this.stopTime = stopTime;
        this.cycleTime = cycleTime;
        this.taktTime = taktTime;
        this.currentMotorLifter = currentMotorLifter;
        this.currentMotorTransfer = currentMotorTransfer;
        this.tempMotorLifter = tempMotorLifter;
        this.tempMotorTransfer = tempMotorTransfer;
        this.okCondition = okCondition;
        this.ngCondition = ngCondition;
        this.timestamp = moment();
    }
}

// Utility functions
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

    static getCurrentTimestamp() {
        return moment();
    }

    static formatTime(momentDate) {
        return momentDate.format('HH:mm:ss');
    }
}

export class MetricsCalculator {
    static calculateEfficiency(runningTime, stopTime) {
        const total = runningTime + stopTime;
        return total > 0 ? Number((runningTime / total) * 100).toFixed(1) : '0.0';
    }

    static calculatePerformance(okCondition, ngCondition) {
        const total = okCondition + ngCondition;
        return total > 0 ? Number((okCondition / total) * 100).toFixed(1) : '0.0';
    }

    static isOutOfRange(value, min, max) {
        return value < min || value > max;
    }

    static checkAbnormalities(data) {
        const { MOTOR_CURRENT, MOTOR_TEMP } = MONITORING_CONFIG.THRESHOLDS;

        return [
            this.isOutOfRange(data.currentMotorLifter, MOTOR_CURRENT.MIN, MOTOR_CURRENT.MAX),
            this.isOutOfRange(data.currentMotorTransfer, MOTOR_CURRENT.MIN, MOTOR_CURRENT.MAX),
            this.isOutOfRange(data.tempMotorLifter, MOTOR_TEMP.MIN, MOTOR_TEMP.MAX),
            this.isOutOfRange(data.tempMotorTransfer, MOTOR_TEMP.MIN, MOTOR_TEMP.MAX)
        ].filter(Boolean).length;
    }

    static calculateAverageRunningTime(ohcData) {
        const runningTimes = Array.from(ohcData.values())
            .map(metrics => metrics.get('runningTime'));
        return runningTimes.reduce((sum, time) => sum + time, 0) / 6;
    }

    static calculateAverageStopTime(ohcData) {
        const stopTimes = Array.from(ohcData.values())
            .map(metrics => metrics.get('stopTime'));
        return stopTimes.reduce((sum, time) => sum + time, 0) / 6;
    }

    static calculateAverageEfficiency(ohcData) {
        const efficiencies = Array.from(ohcData.values())
            .map(metrics => parseFloat(metrics.get('efficiency')));
        return (efficiencies.reduce((sum, eff) => sum + eff, 0) / 6).toFixed(1);
    }

    static calculateAveragePerformance(ohcData) {
        const performances = Array.from(ohcData.values())
            .map(metrics => parseFloat(metrics.get('performance')));
        return (performances.reduce((sum, perf) => sum + perf, 0) / 6).toFixed(1);
    }

    static generateMetricsSummary(ohcData) {
        return {
            runningTime: TimeUtils.formatDuration(this.calculateAverageRunningTime(ohcData)),
            stopTime: TimeUtils.formatDuration(this.calculateAverageStopTime(ohcData)),
            efficiency: this.calculateAverageEfficiency(ohcData),
            performance: this.calculateAveragePerformance(ohcData)
        };
    }
}

export class StatusManager {
    static determineStatus(location) {
        switch (location) {
            case LOCATIONS.SP8:
                return { status: STATUS.READY, isRunning: true, isStopped: false };
            case LOCATIONS.SP7:
                return { status: STATUS.REPAIR, isRunning: true, isStopped: false };
            case LOCATIONS.SP1:
                return { status: STATUS.NG, isRunning: false, isStopped: true };
            default:
                return { status: '', isRunning: false, isStopped: false };
        }
    }
}

export class OHCMonitoringSystem {
    constructor() {
        this.ohcData = new Map();
    }

    addOHCStatus(id, data) {
        try {
            const ohcData = new OHCData({ id, ...data });
            const { status } = StatusManager.determineStatus(data.location);

            const metrics = new Map([
                ['id', id],
                ['location', data.location],
                ['condition', data.condition],
                ['status', status],
                ['runningTime', data.runningTime],
                ['stopTime', data.stopTime],
                ['cycleTime', data.cycleTime],
                ['taktTime', data.taktTime],
                ['efficiency', MetricsCalculator.calculateEfficiency(data.runningTime, data.stopTime)],
                ['performance', MetricsCalculator.calculatePerformance(data.okCondition, data.ngCondition)],
                ['currentMotorLifter', data.currentMotorLifter],
                ['currentMotorTransfer', data.currentMotorTransfer],
                ['tempMotorLifter', data.tempMotorLifter],
                ['tempMotorTransfer', data.tempMotorTransfer],
                ['timestamp', TimeUtils.getCurrentTimestamp()],
                ['abnormalityCount', MetricsCalculator.checkAbnormalities(data)]
            ]);

            this.ohcData.set(id, metrics);
            return metrics;
        } catch (error) {
            console.error(`Error adding OHC status for ID ${id}:`, error);
            throw error;
        }
    }

    updateOHCStatus(id, data) {
        try {
            const ohc = this.ohcData.get(id);
            if (!ohc) {
                throw new Error(`OHC with ID ${id} not found`);
            }

            const { status, isRunning, isStopped } = StatusManager.determineStatus(data.location);

            const runningTime = ohc.get('runningTime') + (isRunning ? 1 : 0);
            const stopTime = ohc.get('stopTime') + (isStopped ? 1 : 0);

            const updatedMetrics = {
                ...data,
                runningTime,
                stopTime
            };

            return this.addOHCStatus(id, updatedMetrics);
        } catch (error) {
            console.error(`Error updating OHC status for ID ${id}:`, error);
            throw error;
        }
    }

    monitorOHC(id) {
        return this.ohcData.get(id) || null;
    }

    monitorAllOHC() {
        return this.ohcData;
    }
}

export class OHCMonitoringService {
    constructor() {
        this.ohcSystem = new OHCMonitoringSystem();
        this.monitoringJob = null;
        this.shift1Job = null;
        this.shift2Job = null;
        this.initializeOHCs();
    }

    initializeOHCs() {
        // Initialize OHCs from ID 1 to 6 (inclusive)
        for (let i = 1; i <= 6; i++) {
            this.ohcSystem.addOHCStatus(i, {
                location: `SP${i}`,
                condition: 'No Body',
                runningTime: 0,
                stopTime: 0,
                cycleTime: 98,
                taktTime: 98,
                currentMotorLifter: 230,
                currentMotorTransfer: 150,
                tempMotorLifter: 60,
                tempMotorTransfer: 40,
                okCondition: 843,
                ngCondition: 157,
            });
        }
    }

    startMonitoringJob() {
        // Create an interval job that updates OHC status every second
        this.monitoringJob = setInterval(() => {
            this.updateOHCs();
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

        console.log('Cron jobs scheduled for monitoring');
    }

    updateOHCs() {
        const getRandomVariation = (base, range) =>
            base + (Math.random() * range * 2 - range);

        const getRandomSPLocation = () => `SP${Math.floor(Math.random() * 8) + 1}`;

        const updateData = {
            condition: 'No Body',
            cycleTime: getRandomVariation(98, 5),
            taktTime: getRandomVariation(98, 5),
            currentMotorLifter: getRandomVariation(230, 20),
            currentMotorTransfer: getRandomVariation(150, 15),
            tempMotorLifter: getRandomVariation(60, 5),
            tempMotorTransfer: getRandomVariation(40, 5),
            okCondition: Math.floor(getRandomVariation(843, 50)),
            ngCondition: Math.floor(getRandomVariation(157, 20)),
        };

        // Instead of fixed locations, generate random ones
        const updates = Array.from({ length: 6 }, (_, index) => ({
            id: index + 1,
            location: getRandomSPLocation()
        }));

        updates.forEach(({ id, location }) => {
            this.ohcSystem.updateOHCStatus(id, { ...updateData, location });
        });

        this.logStatus();
    }

    logStatus() {
        console.log('Updating OHCs at:', TimeUtils.formatTime(TimeUtils.getCurrentTimestamp()));

        const ohcData = this.ohcSystem.monitorAllOHC();
        const summary = MetricsCalculator.generateMetricsSummary(ohcData);

        const ohcs = [];
        Array.from(ohcData.values()).forEach(element => {
            ohcs.push(JSON.parse(JSON.stringify(Object.fromEntries(element))))
        });

        console.log({ summary, ohcs });
    }

    // Method to start the entire monitoring system
    start() {
        this.setupCronJobs();

        // If we're starting during working hours, begin monitoring immediately
        const now = moment();
        const hour = now.hour();
        const isWorkday = now.day() >= 1 && now.day() <= 5;

        console.log(isWorkday)
        if (isWorkday) {
            const { SHIFT_1, SHIFT_2 } = MONITORING_CONFIG.WORKING_HOURS;
            console.log(hour)
            console.log('shift 1')
            console.log(SHIFT_1.start)
            console.log(SHIFT_1.end)
            
            console.log('shift 2')
            console.log(SHIFT_2.start)
            console.log(SHIFT_2.end)
            if ((hour >= SHIFT_1.start && hour < SHIFT_1.end) ||
                (hour >= SHIFT_2.start && hour < SHIFT_2.end)) {
                this.startMonitoringJob();
            }
        }
    }

    // Method to stop the entire monitoring system
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