import LayoutModel from "../models/layout.model";
import ErrorHandler from "../utils/ErrorHandler";
import cloudinary from "cloudinary";

// --- Service to get layout data by type ---
export const getLayout = async (type: string) => {
    return await LayoutModel.findOne({ type });
};

// --- Service to create new layout data ---
export const createLayout = async (type: string, data: any) => {
    const isTypeExist = await LayoutModel.findOne({ type });
    if (isTypeExist) {
        throw new ErrorHandler(`${type} already exists`, 400);
    }

    if (type === "Banner") {
        const { image, title, subTitle } = data;
        const myCloud = await cloudinary.v2.uploader.upload(image, { folder: "layout" });
        const banner = { 
            image: { public_id: myCloud.public_id, url: myCloud.secure_url }, 
            title, 
            subTitle 
        };
        return await LayoutModel.create({ type, banner });
    }

    if (type === "FAQ") {
        return await LayoutModel.create({ type, faq: data.faq });
    }

    if (type === "Categories") {
        return await LayoutModel.create({ type, categories: data.categories });
    }
};

// --- Service to edit existing layout data ---
export const editLayout = async (type: string, data: any) => {
    const layoutData = await LayoutModel.findOne({ type });
    if (!layoutData) {
        throw new ErrorHandler(`${type} layout not found`, 404);
    }
    
    if (type === "Banner") {
        const { image, title, subTitle } = data;

        // Create an update object that will be built dynamically
        const updateObject: any = {
            'banner.title': title,
            'banner.subTitle': subTitle,
        };
        
        if (image && !image.startsWith("https")) {
            // Destroy old image if it exists
            if (layoutData.banner?.image?.public_id) {
                await cloudinary.v2.uploader.destroy(layoutData.banner.image.public_id);
            }
            // Upload new image
            const myCloud = await cloudinary.v2.uploader.upload(image, { folder: "layout" });
            
            // FIXED: Use dot notation to update nested fields directly.
            // This tells Mongoose exactly which fields to change and completely avoids the type mismatch error.
            updateObject['banner.image.public_id'] = myCloud.public_id;
            updateObject['banner.image.url'] = myCloud.secure_url;
        }
        
        // Perform the update using the dynamically built object
        return await LayoutModel.findByIdAndUpdate(layoutData._id, { $set: updateObject }, { new: true });
    }

    if (type === "FAQ") {
        return await LayoutModel.findByIdAndUpdate(layoutData._id, { $set: { faq: data.faq } }, { new: true });
    }

    if (type === "Categories") {
        return await LayoutModel.findByIdAndUpdate(layoutData._id, { $set: { categories: data.categories } }, { new: true });
    }
};