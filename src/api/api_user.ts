import axios from "axios";

export interface UserInfo {
    id: number;
    username: string;
    email: string;
    userHandle: string;
}

export async function getUserInfo(): Promise<UserInfo> {
    const response = await axios.get('/api/user');
    return await response.data;
}

export interface CredentialInfo {
    credentialId: string;
    publicKeyCose: string;
    signatureCount: number;
}

export async function getCredentialInfos(): Promise<CredentialInfo[]> {
    const response = await axios.get('/api/credentials');
    return await response.data;
}