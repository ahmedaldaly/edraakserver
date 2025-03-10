const jwt = require('jsonwebtoken');

const Authorization = (req, res, next) => {
    let token;

    if (req.headers.authorization) {
        try {
            // استخراج التوكن
            token = req.headers.authorization.split(' ')[1];

            // فك تشفير التوكن والتحقق منه
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // تمرير بيانات المستخدم إلى `req.user`
            req.user = decoded;
            next();
        } catch (error) {
            return res.status(401).json({ message: 'غير مصرح لك، التوكن غير صالح' });
        }
    } else {
        return res.status(401).json({ message: 'غير مصرح لك، لا يوجد توكن' });
    }
};

// التحقق من أن المستخدم هو أدمن
const verifyTokenAndAdmin = (req, res, next) => {
    Authorization(req, res, () => {
        if (req.user && req.user.isAdmin) {
            next();
        } else {
            return res.status(403).json({ message: 'غير مسموح، هذه العملية مخصصة للأدمن فقط' });
        }
    });
};

module.exports = { Authorization, verifyTokenAndAdmin };
