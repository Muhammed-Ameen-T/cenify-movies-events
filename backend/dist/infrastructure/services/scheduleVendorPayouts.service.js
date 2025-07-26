"use strict";
// import { inject, injectable } from 'tsyringe';
// import Agenda from 'agenda';
// import { IProcessVendorPayout } from '../../domain/interfaces/useCases/User/ProcessVendorPayoutUseCase.interface';
// import { env } from '../../config/env.config';
// import { SuccessMsg } from '../../utils/constants/commonSuccessMsg.constants';
// import { CustomError } from '../../utils/errors/custom.error';
// import { HttpResCode } from '../../utils/constants/httpResponseCode.utils';
// @injectable()
// export class VendorPayoutJobService {
//   private agenda: Agenda;
//   constructor(
//     @inject('IProcessVendorPayout') private readonly payoutUseCase: IProcessVendorPayout,
//   ) {
//     this.agenda = new Agenda({
//       db: {
//         address: env.MONGO_URI,
//         collection: 'agendaJobs',
//       },
//       processEvery: '30 minutes',
//       maxConcurrency: 5,
//     });
//     this.defineJobs();
//   }
//   private defineJobs(): void {
//     this.agenda.define('monthly vendor payout', async () => {
//       try {
//         const result = await this.payoutUseCase.execute();
//         console.log(`[VendorPayoutJobService] ✅ Payout for ${result.length} vendors completed.`);
//         result.forEach(({ vendorId, gross, net }) => {
//           console.log(`→ Vendor ${vendorId}: Gross ₹${gross}, Net ₹${net}`);
//         });
//       } catch (error: any) {
//         console.error(`[VendorPayoutJobService] ❌ Payout failed: ${error.message}`);
//       }
//     });
//   }
//   async register(): Promise<void> {
//     try {
//       await this.agenda.every('0 3 1 * *', 'monthly vendor payout');
//       console.log('[VendorPayoutJobService] 🔁 Job registered: monthly vendor payout');
//     } catch (error: any) {
//       console.error('[VendorPayoutJobService] ❌ Failed to register job:', error.message);
//       throw new CustomError('Failed to register vendor payout job', HttpResCode.INTERNAL_SERVER_ERROR);
//     }
//   }
//   async startAgenda(): Promise<void> {
//     try {
//       await this.agenda.start();
//       console.log(SuccessMsg.AGENDA_STARTED);
//     } catch (error: any) {
//       console.error('[VendorPayoutJobService] ❌ Failed to start Agenda:', error.message);
//       throw new CustomError('Failed to start Agenda', HttpResCode.INTERNAL_SERVER_ERROR);
//     }
//   }
// }
