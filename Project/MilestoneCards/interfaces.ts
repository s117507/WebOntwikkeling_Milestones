import { ObjectId } from "mongodb";

export interface Cards {
    _id?: ObjectId; 
    id: string; 
    name: string;
    description: string;
    rating: number;
    isActive: boolean;
    birthDate: string; 
    imageUrl: string;
    type: string;
    menu: string[];
    artist: string;
    owner: Owner;
}

export interface Owner {
    id: string;
    name: string;
    country: string;
}

export interface User {
    _id?: ObjectId;
    username: string;
    password?: string;
    role: "ADMIN" | "USER";
}