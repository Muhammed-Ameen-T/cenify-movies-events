"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardData = void 0;
// src/domain/entities/dashboard.entity.ts
const mongoose_1 = require("mongoose");
class DashboardData {
    constructor(statistics, monthlyRevenue, occupancyRate, topSellingShows, topTheaters) {
        this.statistics = statistics;
        this.monthlyRevenue = monthlyRevenue;
        this.occupancyRate = occupancyRate;
        this.topSellingShows = topSellingShows;
        this.topTheaters = topTheaters;
    }
    static fromMongo(data) {
        return new DashboardData({
            totalRevenue: data.statistics.totalRevenue,
            ticketsSold: data.statistics.ticketsSold,
            activeShows: data.statistics.activeShows,
            averageOccupancy: Number(data.statistics.averageOccupancy.toFixed(2)),
        }, data.monthlyRevenue.map((r) => ({
            name: r.name,
            value: Number(r.value.toFixed(2)),
        })), data.occupancyRate.map((o) => ({
            name: o.name,
            rate: Number(o.rate.toFixed(2)),
        })), data.topSellingShows.map((s) => ({
            id: new mongoose_1.Types.ObjectId(s.id),
            title: s.title,
            tickets: s.tickets,
            revenue: Number(s.revenue.toFixed(2)),
        })), data.topTheaters.map((t) => ({
            id: new mongoose_1.Types.ObjectId(t.id),
            name: t.name,
            tickets: t.tickets,
            revenue: Number(t.revenue.toFixed(2)),
            occupancyRate: Number(t.occupancyRate.toFixed(2)),
        })));
    }
}
exports.DashboardData = DashboardData;
