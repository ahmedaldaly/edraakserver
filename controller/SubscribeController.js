const asynchandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const { Subscribe } = require('../module/Subscribe');
const { user } = require('../module/User');
const Course = require('../module/Corses')
module.exports.addSubscribe = asynchandler(async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        // فك تشفير التوكن
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const finduser = await user.findById(decoded.id);

        if (!finduser) {
            return res.status(404).json({ message: 'user Not Found' });
        }

        

        // التحقق من وجود الاشتراك مسبقًا لنفس المستخدم ونفس المنتج
        const existingSubscrib = await Subscribe.findOne({ userId: decoded.id, subscrib: req.body.subscrib });
        if (existingSubscrib) {
            return res.status(400).json({ message: 'Subscription already exists for this user and product' });
        }

        // إنشاء اشتراك جديد
        const newSubscrib = new Subscribe({
            userId: decoded.id,
            subscrib: req.body.subscrib,
        });

        await newSubscrib.save();
        return res.status(201).json(newSubscrib);

    } catch (err) {
        return res.status(400).json({ message: "Invalid token or request error", error: err.message });
    }
});


module.exports.getUserSubscribe = asynchandler(async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        // فك تشفير التوكن
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const finduser = await user.findById(decoded.id);
       
        if (!finduser) {
            return res.status(404).json({ message: 'user Not Found' });
        }

        // التحقق من وجود الاشتراك مسبقًا لنفس المستخدم ونفس المنتج
        const existingSubscrib = await Subscribe.find({ userId: decoded.id });
        // استخراج جميع معرفات الدورات من الاشتراكات
        const courseIds = existingSubscrib.map(sub => sub.subscrib);
        const Ids = existingSubscrib.map(sub => sub._id);
        // البحث عن جميع الدورات التي اشترك فيها المستخدم
        const courses = await Course.find({ _id: { $in: courseIds } });
        
        return res.status(201).json({Ids:Ids,courses:courses});

    } catch (err) {
        return res.status(400).json({ message: "Invalid token or request error", error: err.message });
    }
});


module.exports.deleteUserSubscribe = asynchandler(async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        // فك تشفير التوكن للحصول على بيانات المستخدم
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // البحث عن الاشتراك
        const existingSubscrib = await Subscribe.findById(req.params.id);

        if (!existingSubscrib) {
            return res.status(404).json({ message: 'Subscription not found' });
        }

        // التأكد من أن المستخدم يملك هذا الاشتراك
        if (existingSubscrib.userId.toString() !== decoded.id) {
            return res.status(403).json({ message: "Not authorized to delete this subscription" });
        }

        // حذف الاشتراك
        await Subscribe.findByIdAndDelete(req.params.id);

        return res.status(200).json({ message: "Subscription deleted successfully" });

    } catch (err) {
        return res.status(400).json({ message: "Invalid token or request error", error: err.message });
    }
});
