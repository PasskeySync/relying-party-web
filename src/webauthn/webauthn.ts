import {COSEAlgorithmIdentifier} from "@simplewebauthn/typescript-types";
import {
    AuthenticatorRequestCode,
    AuthenticatorResponseCode,
    CollectedClientData,
    decodeAttestationObject,
    decodeGetAssertionResponse,
    deserializeAuthenticatorData,
    getResponseErrorMessage,
    toCompatibleJSON,
    WebAuthnError
} from "./interfaces";
import {encode} from "cborg";
import {bufferToBase64url} from "@github/webauthn-json/extended";

const TIMEOUT_DISCOURAGED_MIN = 30000;
const TIMEOUT_DISCOURAGED_MAX = 180000;
const TIMEOUT_DISCOURAGED_RECOMMEND = 120000;
const TIMEOUT_REQUIRED_MIN = 30000;
const TIMEOUT_REQUIRED_MAX = 600000;
const TIMEOUT_REQUIRED_RECOMMEND = 300000;

const PASSSYNC_PORT = 11107;

/**
 * Algo is specified in https://www.w3.org/TR/webauthn/#sctn-createCredential
 * @param options the options to create the credential
 */
export async function create(options: CredentialCreationOptions): Promise<PublicKeyCredential> {
    return internalCreate(window.location.origin, options, true);
}

async function internalCreate(
    origin: string,
    options: CredentialCreationOptions,
    sameOriginWithAncestors: boolean
): Promise<PublicKeyCredential> {
    if (options.publicKey === undefined) {
        throw new Error("publicKey is undefined");
    }
    if (!sameOriginWithAncestors) {
        throw new DOMException("not same origin", "NotAllowedError");
    }
    const pk = options.publicKey;

    if (pk.authenticatorSelection?.userVerification === "discouraged") {
        if (pk.timeout === undefined) pk.timeout = TIMEOUT_DISCOURAGED_RECOMMEND
        if (pk.timeout < TIMEOUT_DISCOURAGED_MIN) pk.timeout = TIMEOUT_DISCOURAGED_MIN
        if (pk.timeout > TIMEOUT_DISCOURAGED_MAX) pk.timeout = TIMEOUT_DISCOURAGED_MAX
    } else if (pk.authenticatorSelection?.userVerification === "required" ||
        pk.authenticatorSelection?.userVerification === "preferred") {
        if (pk.timeout === undefined) pk.timeout = TIMEOUT_REQUIRED_RECOMMEND
        if (pk.timeout < TIMEOUT_REQUIRED_MIN) pk.timeout = TIMEOUT_REQUIRED_MIN
        if (pk.timeout > TIMEOUT_REQUIRED_MAX) pk.timeout = TIMEOUT_REQUIRED_MAX
    }

    if (pk.user.id.byteLength < 1 || pk.user.id.byteLength > 64) {
        throw new TypeError("user.id must be between 1 and 64 bytes");
    }
    // ignore step #6, #7
    if (pk.rp.id === undefined) {
        pk.rp.id = origin;
    }
    const credTypesAndPubKeyAlgs: PublicKeyCredentialParameters[] = [];
    if (pk.pubKeyCredParams.length === 0) {
        credTypesAndPubKeyAlgs.push(
            {
                type: "public-key",
                alg: -7
            },
            {
                type: "public-key",
                alg: -257
            }
        );
    } else {
        credTypesAndPubKeyAlgs.push(...pk.pubKeyCredParams); // assume all algo are supported
    }

    if (pk.extensions !== undefined) {
        // TODO: deal with extensions
    }

    const collectedClientData: CollectedClientData = {
        type: "webauthn.create",
        challenge: pk.challenge,
        origin: origin,
        crossOrigin: false,
    }
    const clientDataJSON = toCompatibleJSON(collectedClientData)
    const clientDataJSONEncoded = new TextEncoder().encode(clientDataJSON)
    const clientDataHash = await crypto.subtle.digest("SHA-256", clientDataJSONEncoded)
    if (options.signal !== undefined && options.signal.aborted) {
        throw new DOMException("aborted", "AbortError");
    }
    // connect to PasskeySync
    const promise = new Promise<PublicKeyCredential>((resolve, reject) => {
        const ws = new WebSocket(`ws://localhost:${PASSSYNC_PORT}/local`)
        ws.onopen = () => {
            const json = {
                0x01: clientDataHash,
                0x02: pk.rp,
                0x03: pk.user,
                0x04: credTypesAndPubKeyAlgs,
                0x05: pk.excludeCredentials,
            }
            const cbor = encode(json)
            const data = new Uint8Array(cbor.length + 1)
            data[0] = AuthenticatorRequestCode.AUTHENTICATOR_MAKE_CREDENTIAL
            data.set(cbor, 1)
            ws.send(data)
        }
        ws.onerror = () => {
            reject(new WebAuthnError("websocket error"))
        }
        ws.onmessage = async (ev) => {
            if (!(ev.data instanceof Blob)) {
                reject(new WebAuthnError("invalid response for make credential"))
                return
            }
            const data = new Uint8Array(await ev.data.arrayBuffer())
            if (data[0] !== AuthenticatorResponseCode.CTAP2_OK) {
                ws.close()
                reject(new WebAuthnError(getResponseErrorMessage(data[0])))
                return
            }
            const attestationObject = decodeAttestationObject(data.slice(1))
            const authData = deserializeAuthenticatorData(new Uint8Array(attestationObject.authData))
            const id = authData.attestedCredentialData!.credentialId

            let clientExtensionResults = {}
            if (pk.extensions !== undefined) {
                if (pk.extensions.credProps !== undefined) {
                    clientExtensionResults = {
                        ...clientExtensionResults,
                        credProps: {
                            rk: true,
                        }
                    }
                }
            }
            resolve({
                id: bufferToBase64url(id),
                type: "public-key",
                rawId: id,
                response: {
                    clientDataJSON: clientDataJSONEncoded,
                    attestationObject: encode(attestationObject),
                    getTransports(): string[] {
                        return []
                    },
                    getAuthenticatorData(): ArrayBuffer {
                        return attestationObject.authData
                    },
                    getPublicKey() {
                        return authData.attestedCredentialData?.credentialPublicKey
                    },
                    getPublicKeyAlgorithm(): COSEAlgorithmIdentifier {
                        return attestationObject.attStmt.alg
                    },
                } as AuthenticatorAttestationResponse,
                authenticatorAttachment: null,
                getClientExtensionResults() {
                    return clientExtensionResults
                }
            })
        }
    })

    return await promise
}


