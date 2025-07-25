export class SendOtpPhoneRequestDTO {
  constructor(
    public phone: string,
    public userId: string,
  ) {}
}

export class VerifyOtpPhoneRequestDTO {
  constructor(
    public phone: string,
    public otp: string,
    public userId: string,
  ) {}
}
