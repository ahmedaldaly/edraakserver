const asynchandler = require('express-async-handler');
const cloudinary = require('../middelware/cloudnari');
const Courses = require('../module/Corses');
const {category} = require ('../module/Category')
const fs = require('fs').promises;
const path = require('path');

// دالة لحذف ملف معين
async function deleteFile(filePath) {
    try {
        await fs.unlink(filePath);
        console.log(`تم حذف الملف: ${filePath}`);
    } catch (error) {
        console.error(`خطأ أثناء حذف الملف ${filePath}:`, error.message);
    }
}

module.exports.addCourse = asynchandler(async (req, res) => {
    try {
        if (!req.files || !req.files.image || !req.files.videos) {
            return res.status(400).json({ error: 'يرجى رفع صورة وفيديوهات' });
        }

        // التحقق من وجود دورة بنفس العنوان
        const existingCourse = await Courses.findOne({ title: req.body.title });
        if (existingCourse) {
            return res.status(401).json({ message: 'القائمة موجودة من قبل' });
        }

        // رفع الصورة إلى Cloudinary
        const imagePath = req.files.image[0].path;
        const imageResult = await cloudinary.uploader.upload(imagePath, {
            resource_type: 'image'
        });

        // التحقق من أن الفئة موجودة
        const findcategory = await category.findOne({ name: req.body.category });
        if (!findcategory) {
            return res.status(404).json({ message: 'الفئة غير موجودة' });
        }

        // استخراج عناوين الفيديوهات من body
        const videoTitles = req.body.videoTitles ? JSON.parse(req.body.videoTitles) : [];

        // رفع كل الفيديوهات إلى Cloudinary مع عناوينها
        const videoResults = await Promise.all(
            req.files.videos.map((file, index) =>
                cloudinary.uploader.upload(file.path, {
                    resource_type: 'video'
                }).then(uploadedVideo => ({
                    url: uploadedVideo.secure_url,
                    public_id: uploadedVideo.public_id,
                    titleVedio: videoTitles[index] || `Video ${index + 1}` // تجنب الأخطاء في حالة نقص العناوين
                }))
            )
        );

        // إنشاء الدورة التدريبية
        const newCourse = new Courses({
            title: req.body.title,
            desc: req.body.desc,
            category: req.body.category,
            image: {
                url: imageResult.secure_url,
                public_id: imageResult.public_id
            },
            videos: videoResults
        });

        const savedCourse = await newCourse.save();

        // حذف الملفات المحلية بعد نجاح الإضافة
        await deleteFile(imagePath); // حذف الصورة
        await Promise.all(req.files.videos.map(file => deleteFile(file.path))); // حذف الفيديوهات

        res.status(201).json(savedCourse);

    } catch (err) {
        // في حالة الخطأ، حذف الملفات التي تم تحميلها
        await deleteFile(imagePath).catch(() => {});
        await Promise.all(req.files.videos.map(file => deleteFile(file.path))).catch(() => {});

        res.status(500).json({ error: err.message });
    }
});

// دالة حذف الملفات
async function deleteFile(path) {
    try {
        await fs.unlink(path);
    } catch (err) {
        console.error(`خطأ أثناء حذف الملف ${path}:`, err.message);
    }
}

module.exports.deleteCourse = asynchandler(async (req, res) => {
    try {
        const { id } = req.params;
        const course = await Courses.findById(id);

        if (!course) {
            return res.status(404).json({ message: 'الدورة غير موجودة' });
        }

        // حذف الصورة من Cloudinary
        await cloudinary.uploader.destroy(course.image.public_id);

        // حذف كل الفيديوهات من Cloudinary
        await Promise.all(
            course.videos.map(video => cloudinary.uploader.destroy(video.public_id, { resource_type: 'video' }))
        );

        // حذف الدورة من قاعدة البيانات
        await Courses.findByIdAndDelete(id);

        res.status(200).json({ message: 'تم حذف الدورة بنجاح' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
module.exports.getAllCourse = asynchandler(async (req, res) => {
    try {
        const course = await Courses.find();

        if (!course) {
            return res.status(404).json({ message: 'الدورة غير موجودة' });
        }



        res.status(200).json(course);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports.getCourse = asynchandler(async (req, res) => {
    try {
        const course = await Courses.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'الدورة غير موجودة' });
        }



        res.status(200).json(course);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports.editCourse = asynchandler(async (req, res) => {
    try {
        const course = await Courses.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'الدورة غير موجودة' });
        }

        let updatedData = {
            title: req.body.title,
            desc: req.body.desc,
            category: req.body.category,
            image: course.image, // الإبقاء على الصورة الحالية إذا لم يتم رفع صورة جديدة
            videos: course.videos, // الإبقاء على الفيديوهات الحالية إذا لم يتم رفع فيديوهات جديدة
        };

        // تحديث الصورة إذا تم إرسال صورة جديدة
        if (req.files && req.files.image) {
            await cloudinary.uploader.destroy(course.image.public_id); // حذف الصورة القديمة
            const imagePath = req.files.image[0].path;
            const imageResult = await cloudinary.uploader.upload(imagePath, {
                resource_type: 'image'
            });

            updatedData.image = {
                url: imageResult.secure_url,
                public_id: imageResult.public_id
            };

            await deleteFile(imagePath); // حذف الصورة المحلية
        }

        // تحديث الفيديوهات إذا تم إرسال فيديوهات جديدة
        if (req.files && req.files.videos) {
            // استخراج عناوين الفيديوهات الجديدة
            const videoTitles = req.body.videoTitles ? JSON.parse(req.body.videoTitles) : [];

            const videoResults = await Promise.all(
                req.files.videos.map((file, index) =>
                    cloudinary.uploader.upload(file.path, {
                        resource_type: 'video'
                    }).then(uploadedVideo => ({
                        url: uploadedVideo.secure_url,
                        public_id: uploadedVideo.public_id,
                        titleVedio: videoTitles[index] || `Video ${index + 1}` // ضمان وجود عنوان
                    }))
                )
            );

            // دمج الفيديوهات القديمة مع الجديدة
            updatedData.videos = [...course.videos, ...videoResults];

            // حذف الفيديوهات المحلية بعد الرفع
            await Promise.all(req.files.videos.map(file => deleteFile(file.path)));
        }

        // تنفيذ التحديث في قاعدة البيانات
        const updatedCourse = await Courses.findByIdAndUpdate(req.params.id, updatedData, { new: true });

        res.status(200).json(updatedCourse);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

