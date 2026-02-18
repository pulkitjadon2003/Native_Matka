import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key_change_me";

export interface DecodedToken {
    id: string;
    mobile: string;
    is_admin: boolean;
    iat: number;
    exp: number;
}

export const verifyToken = (req: NextRequest): DecodedToken | null => {
    try {
        const token = req.headers.get("authorization")?.split(" ")[1];
        if (!token) return null;

        const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
        return decoded;
    } catch (error) {
        return null;
    }
};

export const isAuthenticated = (req: NextRequest) => {
    const user = verifyToken(req);
    if (!user) {
        throw new Error("Unauthorized");
    }
    return user;
};

export const isAdmin = (req: NextRequest) => {
    const user = verifyToken(req);
    if (!user || !user.is_admin) {
        throw new Error("Forbidden: Admin access only");
    }
    return user;
};
