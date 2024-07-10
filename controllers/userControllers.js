import {catchAsyncError} from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import {User} from "../models/userSchema.js";
import {sendToken} from "../utils/jwtToken.js";


export const register = catchAsyncError(async(req, res, next)=>{
    const {name, email, phone, password, role} = req.body;
    if(!name || !email || !phone || !role || !password){
        return next(new ErrorHandler("Please fil full registaration form"));        
    }
    const isEmail = await User.findOne({email});
    if(isEmail){
        return next(new ErrorHandler("Email already exists!"));
    }
    const user = await User.create({
        name,
        email,
        phone,
        role,
        password,
    });
    sendToken(user, 201, res, "User Registered Successfully!");
});

export const login = catchAsyncError(async(req, res,next)=>{
    const {email, password, role} = req.body;

    if(!email || !password || !role){
        return next(
            new ErrorHandler("please provide email, password and role.", 400)
        );
    }
    const user = await User.findOne({email}).select("+password");
    if(!user){
      return next(new ErrorHandler("Invalid Email or Password",400));
    }
    const isPasswordMatched = await user.comparePassword(password);
    if(!isPasswordMatched){
      return next(new ErrorHandler("Invalid Email or Password",400));
    }
    if(user.role !== role){
      return next( new ErrorHandler("User with this not found", 400));
    }
    sendToken(user, 201, res, "User logged in successfully!");
});

export const logout = catchAsyncError(async(req, res, next)=>{
    res
      .status(201)
      .cookie("token", "", {
        httpOnly: true,
        exprires:new Date(Date.now()),
          secure: true,
        sameSite:"None",
      })
      .json({
        success: true,
        message: "User logged out successfully!",
      });
});

export const getUser = catchAsyncError((req, res, next)=>{
  const user = req.user;
  res.status(200).json({
    success:true,
    user,
  });
});
