const mongoose = require('mongoose');

const ProfileImageSchema = new mongoose.Schema({
    email: { type: String, required: true },
    profile_image: { type: String, required: true }
}, { timestamps: true });

const ProfileImage = mongoose.model('ProfileImage', ProfileImageSchema);

module.exports = ProfileImage;