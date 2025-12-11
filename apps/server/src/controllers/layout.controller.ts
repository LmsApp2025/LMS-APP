import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import * as LayoutService from "../services/layout.service";

export const createLayout = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type, ...data } = req.body;
        await LayoutService.createLayout(type, data);
        res.status(201).json({ success: true, message: "Layout created successfully" });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, error.statusCode || 500));
    }
});

export const editLayout = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type, ...data } = req.body;
        await LayoutService.editLayout(type, data);
        res.status(200).json({ success: true, message: "Layout updated successfully" });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, error.statusCode || 500));
    }
});

export const getLayoutByType = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type } = req.params;
        const layout = await LayoutService.getLayout(type);
        res.status(200).json({ success: true, layout });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});