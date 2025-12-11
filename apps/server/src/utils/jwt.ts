// In: apps/server/src/utils/jwt.ts (CORRECTED AND FINAL)

require("dotenv").config();
import { Response } from "express";
import { IUser } from "../models/user.model";
import { redis } from "./redis";
import jwt, { Secret } from "jsonwebtoken";

interface ITokenOptions {
    expires: Date;
    maxAge: number;
    httpOnly: boolean;
    sameSite: "lax" | "strict" | "none" | undefined;
    secure?: boolean;
    path?: string;
}

// Set defaults
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

// A single function to send tokens for ANY user type
export const sendToken = (user: IUser, statusCode: number, res: Response) => {
    const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.ACCESS_TOKEN!, { expiresIn: `${accessTokenExpire}m` });
    const refreshToken = jwt.sign({ id: user._id, role: user.role }, process.env.REFRESH_TOKEN!, { expiresIn: `${refreshTokenExpire}d` });

    // Save session to Redis
    redis.set(user._id.toString(), JSON.stringify(user), "EX", refreshTokenExpire * 24 * 60 * 60);

    res.cookie("access_token", accessToken, accessTokenOptions);
    res.cookie("refresh_token", refreshToken, refreshTokenOptions);

    res.status(statusCode).json({
        success: true,
        user,
        accessToken,
    });
};

// FIXED: Moved this utility function to its correct home.
export const createActivationToken = (user: any): { token: string; activationCode: string } => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
  const token = jwt.sign({ user, activationCode }, process.env.ACTIVATION_SECRET as Secret, { expiresIn: "5m" });
  return { token, activationCode };
};