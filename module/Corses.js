const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 5,
        maxlength: 50
    },
    desc: {
        type: String,
        required: true,
        trim: true,
        minlength: 5
    },
    category: {
        type: String,
        required: true
    },
    image: {
        url: { type: String, required: true },
        public_id: { type: String, required: true }
    },
    videos: [
        {
            url: { type: String, required: true },
            public_id: { type: String, required: true },
            titleVedio: { type: String, required: true }
        }
    ]
});

const Course = mongoose.model('Course', CourseSchema);
module.exports = Course;
