import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import { AdminDashboardService, AdminDashboardRange } from '../services/adminDashboardService.js';

export class AdminDashboardController {
  static getAdminStats = async (req: AuthRequest, res: Response) => {
    const VALID: AdminDashboardRange[] = ['7d', '30d', '90d'];
    const requested = req.query.range as AdminDashboardRange;
    const range: AdminDashboardRange = VALID.includes(requested) ? requested : '30d';

    const stats = await AdminDashboardService.getAdminStats(range);
    res.json({ success: true, data: stats });
  };
}
