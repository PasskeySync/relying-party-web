export interface CollectedClientData {
    type: string;
    challenge: BufferSource;
    origin: string;
    crossOrigin?: boolean;
    tokenBinding?: any;
}

export class AuthenticatorRequestCode {
    static readonly AUTHENTICATOR_MAKE_CREDENTIAL = 0x01;
    static readonly AUTHENTICATOR_GET_ASSERTION = 0x02;
    static readonly AUTHENTICATOR_GET_INFO = 0x04;
}