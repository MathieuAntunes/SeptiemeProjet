const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    userId: { type: String},
    imageUrl: { type: String},
    text: { type: String},
    createdDate: { type: Date },
    likes: { type: Number, default: 0 },
    usersLiked: { type: [String] },
});

module.exports = mongoose.model('Post', postSchema);