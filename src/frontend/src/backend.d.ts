import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Property {
    locationUrl: string;
    roadInfo: string;
    contact: string;
    ownerName: string;
    propertyType: string;
    nagarpalika: string;
    mukhSize: string;
    createdAt: bigint;
    createdBy: Principal;
    lambai: string;
    address: string;
    landArea: string;
    notes: string;
    price: string;
    facing: string;
    attachments: Array<File>;
}
export interface File {
    id: bigint;
    content: ExternalBlob;
    fileName: string;
    uploadedAt: bigint;
    uploadedBy: Principal;
}
export interface Agent {
    contact: string;
    name: string;
    createdAt: bigint;
    createdBy: Principal;
    address: string;
    citizenshipUpload: File;
    workArea: string;
}
export interface OtherProperty {
    title: string;
    contact: string;
    createdAt: bigint;
    createdBy: Principal;
    notes: string;
    category: string;
    price: string;
    location: string;
    attachments: Array<File>;
}
export interface House {
    totalFloor: string;
    contact: string;
    ownerName: string;
    builtYear: string;
    createdAt: bigint;
    createdBy: Principal;
    notes: string;
    naksaPass: string;
    price: string;
    totalLandArea: string;
    facing: string;
    location: string;
    attachments: Array<File>;
    rooms: string;
}
export interface UserProfile {
    name: string;
    email: string;
    phone: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteAgent(id: bigint): Promise<void>;
    deleteFile(id: bigint): Promise<void>;
    deleteHouse(id: bigint): Promise<void>;
    deleteOtherProperty(id: bigint): Promise<void>;
    deleteProperty(id: bigint): Promise<void>;
    getAgent(id: bigint): Promise<Agent | null>;
    getAllAgentsSorted(): Promise<Array<Agent>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFile(id: bigint): Promise<File | null>;
    getHouse(id: bigint): Promise<House | null>;
    getOtherProperty(id: bigint): Promise<OtherProperty | null>;
    getPropertiesByType(propertyType: string): Promise<Array<Property>>;
    getProperty(id: bigint): Promise<Property | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveAgent(agent: Agent): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveHouse(house: House): Promise<bigint>;
    saveOtherProperty(otherProperty: OtherProperty): Promise<bigint>;
    saveProperty(property: Property): Promise<bigint>;
    updateAgent(id: bigint, updatedAgent: Agent): Promise<void>;
    updateHouse(id: bigint, updatedHouse: House): Promise<void>;
    updateOtherProperty(id: bigint, updatedProperty: OtherProperty): Promise<void>;
    updateProperty(id: bigint, updatedProperty: Property): Promise<void>;
    uploadFile(fileName: string, content: ExternalBlob): Promise<bigint>;
}
