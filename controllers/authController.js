const User = require("../models/User");
const Role = require("../models/Role");
const UserOTP = require("../models/UserOTP")
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");
const crypto = require('crypto')
const sendEmail = require("../utils/emailTransporter");

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
                    const token = tokenCreator(
                        {
                            email: email,
                            otp: otp
                        },
                        '5min'
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

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findOne({ email: decoded.email }).select("-password");
            if (!user) return res.status(404).json({ message: "User not found" });

            const checkotprecode = await UserOTP.findOne({ email: decoded.email })

            if (!checkotprecode) {
                return res.status(404).json({ message: "OTP Reocode Not found" });
            }

            const { otp } = req.body

            const otpcheck = await bcrypt.compare(otp, checkotprecode.otp)

            if (!otpcheck) {
                return res.status(404).json({ message: "OTP Not Match" })
            }

            const updateuser = await User.findOneAndUpdate(
                { email: decoded.email },
                { $set: { isEmailVerified: true } },
                { new: true }
            )

            if (updateuser) {
                if (updateuser) {
                    const deleteotp = await UserOTP.findOneAndDelete({ email: decoded.email })
                    if (deleteotp) {
                        return res.json({ success: true, message: "Email Verification Successful" })
                    }
                }
            }
            else {
                return res.json({ success: false, message: "Internal Server Error" })
            }

        }
        catch (err) {
            console.log(err)
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email }).populate("role");
            if (!user) return res.status(404).json({ message: "User not found" });

            const match = await bcrypt.compare(password, user.password);
            if (!match) return res.status(400).json({ message: "Invalid credentials" });

            const token = generateToken(user._id, user.role.name);
            res.json({ token, user });
        } catch (err) {
            console.error("Login error:", err);
            res.status(500).json({ message: "Login failed" });
        }
    }
}

module.exports = authContorller;

