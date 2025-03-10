import asyncHandler from "../middleware/asyncHandler.js"
import User from "../models/userModel.js"
import Institution from "../models/institutionModel.js"
import generateToken from "../utils/generateToken.js"
import crypto from "crypto"
import sendEmail from "../services/emailService.js"
import getEmailTemplate from "../utils/emailTemplate.js"
import { UPLOAD_TYPES } from "../middleware/uploadMiddleware.js"
import { getImageUrl, deleteFile } from "../utils/fileUtils.js"
import bcrypt from "bcryptjs"

// @desc    Auth User and get token
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
      data: null,
    })
  }

  if (user && (await user.matchPassword(password))) {
    const token = generateToken(res, user._id)
    return res.json({
      data: {
        ...user.toJSON(),
        token,
      },
      message: "User logged in successfully!",
      success: true,
    })
  } else {
    return res.status(401).json({
      success: false,
      message: "Invalid password",
      data: null,
    })
  }
})

// @desc    Register User
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, birthDate, phoneNumber } = req.body

  const existUser = await User.findOne({ email })
  if (existUser) {
    return res.status(400).json({
      success: false,
      message: "User already exists",
      data: null,
    })
  }

  const userData = { name, email, password, role, birthDate, phoneNumber }

  if (role === "charity_admin") {
    const institution = await Institution.create({
      name: req.body.institutionName,
      type: req.body.institutionType,
      contact: req.body.phoneNumber,
    })
    userData.institution = institution._id
  }

  const user = await User.create(userData)

  res.status(201).json({
    data: {
      ...user,
    },
    message: "User registered successfully!",
    success: true,
  })
})

// @desc    Logout User
// @route   POST /api/users/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  })

  res
    .status(200)
    .json({ data: null, message: "Logged out successfully", success: true })
})

// @desc    Get User Profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate("institution", "name type contact")
    .select("-password -__v") // Remove sensitive fields

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
      data: null,
    })
  }

  // Structure response based on role
  const responseData = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    profilePic: user.profilePic,
    phoneNumber: user.phoneNumber,
    birthDate: user.birthDate,
    ...(user.role === "volunteer" && {
      skills: user.skills,
      availability: user.availability,
      areasOfInterest: user.areasOfInterest,
    }),
    ...(user.role === "charity_admin" && {
      institution: user.institution,
    }),
  }

  res.json({
    data: responseData,
    success: true,
    message: "Profile fetched successfully",
  })
})

// @desc    Update User Profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
      data: null,
    })
  }

  // Common fields
  user.name = req.body.name || user.name
  user.phoneNumber = req.body.phoneNumber || user.phoneNumber
  user.birthDate = req.body.birthDate || user.birthDate

  // Email update with validation
  if (req.body.email && req.body.email !== user.email) {
    const existUser = await User.findOne({ email: req.body.email })
    if (existUser) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
        data: null,
      })
    }
    user.email = req.body.email
  }

  // Password update with hashing
  if (req.body.password) {
    user.password = await bcrypt.hash(req.body.password, 10)
  }

  // Role-specific updates
  if (user.role === "volunteer") {
    user.skills = req.body.skills || user.skills
    user.availability = req.body.availability || user.availability
    user.areasOfInterest = req.body.areasOfInterest || user.areasOfInterest
  }
  let institution
  if (user.role === "charity_admin" && user.institution) {
    institution = await Institution.findById(user.institution)
    if (institution) {
      institution.name = req.body.institution?.name || institution.name
      institution.type = req.body.institution?.type || institution.type
      institution.contact = req.body.institution?.contact || institution.contact
      await institution.save()
    }
  }

  const updatedUser = await user.save()
  if (user.role === "charity_admin") {
    updatedUser.institution = institution
  }
  // Filter sensitive fields before sending response
  const { password, __v, ...safeUserData } = updatedUser._doc

  res.json({
    data: safeUserData,
    message: "Profile updated successfully",
    success: true,
  })
})

// Password Reset Functionality
const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email })
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
      data: null,
    })
  }

  const resetToken = user.createPasswordResetToken()
  await user.save({ validateBeforeSave: false })

  const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`
  const emailTemplate = getEmailTemplate(resetURL)
  try {
    await sendEmail({
      to: user.email,
      subject: "Password Reset Token (valid for 10 min)",
      html: emailTemplate,
    })

    res.status(200).json({
      success: true,
      message: "Token sent to email!",
      data: null,
    })
  } catch (err) {
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined
    await user.save({ validateBeforeSave: false })

    return res.status(500).json({
      success: false,
      message:
        err?.message ||
        "There was an error sending the email. Try again later!",
      data: null,
    })
  }
})

const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex")

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  })

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Token is invalid or has expired",
      data: null,
    })
  }

  user.password = req.body.password
  user.resetPasswordToken = undefined
  user.resetPasswordExpire = undefined
  await user.save()

  generateToken(res, user._id)

  res.status(200).json({
    data: {
      ...user,
    },
    message: "Password updated successfully!",
    success: true,
  })
})

/**
 * Image handling services
 */
export const uploadProfilePicHandler = asyncHandler(async (req, res) => {
  /**
   * 1. Deletes existing profile pic
   * 2. Creates new file URL
   * 3. Updates user document with new image url
   */
  const user = req.user
  if (!user) throw new Error("User not found")

  if (!req.file) throw new Error("Profile Pic not uploaded")
  // Delete previous logo using utility
  if (user.profilePic) {
    console.log(user.profilePic);
    deleteFile(user.profilePic, user._id, UPLOAD_TYPES.PROFILE_PIC)
  }

  const fileUrl = getImageUrl(
    req,
    user._id,
    UPLOAD_TYPES.PROFILE_PIC,
    req.file.filename
  )
  user.profilePic = fileUrl
  await user.save()
  return res.status(200).json({
    message: "Profile Pic uploaded successfully!",
    success: true,
    data: fileUrl,
  })
})

export {
  loginUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword,
}
