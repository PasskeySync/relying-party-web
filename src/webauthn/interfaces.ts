import {decode} from "cborg";
import {bufferToBase64url} from "@github/webauthn-json/extended";

export interface CollectedClientData {
    type: string;
    challenge: BufferSource;
    origin: string;
    crossOrigin?: boolean;
    tokenBinding?: any;
}

export function toCompatibleJSON(data: any): string {
    return JSON.stringify(data, (key, value) => {
        if (value instanceof ArrayBuffer || value instanceof Uint8Array) {
            return bufferToBase64url(value as ArrayBuffer)
        }
        return value
    })
}

export interface AttestationObject {
    fmt: string;
    authData: ArrayBuffer;
    attStmt: AttestationStatement;
}

export function decodeAttestationObject(data: Uint8Array): AttestationObject {
    const json = decode(data)
    return {
        fmt: json[0x01],
        authData: json[0x02],
        attStmt: json[0x03],
    }
}

export interface GetAssertionResponse {
    credential: PublicKeyCredentialDescriptor;
    authData: ArrayBuffer;
    signature: ArrayBuffer;
    user: PublicKeyCredentialUserEntity
}

export function decodeGetAssertionResponse(data: Uint8Array): GetAssertionResponse {
    const json = decode(data)
    return {
        credential: json[0x01],
        authData: json[0x02],
        signature: json[0x03],
        user: json[0x04],
    }
}

export interface AuthenticatorData {
    rpIdHash: ArrayBuffer;
    flags: number;
    signCount: number;
    attestedCredentialData?: AttestedCredentialData;
    extensions?: any;
}

export function deserializeAuthenticatorData(data: Uint8Array): AuthenticatorData {
    const rpIdHash = data.slice(0, 32)
    const flags = data[32]
    const signCount = (data[33] << 24) | (data[34] << 16) | (data[35] << 8) | data[36]
    const attestedCredentialData = deserializeAttestedCredentialData(data.slice(37))
    return {
        rpIdHash,
        flags,
        signCount,
        attestedCredentialData
    }
}

export interface AttestedCredentialData {
    aaguid: ArrayBuffer;
    credentialId: ArrayBuffer;
    credentialPublicKey: ArrayBuffer;
}

export function deserializeAttestedCredentialData(data: Uint8Array): AttestedCredentialData {
    const aaguid = data.slice(0, 16)
    const credentialIdLength = (data[16] << 8) | data[17]
    const credentialId = data.slice(18, 18 + credentialIdLength)
    const credentialPublicKey = data.slice(18 + credentialIdLength)
    return {
        aaguid,
        credentialId,
        credentialPublicKey
    }
}

export interface AttestationStatement {
    alg: number;
    sig: ArrayBuffer;
}


export class AuthenticatorRequestCode {
    static readonly AUTHENTICATOR_MAKE_CREDENTIAL = 0x01;
    static readonly AUTHENTICATOR_GET_ASSERTION = 0x02;
    static readonly AUTHENTICATOR_GET_INFO = 0x04;
}

export class AuthenticatorResponseCode {
    static readonly CTAP2_OK = 0x00;
    static readonly CTAP1_ERR_INVALID_COMMAND = 0x01;
    static readonly CTAP1_ERR_INVALID_PARAMETER = 0x02;
    static readonly CTAP2_ERR_UNSUPPORTED_ALGORITHM = 0x26;
    static readonly CTAP2_ERR_CREDENTIAL_EXCLUDED = 0x19;
    static readonly CTAP2_ERR_NO_CREDENTIALS = 0x2E;
    static readonly CTAP2_ERR_INVALID_CREDENTIAL = 0x22;
    static readonly CTAP2_ERR_USER_ACTION_PENDING = 0x23;
    static readonly CTAP2_ERR_OPERATION_DENIED = 0x27;
}

export function getResponseErrorMessage(code: number): string {
    let msg = `error from authenticator ${code}`
    if (code === AuthenticatorResponseCode.CTAP1_ERR_INVALID_COMMAND) {
        msg = "invalid command"
    } else if (code === AuthenticatorResponseCode.CTAP1_ERR_INVALID_PARAMETER) {
        msg = "invalid parameter"
    } else if (code === AuthenticatorResponseCode.CTAP2_ERR_UNSUPPORTED_ALGORITHM) {
        msg = "unsupported algorithm"
    } else if (code === AuthenticatorResponseCode.CTAP2_ERR_CREDENTIAL_EXCLUDED) {
        msg = "already registered this account"
    } else if (code === AuthenticatorResponseCode.CTAP2_ERR_NO_CREDENTIALS) {
        msg = "cannot find registered account"
    } else if (code === AuthenticatorResponseCode.CTAP2_ERR_INVALID_CREDENTIAL) {
        msg = "invalid credential for the authenticator"
    } else if (code === AuthenticatorResponseCode.CTAP2_ERR_USER_ACTION_PENDING) {
        msg = "PasskeySync is occupied by another request"
    } else if (code === AuthenticatorResponseCode.CTAP2_ERR_OPERATION_DENIED) {
        msg = "operation denied"
    }
    return msg
}

export class WebAuthnError extends Error {
}