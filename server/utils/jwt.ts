// In packages/server/utils/jwt.ts

require("dotenv").config();
import { Response } from "express";
import { IUser } from "../models/admin.model"; // For Admins
import { IStudent } from "../models/student.model"; // For Students
import { redis } from "./redis";
import jwt from "jsonwebtoken";

interface ITokenOptions {
    expires: Date;
    maxAge: number;
    httpOnly: boolean;
    sameSite: "lax" | "strict" | "none" | undefined;
    secure?: boolean;
    path?: string;
}

// Set defaults: access token for 15 minutes, refresh token for 30 days
const accessTokenExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRE || "15", 10);
const refreshTokenExpire = parseInt(process.env.REFRESH_TOKEN_EXPIRE || "30", 10);

export const accessTokenOptions: ITokenOptions = {
    expires: new Date(Date.now() + accessTokenExpire * 60 * 1000), // MINUTES
    maxAge: accessTokenExpire * 60 * 1000,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === 'production',
    path: "/",
};

export const refreshTokenOptions: ITokenOptions = {
    expires: new Date(Date.now() + refreshTokenExpire * 24 * 60 * 60 * 1000), // DAYS
    maxAge: refreshTokenExpire * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === 'production',
    path: "/",
};

// A single, robust function to send tokens for ANY user type
export const sendToken = (user: IUser | IStudent, statusCode: number, res: Response) => {
    const userRole = 'role' in user ? user.role : 'student'; // Differentiate between admin and student
    
    const accessToken = jwt.sign({ id: user._id, role: userRole }, process.env.ACCESS_TOKEN!, { expiresIn: `${accessTokenExpire}m` });
    const refreshToken = jwt.sign({ id: user._id, role: userRole }, process.env.REFRESH_TOKEN!, { expiresIn: `${refreshTokenExpire}d` });

    // Save session to Redis
    const sessionDurationInSeconds = refreshTokenExpire * 24 * 60 * 60;
    redis.set(user._id.toString(), JSON.stringify({ "session": "valid" }), "EX", sessionDurationInSeconds);

    // Set cookies
    res.cookie("access_token", accessToken, accessTokenOptions);
    res.cookie("refresh_token", refreshToken, refreshTokenOptions);

    res.status(statusCode).json({
        success: true,
        user,
        accessToken,
        refreshToken,
    });
};
