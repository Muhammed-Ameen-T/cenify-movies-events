"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForgotPassVerifyOtpDTO = exports.ForgotPassUpdateDTO = exports.ForgotPassSendOtpDTO = exports.LoginDTO = exports.VerifyOtpDTO = exports.LoginAdminDTO = exports.RefreshTokenRequestDTO = exports.AuthResponseDTO = exports.GoogleAuthRequestDTO = void 0;
class GoogleAuthRequestDTO {
    constructor(idToken) {
        this.idToken = idToken;
    }
}
exports.GoogleAuthRequestDTO = GoogleAuthRequestDTO;
class AuthResponseDTO {
    constructor(accessToken, refreshToken, user) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.user = user;
    }
}
exports.AuthResponseDTO = AuthResponseDTO;
class RefreshTokenRequestDTO {
    constructor(refreshToken) {
        this.refreshToken = refreshToken;
    }
}
exports.RefreshTokenRequestDTO = RefreshTokenRequestDTO;
class LoginAdminDTO {
    constructor(email, password) {
        this.email = email;
        this.password = password;
    }
}
exports.LoginAdminDTO = LoginAdminDTO;
class VerifyOtpDTO {
    constructor(name, email, otp, password) {
        this.name = name;
        this.email = email;
        this.otp = otp;
        this.password = password;
    }
}
exports.VerifyOtpDTO = VerifyOtpDTO;
class LoginDTO {
    constructor(email, password) {
        this.email = email;
        this.password = password;
    }
}
exports.LoginDTO = LoginDTO;
class ForgotPassSendOtpDTO {
    constructor(email) {
        this.email = email;
    }
}
exports.ForgotPassSendOtpDTO = ForgotPassSendOtpDTO;
class ForgotPassUpdateDTO {
    constructor(email, password) {
        this.email = email;
        this.password = password;
    }
}
exports.ForgotPassUpdateDTO = ForgotPassUpdateDTO;
class ForgotPassVerifyOtpDTO {
    constructor(email, otp) {
        this.email = email;
        this.otp = otp;
    }
}
exports.ForgotPassVerifyOtpDTO = ForgotPassVerifyOtpDTO;
