export interface User {
    id?: string;
    firstName?: string;
    lastName?: string;
    username: string;
    email: string;
    profileImage?: string;
    isAdmin: boolean;
    provider: string;
    lastLogin: string;
    createdAt: string;
    updatedAt: string;
}

export interface CurrentUser {
    firstName: string;
    lastName: string;
    email: string;
    username: string
    provider: string
    isAdmin: boolean;
}