export async function get(options: CredentialRequestOptions): Promise<PublicKeyCredential> {
    return discoverFromExternalSource(window.location.origin, options, true);
}

async function discoverFromExternalSource(
    origin: string,
    options: CredentialRequestOptions,
    sameOriginWithAncestors: boolean
): Promise<PublicKeyCredential> {
    if (options.publicKey === undefined) {
        throw new Error("publicKey is undefined");
    }
    if (!sameOriginWithAncestors) {
        throw new DOMException("not same origin", "NotAllowedError");
    }
    const pk = options.publicKey;
    const collectedClientData: CollectedClientData = {
        type: "webauthn.get",
        challenge: pk.challenge,
        origin: origin,
        crossOrigin: false,
    }
    const clientDataJSON = toCompatibleJSON(collectedClientData)
    const clientDataJSONEncoded = new TextEncoder().encode(clientDataJSON)
    const clientDataHash = await crypto.subtle.digest("SHA-256", clientDataJSONEncoded)
    if (options.signal !== undefined && options.signal.aborted) {
        throw new DOMException("aborted", "AbortError");
    }
    // connect to PasskeySync
    const promise = new Promise<PublicKeyCredential>((resolve, reject) => {
        const ws = new WebSocket(`ws://localhost:${PASSSYNC_PORT}/local`)
        ws.onopen = () => {
            let json = pk.allowCredentials === undefined ? {
                0x01: pk.rpId,
                0x02: clientDataHash,
            } : {
                0x01: pk.rpId,
                0x02: clientDataHash,
                0x03: pk.allowCredentials,
            }
            console.log(json)
            const cbor = encode(json)
            const data = new Uint8Array(cbor.length + 1)
            data[0] = AuthenticatorRequestCode.AUTHENTICATOR_GET_ASSERTION
            data.set(cbor, 1)
            ws.send(data)
        }
        ws.onerror = () => {
            reject(new WebAuthnError("websocket error"))
        }
        ws.onmessage = async (ev) => {
            if (!(ev.data instanceof Blob)) {
                reject(new WebAuthnError("invalid response for authenticatorGetAssertion"))
                return
            }
            const data = new Uint8Array(await ev.data.arrayBuffer())
            if (data[0] !== AuthenticatorResponseCode.CTAP2_OK) {
                ws.close()
                reject(new WebAuthnError(getResponseErrorMessage(data[0])))
                return
            }
            const response = decodeGetAssertionResponse(data.slice(1))
            const id = response.credential.id as ArrayBuffer

            resolve({
                id: bufferToBase64url(id),
                type: "public-key",
                rawId: id,
                response: {
                    clientDataJSON: clientDataJSONEncoded,
                    authenticatorData: response.authData,
                    signature: response.signature,
                    userHandle: response.user.id,
                } as AuthenticatorAssertionResponse,
                authenticatorAttachment: null,
                getClientExtensionResults() {
                    return {}
                }
            })
        }
    })
    return await promise
}
