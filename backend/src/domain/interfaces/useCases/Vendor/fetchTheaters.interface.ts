import { VendorResponseDTO } from "../../../../application/dtos/vendor.dto";

export interface IFetchTheatersUseCase {
    execute(): Promise<VendorResponseDTO[]>;
}