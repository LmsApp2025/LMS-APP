import OrderModel from "../models/order.Model";
import CourseModel from "../models/course.model";
import UserModel from "../models/user.model";
import NotificationModel from "../models/notification.Model";
import ErrorHandler from "../utils/ErrorHandler";
import { redis } from "../utils/redis";
import * as EmailService from "./email.service";
import path from "path";
import ejs from "ejs";

require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Get All Orders service (already refactored)
export const getAllOrders = async () => {
    const orders = await OrderModel.find().sort({ createdAt: -1 });
    return orders;
};

// Create new order service (now with full business logic)
export const createOrder = async (courseId: string, payment_info: any, userId: string) => {
    if (payment_info) {
        if ("id" in payment_info) {
            const paymentIntentId = payment_info.id;
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            if (paymentIntent.status !== "succeeded") {
                throw new ErrorHandler("Payment not authorized!", 400);
            }
        }
    }

    const user = await UserModel.findById(userId);
    if (!user) { throw new ErrorHandler("User not found", 404); }

    const courseExistInUser = user.courses.some((course: any) => course.toString() === courseId);
    if (courseExistInUser) {
        throw new ErrorHandler("You have already purchased this course", 400);
    }

    const course = await CourseModel.findById(courseId);
    if (!course) { throw new ErrorHandler("Course not found", 404); }

    const data: any = { courseId: course._id, userId, payment_info };
    const order = await OrderModel.create(data);

    // --- Perform side effects after successful order creation ---

    // Send order confirmation email
    const mailData = {
        order: {
            _id: course._id.toString().slice(0, 6),
            name: course.name,
            price: course.price,
            date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
        },
    };
    
    try {
        await EmailService.sendMail({
            email: user.email,
            subject: "Order Confirmation",
            template: "order-confirmation.ejs",
            data: mailData,
        });
    } catch (error: any) {
        // Log the error but don't fail the entire transaction just because the email failed
        console.error("Failed to send order confirmation email:", error.message);
    }

    // Add course to user's profile
    user.courses.push(course._id);
    await user.save();
    await redis.set(user._id.toString(), JSON.stringify(user));

    // Create notification for admin
    await NotificationModel.create({
        user: user._id,
        title: "New Order",
        message: `You have a new order for ${course.name}`,
    });

    // Update course purchased count
    course.purchased = (course.purchased || 0) + 1;
    await course.save();

    return order;
};