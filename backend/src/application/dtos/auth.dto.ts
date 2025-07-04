export class GoogleAuthRequestDTO {
  constructor(public idToken: string) {}
}

export class AuthResponseDTO {
  constructor(
    public accessToken: string,
    public refreshToken: string,
    public user: {
      id: string;
      name: string;
      email: string | null;
      phone: number | null;
      profileImage: string | null;
      role: string | null;
    },
  ) {}
}

export class RefreshTokenRequestDTO {
  constructor(public refreshToken: string) {}
}

export class LoginAdminDTO {
  constructor(
    public email: string,
    public password: string,
  ) {}
}

export class VerifyOtpDTO {
  constructor(
    public name: string,
    public email: string,
    public otp: string,
    public password: string,
  ) {}
}

export class LoginDTO {
  constructor(
    public email: string,
    public password: string,
  ) {}
}

export class ForgotPassSendOtpDTO {
  constructor(public email: string) {}
}

export class ForgotPassUpdateDTO {
  constructor(
    public email: string,
    public password: string,
  ) {}
}

export class ForgotPassVerifyOtpDTO {
  constructor(
    public email: string,
    public otp: string,
  ) {}
}
