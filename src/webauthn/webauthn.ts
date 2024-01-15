import {AuthenticationExtensionsClientOutputs} from "@simplewebauthn/typescript-types";
import {AuthenticatorRequestCode, CollectedClientData} from "./interfaces";
import {decode, encode} from "cborg";

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
    let pk = options.publicKey;

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
    const clientDataJSON = JSON.stringify(collectedClientData)
    const clientDataHash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(clientDataJSON));
    if (options.signal !== undefined && options.signal.aborted) {
        throw new DOMException("aborted", "AbortError");
    }
    // connect to PasskeySync
    const ws = new WebSocket(`ws://localhost:${PASSSYNC_PORT}/local`)

    ws.onopen = (ev) => {
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
    ws.onmessage = async (ev) => {
        if (ev.data instanceof Blob) {
            const data = new Uint8Array(await ev.data.arrayBuffer())
            console.log(data[0])
            const cbor = data.slice(1)
            const json = decode(cbor)
            console.log(json)
        }
    }


    return {
        getClientExtensionResults(): AuthenticationExtensionsClientOutputs {
            return {};
        },
        id: "id",
        type: "type",
        rawId: new ArrayBuffer(1),
        response: {
            clientDataJSON: new ArrayBuffer(1),
        },
        authenticatorAttachment: null
    };
}
