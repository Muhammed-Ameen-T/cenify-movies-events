import mongoose, { ObjectId, Schema } from 'mongoose';

export class RegisterVendorDTO {
  constructor(
    public name: string,
    public email: string,
    public phone: number,
    public password: string,
    public accountType: 'theater' | 'event',
  ) {}
}

export class LoginVendorDTO {
  constructor(
    public email: string,
    public password: string,
  ) {}
}
export class SendOtpVendorDTO {
  constructor(public email: string) {}
}
export class VerifyOtpVendorDTO {
  constructor(
    public name: string,
    public email: string,
    public password: string,
    public phone: number,
    public otp: string,
  ) {}
}

export class TheaterDetailsDTO {
  constructor(
    public name: string,
    public location: {
      city: string;
      coordinates: number[];
      type: string;
    },
    public facilities: {
      foodCourt: boolean;
      lounges: boolean;
      mTicket: boolean;
      parking: boolean;
      freeCancellation: boolean;
    },
    public intervalTime: string,
    public gallery: string[],
    public email: string,
    public phone: string,
    public description: string,
    public vendorId: string | undefined,
  ) {}
}

export class UpdateTheaterDetailsDTO {
  constructor(
    public _id: string,
    public location?: {
      city: string;
      coordinates: number[];
      type: string;
    },
    public facilities?: {
      foodCourt: boolean;
      lounges: boolean;
      mTicket: boolean;
      parking: boolean;
      freeCancellation: boolean;
    },
    public intervalTime?: string,
    public gallery?: string[],
    public description?: string,
  ) {}
}

export class AuthResponseDTO {
  constructor(
    public token: string,
    public theater: {
      id: string;
      email: string;
      name: string;
    },
  ) {}
}

// src/application/dtos/vendor.dto.ts
export class TheaterResponseDTO {
  constructor(
    public id: string,
    public name: string,
    public status: string,
    public location: {
      city: string | null;
      coordinates: number[] | null;
      type: string | null;
    } | null,
    public facilities: {
      foodCourt: boolean | null;
      lounges: boolean | null;
      mTicket: boolean | null;
      parking: boolean | null;
      freeCancellation: boolean | null;
    } | null,
    public intervalTime: number | null,
    public gallery: string[] | null,
    public email: string | null,
    public phone: number | null,
    public rating: number | null,
    public ratingCount: number | null,
    public description: string | null,
    public vendorId: {
      id: string;
      name: string;
      email: string;
      phone: number;
    } | null,
    public createdAt: Date | null,
    public updatedAt: Date | null,
  ) {}
}

export interface IVendorSM {
  _id: string;
  name: string;
  email: string;
  phone: number;
}
