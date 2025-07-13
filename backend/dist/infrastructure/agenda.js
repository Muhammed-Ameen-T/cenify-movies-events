"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeAgenda = initializeAgenda;
const tsyringe_1 = require("tsyringe");
const showAgenda_service_1 = require("../infrastructure/services/showAgenda.service");
const moviePass_service_1 = require("../infrastructure/services/moviePass.service");
async function initializeAgenda() {
    const showJobService = tsyringe_1.container.resolve(showAgenda_service_1.ShowJobService);
    const moviePassJobService = tsyringe_1.container.resolve(moviePass_service_1.MoviePassJobService);
    await Promise.all([showJobService.startAgenda(), moviePassJobService.startAgenda()]);
}
