import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import * as OrderService from "../services/order.service"; // Import the service

require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// --- CONTROLLERS ---

export const createOrder = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { courseId, payment_info } = req.body;
        const userId = req.user?._id as string;
        
        const order = await OrderService.createOrder(courseId, payment_info, userId);

        res.status(201).json({ success: true, order });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, error.statusCode || 500));
    }
});

// This controller can be identical to the web one
export const createMobileOrder = createOrder;

export const getAllOrders = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orders = await OrderService.getAllOrders();
        res.status(200).json({ success: true, orders });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

export const sendStripePublishableKey = CatchAsyncError(async (req: Request, res: Response) => {
    res.status(200).json({
        publishablekey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
});

export const newPayment = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const myPayment = await stripe.paymentIntents.create({
            amount: req.body.amount,
            currency: "GBP",
            metadata: { company: "E-Learning" },
            automatic_payment_methods: { enabled: true },
        });

        res.status(201).json({
            success: true,
            client_secret: myPayment.client_secret,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});