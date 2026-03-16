import {jwtDecode} from 'jwt-decode';

export interface JwtPayload {
    id: number;
    email: string;
    name: string;
    iat: number;
    exp: number;
}

export const decodeToken = (token: string): JwtPayload | null => {
    try {
        return jwtDecode<JwtPayload>(token);
    } catch {
        return null;
    }
};
