import { OHCMonitoringService } from "../services/ohc-service.js";
const ohcService = new OHCMonitoringService();

const getOHCMetrics = async (req, res, next) => {
    try {
        const result = await ohcService.ohcSystem.getOHCMetrics();
        res.status(200).json({
            message: "Successfully retrieved ohc",
            data: result
        })
    } catch (error) {
        next(error);
    }
}

export default { getOHCMetrics }