import { Request } from "express";
import { IUser } from "../models/admin.model";
import { IStudent } from "../models/student.model";

declare global {
    namespace Express{
        interface Request{
            user?: IUser | IStudent;
        }
    }
}
