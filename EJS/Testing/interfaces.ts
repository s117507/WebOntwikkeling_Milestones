export interface Cards {
    id: string;
    name: string;
    description: string;
    rating: number;
    isActive: boolean;
    birthDate: string; 
    imageUrl: string;
    type: string;
    abilities: string[];
    artist: string;
    guildAffiliation: GuildAfiliation;
}

export interface GuildAfiliation {
    id: string;
    name: string;
    country: string;
}
