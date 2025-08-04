const User = require("../models/User");
const Role = require("../models/Role");
const UserOTP = require("../models/UserOTP")
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");
const crypto = require('crypto')
const sendEmail = require("../utils/emailTransporter");
const jwt = require('jsonwebtoken')

const authContorller = {
    register: async (req, res) => {
        try {
            const { username, email, password } = req.body

            const checkuser = await User.findOne({
                $or: [
                    { username: username },
                    { email: email }
                ]
            })

            if (checkuser) {
                return res.json({ success: false, message: 'User Already in Database' })
            }

            const hashpass = await bcrypt.hash(password, 10)

            const getroleid = await Role.findOne({ name: 'guest' })

            const createuser = new User({
                username: username,
                email: email,
                password: hashpass,
                role: getroleid._id
            })

            const resultcreateuser = await createuser.save()
            if (resultcreateuser) {

                const checkotp = await UserOTP.findOne({ email: email })

                if (checkotp) {
                    return res.json({ success: false, message: 'User Already Reqeust OTP, Please wait and try agin later' })
                }

                function generateOTP(length = 8) {
                    return crypto
                        .randomBytes(length)
                        .toString('base64')
                        .replace(/[^a-zA-Z0-9]/g, '')
                        .slice(0, length);
                }

                const otp = generateOTP();


                await sendEmail({
                    to: email,
                    subject: "Email Verification Code",
                    html: `
                        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
                            <h2 style="color: #333;">Hello ${username},</h2>
                            <p>Thank you for registering. To complete your email verification, please use the code below:</p>

                            <div style="font-size: 24px; font-weight: bold; background-color: #f2f2f2; padding: 10px 20px; text-align: center; border-radius: 6px; color: #2c3e50; letter-spacing: 2px;">
                                ${otp}
                            </div>

                            <p style="margin-top: 20px;">This code is valid for the next 10 minutes. Please do not share it with anyone.</p>

                            <p>Best regards,<br><strong>Hotel Team</strong></p>
                        </div>
                    `,
                });

                const hashotp = await bcrypt.hash(otp, 10)

                const createotprecode = new UserOTP({
                    email: email,
                    otp: hashotp
                })

                const resultcreateotp = await createotprecode.save()

                if (resultcreateotp) {
                    const token = generateToken(
                        {
                            email: email,
                            otp: otp
                        },
                        '15min'
                    );

                    return res.json({ success: true, token: token, message: "Registation Success, Verification Email send to your email" })
                }
                else {
                    return res.json({ success: false, message: "Internal Server Error" })
                }

            }
            else {
                return res.json({ success: false, message: "Internal Server Error While creating User" })
            }
        }
        catch (err) {
            console.log(err)
        }
    },


    veriftEamilOTP: async (req, res) => {
        try {
            const token = req.header("Authorization")?.replace("Bearer ", "");
            if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

            let decoded;
            try {
                decoded = jwt.verify(token, process.env.JWT_SECRET);
            } catch (err) {
                if (err.name === "TokenExpiredError") {
                    return res.status(401).json({ message: "Token expired. Please log in again." });
                }
                return res.status(400).json({ message: "Invalid token." });
            }

            const user = await User.findOne({ email: decoded.email }).select("-password");
            if (!user) return res.status(404).json({ message: "User not found" });

            const checkotprecode = await UserOTP.findOne({ email: decoded.email });
            if (!checkotprecode) {
                return res.status(404).json({ message: "OTP Record Not found" });
            }

            const { otp } = req.body;
            const otpcheck = await bcrypt.compare(otp, checkotprecode.otp);
            if (!otpcheck) {
                return res.status(404).json({ message: "OTP does not match" });
            }

            const updateuser = await User.findOneAndUpdate(
                { email: decoded.email },
                { $set: { isEmailVerified: true } },
                { new: true }
            );

            if (updateuser) {
                const deleteotp = await UserOTP.findOneAndDelete({ email: decoded.email });
                if (deleteotp) {
                    return res.json({ success: true, message: "Email Verification Successful" });
                }
            } else {
                return res.status(500).json({ success: false, message: "Internal Server Error" });
            }

        } catch (err) {
            console.log(err);
            return res.status(500).json({ message: "Something went wrong" });
        }
    },

    login: async (req, res) => {
        try {
            const {
                email,
                password
            } = req.body

            const checkuser = await User.findOne({ email: email })

            if (!checkuser) {
                return res.json({ success: false, message: "User Not in Database" })
            }

            const checkpass = await bcrypt.compare(password, checkuser.password)

            if (!checkpass) {
                return res.json({ success: false, message: "Password Not Match" })
            }

            if (checkuser.isEmailVerified === false) {
                return res.json({ success: false, message: "Your email is not Verify..." })
            }

            if (checkuser.isActive === false) {
                return res.json({ success: false, message: "Your Account is not Active..." })
            }

            const getuserrole = await Role.findById(checkuser.role)


            const token = generateToken(
                {
                    id: checkuser._id,
                    email: checkuser.email,
                    username: checkuser.username,
                    role: getuserrole.name
                },
                '1d'
            );

            return res.json({ success: true, token: token, message: "Login Success" })
        }
        catch (err) {
            console.log(err)
        }
    },

    passwordforget_emailverify: async (req, res) => {
        try {
            const { email } = req.body

            const checkemail = await User.findOne({ email: email })

            if (!checkemail) {
                return res.json({ success: false, message: "Email Address Cannot Found,.. Please check the email Address and Try Again" })
            }
            const checkotp = await UserOTP.findOne({ email: email })

            if (checkotp) {
                return res.json({ success: false, message: 'User Already Reqeust OTP, Please wait and try agin later' })
            }

            function generateOTP(length = 8) {
                return crypto
                    .randomBytes(length)
                    .toString('base64')
                    .replace(/[^a-zA-Z0-9]/g, '')
                    .slice(0, length);
            }

            const otp = generateOTP();


            await sendEmail({
                to: email,
                subject: "Password Reset Code",
                html: `
                        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
                            <h2 style="color: #333;">Hello ${checkemail.username},</h2>
                            <p>For your Password Reset, please use the code below:</p>

                            <div style="font-size: 24px; font-weight: bold; background-color: #f2f2f2; padding: 10px 20px; text-align: center; border-radius: 6px; color: #2c3e50; letter-spacing: 2px;">
                                ${otp}
                            </div>

                            <p style="margin-top: 20px;">This code is valid for the next 10 minutes. Please do not share it with anyone.</p>

                            <p>Best regards,<br><strong>Hotel Team</strong></p>
                        </div>
                    `,
            });

            const hashotp = await bcrypt.hash(otp, 10)

            const createotprecode = new UserOTP({
                email: email,
                otp: hashotp
            })

            const resultcreateotp = await createotprecode.save()

            if (resultcreateotp) {
                const token = generateToken(
                    {
                        id: checkemail._id,
                        email: checkemail.email,
                    },
                    '15min'
                );
                return res.json({ success: true, token: token, message: "Password Reset Code has been send to email, check the emails" })
            }
            else {
                return res.json({ success: false, message: "Internal Server Error" })
            }
        }
        catch (err) {
            console.log(err)
        }
    },

    checkpassword_resetotp: async (req, res) => {
        try {
            const token = req.header("Authorization")?.replace("Bearer ", "");
            if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

            let decoded;
            try {
                decoded = jwt.verify(token, process.env.JWT_SECRET);
            } catch (err) {
                if (err.name === "TokenExpiredError") {
                    return res.status(401).json({ message: "Token expired. Please log in again." });
                }
                return res.status(400).json({ message: "Invalid token." });
            }

            const user = await User.findOne({ email: decoded.email }).select("-password");
            if (!user) return res.status(404).json({ message: "User not found" });

            const checkotprecode = await UserOTP.findOne({ email: decoded.email });
            if (!checkotprecode) {
                return res.status(404).json({ message: "OTP Record Not found" });
            }

            const { otp } = req.body

            const checkotp = await bcrypt.compare(otp, checkotprecode.otp)

            if (!checkotp) {
                return res.json({ success: false, message: "OTP not Match, Please check the OTP" })
            }

            const deleteotprecode = await UserOTP.findOneAndDelete({ email: decoded.email })

            if (deleteotprecode) {
                return res.json({ success: false, message: "OTP Verification Successfull" })
            }
            else {
                return res.json({ success: false, message: "Internal Server Error" })
            }

        }
        catch (err) {
            console.log(err)
        }
    },

    updaete_password: async (req, res) => {
        try {
            const token = req.header("Authorization")?.replace("Bearer ", "");
            if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

            let decoded;
            try {
                decoded = jwt.verify(token, process.env.JWT_SECRET);
            } catch (err) {
                if (err.name === "TokenExpiredError") {
                    return res.status(401).json({ message: "Token expired. Please log in again." });
                }
                return res.status(400).json({ message: "Invalid token." });
            }

            console.log("Decoded Token:", decoded);

            const user = await User.findOne({ email: decoded.email }).select("-password");
            if (!user) return res.status(404).json({ message: "User not found" });

            const { new_password } = req.body;
            const hashpass = await bcrypt.hash(new_password, 10);

            const updatedUser = await User.findOneAndUpdate(
                { email: decoded.email },
                { $set: { password: hashpass } },
                { new: true }
            );

            if (updatedUser) {
                return res.json({ success: true, message: "Password updated successfully." });
            } else {
                return res.status(500).json({ success: false, message: "Internal server error." });
            }
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "Server error." });
        }
    }
}

module.exports = authContorller;

