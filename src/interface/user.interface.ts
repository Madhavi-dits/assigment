export interface IUSER {
    id? : string;
    firstName?: string;
    lastName? : string;
    email? : string;
    phoneNumber?: string;
    password?: string;
    address?: string;
    gender? : string;
    dob?: String;
    resetToken? : string;
    resetTokenExpires? : Date;
    refreshToken? : string;
    otp?: string;
    otpExpiration?: Date;
}

export interface IEMAILREQUEST{
    email?: string
}

export interface IEMAILRESPONSE{
    statusCode?: string,
    message?: string
}
