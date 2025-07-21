"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminDashboardData = void 0;
// src/domain/entities/adminDashboard.entity.ts
const mongoose_1 = require("mongoose");
class AdminDashboardData {
    constructor(statistics, sales, topTheaters, topShows, theaterStatus) {
        this.statistics = statistics;
        this.sales = sales;
        this.topTheaters = topTheaters;
        this.topShows = topShows;
        this.theaterStatus = theaterStatus;
    }
    static fromMongo(data) {
        return new AdminDashboardData({
            totalRevenue: Number(data.statistics.totalRevenue.toFixed(2)),
            totalBookings: data.statistics.totalBookings,
            totalTheaters: data.statistics.totalTheaters,
            averageRating: Number(data.statistics.averageRating.toFixed(1)),
        }, data.sales.map((s) => ({
            name: s.name,
            revenue: Number(s.revenue.toFixed(2)),
        })), data.topTheaters.map((t, index) => ({
            id: new mongoose_1.Types.ObjectId(t._id),
            name: t.name,
            location: t.location,
            revenue: Number(t.revenue.toFixed(2)),
            bookings: t.bookings,
            rating: Number(t.rating.toFixed(1)),
            growth: Number(t.growth.toFixed(1)),
            rank: index + 1,
        })), data.topShows.map((s) => ({
            id: new mongoose_1.Types.ObjectId(s._id),
            title: s.title,
            genre: s.genre,
            duration: s.duration,
            rating: Number(s.rating.toFixed(1)),
            bookings: s.bookings,
            revenue: Number(s.revenue.toFixed(2)),
            poster: s.poster,
            isHot: s.isHot,
        })), data.theaterStatus.map((ts) => ({
            name: ts.name,
            value: ts.value,
            color: ts.color,
        })));
    }
}
exports.AdminDashboardData = AdminDashboardData;
