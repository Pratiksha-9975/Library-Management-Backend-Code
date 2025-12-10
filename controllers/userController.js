import ErrorHandler from "../middlewares/errorMiddlewares.js";
import { User } from "../models/userModel.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";

export const getAllusers = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find({ accountVerified: true });
  res.status(200).json({
    success: true,
    users,
  });
});

export const registerNewAdmin = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Admin Avtar is Required", 400));
  }

  const { name, email, password } = req.body;
  if ((!name, !email, !password)) {
    return next(new ErrorHandler("please fill all fields", 400));
  }
  const isRegistered = await User.findOne({ email, accountVerified: true });
  if (isRegistered) {
    return next(new ErrorHandler("User already register", 400));
  }
  if (password.length < 8 || password.length > 16) {
    return next(
      new ErrorHandler(
        " Password must be between 8 to 16 characters long ",
        400
      )
    );
  }

  const { avatar } = req.files;
  const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
  if (!allowedFormats.includes(avatar.mimetype)) {
    return next(new ErrorHandler("file format not supported", 400));
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const cloudinaryResponse = await cloudinary.uploader.upload(
    avatar.tempFilePath,
    {
      folder: "Library_Management_System_Admin_Avatars",
    }
  );
  if (!cloudinaryResponse || cloudinaryResponse.error) {
    console.error(
      "Cloudinary error: ",
      cloudinaryResponse.error || "Unknown Cloudinary error"
    );
    return next(new ErrorHandler("Failed to upload image to Cloudinary",500))
  }

  const admin = await User.create({
    name,
    email,
    password:hashedPassword,
    role:"Admin",
    accountVerified:true,
    avatar:{
        public_id:cloudinaryResponse.public_id,
        url:cloudinaryResponse.secure_url
    }
  })
  res.status(201).json({
    success:true,
    message:"admin registered successfully",
    admin
  })
});
