export interface IPOST {
    id?: bigint;
    userId?: string;
    name?: string;
    description?: string;
    image?: string;
    status?: string;
    like_count?: number;
    meta?: [IMETA]
}
export interface IMETA {
    name?: string;
    description?: string;
    image?: string;
}