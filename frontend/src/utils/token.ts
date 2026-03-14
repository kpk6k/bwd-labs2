import {jwtDecode} from 'jwt-decode';

export interface JwtPayload {
    id: number;
    name: string;
    email: string;
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
