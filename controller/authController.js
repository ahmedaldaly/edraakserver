const asynchandler = require('express-async-handler'); // مكتبة لتسهيل التعامل مع الأخطاء داخل async/await
const Jwt = require('jsonwebtoken'); // مكتبة لإنشاء التوكن (JWT) للمصادقة
const bcrypt = require('bcrypt'); // مكتبة لتشفير كلمات المرور
const { user, validateRegister } = require('../module/User.js'); // استيراد موديل المستخدم والتحقق من البيانات
const passport = require("passport"); // مكتبة المصادقة Passport.js
const GoogleStrategy = require("passport-google-oauth20").Strategy; // استراتيجية تسجيل الدخول عبر Google OAuth 2.0

// إعداد استراتيجية Google OAuth
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID, // معرف العميل من Google
      clientSecret: process.env.CLIENT_SECRET, // المفتاح السري للعميل
      callbackURL: "http://localhost:8000/auth/google/callback", // رابط الاسترجاع بعد تسجيل الدخول
    },
    async (accessToken, refreshToken, profile, done) => { // دالة تنفيذية بعد نجاح المصادقة
      try {
        let existingUser = await user.findOne({ email: profile.emails[0].value }); // البحث عن المستخدم في قاعدة البيانات

        if (!existingUser) { // إذا لم يكن المستخدم موجودًا
          existingUser = new user({
            email: profile.emails[0].value, // تخزين البريد الإلكتروني من Google
            username: profile.displayName, // تخزين اسم المستخدم من Google
            password: "google-auth", // كلمة مرور افتراضية (لأننا لا نستخدمها مع Google)
          });

          await existingUser.save(); // حفظ المستخدم الجديد في قاعدة البيانات
        }

        // إنشاء توكن JWT للمصادقة
        const token = Jwt.sign(
          { id: existingUser._id, isAdmin: existingUser.isAdmin }, // تضمين معرف المستخدم وصلاحيته
          process.env.JWT_SECRET || "secret12727", // استخدام مفتاح سري لتشفير التوكن
          { expiresIn: "7d" } // مدة صلاحية التوكن (7 أيام)
        );

        existingUser.token = token; // تخزين التوكن في بيانات المستخدم
        await existingUser.save(); // حفظ التحديث في قاعدة البيانات

        return done(null, existingUser); // إنهاء العملية وإرجاع المستخدم
      } catch (error) {
        return done(error, null); // إذا حدث خطأ، يتم إرجاعه
      }
    }
  )
);

// مسار بدء تسجيل الدخول عبر Google
module.exports.googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"], // طلب الوصول إلى الملف الشخصي والبريد الإلكتروني
  prompt: "consent", // إجبار Google على إظهار نافذة الإذن
});

// مسار رد Google بعد تسجيل الدخول
module.exports.googleCallback = passport.authenticate("google", {
  failureRedirect: "/login", // إعادة التوجيه إلى صفحة تسجيل الدخول في حالة الفشل
  session: false, // تعطيل الجلسات لأننا نستخدم JWT
}),
  async (req, res) => {
    if (!req.user) { // التحقق مما إذا كان المستخدم قد تمت المصادقة عليه
      return res.redirect("/login"); // إذا لم يكن هناك مستخدم، يتم إعادة التوجيه إلى صفحة تسجيل الدخول
    }
    console.log("User authenticated successfully:", req.user); // طباعة بيانات المستخدم في الـ console
    res.redirect(`http://localhost:3000/profile?token=${req.user.token}`); // إعادة التوجيه إلى React مع تمرير التوكن
  };

// تسجيل خروج المستخدم
module.exports.logout = (req, res) => {
  req.logout(() => { // حذف الجلسة
    res.redirect("/"); // إعادة التوجيه إلى الصفحة الرئيسية
  });
};

module.exports.Register = asynchandler(async (req, res) => {
   try{
     // التحقق من صحة البيانات باستخدام Joi
     const { error } = validateRegister(req.body);
     if (error) {
       return res.status(400).json({ message: error.details[0].message });
     }
 
     // التحقق من وجود البريد الإلكتروني مسبقًا
     const checkemail = await user.findOne({ email: req.body.email });
     if (checkemail) {
       return res.status(400).json({ message: 'البريد الإلكتروني مستخدم بالفعل' });
     }
 
     // تشفير كلمة المرور
     const salt = await bcrypt.genSalt(10);
     const hashpassword = await bcrypt.hash(req.body.password, salt);
 
     // إنشاء مستخدم جديد
     const newuser = new user({
       email: req.body.email,
       username: req.body.username,
       password: hashpassword, // استخدام كلمة المرور المشفرة
     });
 
     // حفظ المستخدم في قاعدة البيانات
     const savedUser = await newuser.save();
 
     // إنشاء توكن JWT
     const token = Jwt.sign(
       {
         id: savedUser._id,
         isAdmin: savedUser.isAdmin,
       },
       process.env.JWT_SECRET || 'secret12727', // استبدل بمفتاحك السري
       { expiresIn: '7d' } // مدة صلاحية التوكن
     );
 
     // إضافة التوكن إلى بيانات المستخدم
     savedUser.token = token;
 
     // إرسال الاستجابة
     res.status(201).json({
       user: {
         email: savedUser.email,
         username: savedUser.username,
         isAdmin: savedUser.isAdmin,  // تم تعديل الحقل من Admin إلى isAdmin
         token: savedUser.token,      // إرسال التوكن هنا
       },
     })
   }catch(err){console.log(err)}
  
});
module.exports.login = asynchandler(async(req,res)=>{
  try{
    const email = await user.findOne({email:req.body.email})
    if(!email){
      res.status(404).json({message:'الايميل او الباسورد غلط'})
    }
    const pass = await bcrypt.compare(req.body.password , email.password)
    if(!pass){
      res.status(404).json({message:'الايميل او الباسورد غلط'})
    }

    const token = Jwt.sign(
      {
        id: email._id,
        isAdmin: email.isAdmin,
      },
      process.env.JWT_SECRET || 'secret12727', // استبدل بمفتاحك السري
      { expiresIn: '7d' } // مدة صلاحية التوكن
    );

    res.status(200).json({user:{
      email:email.email,
      username:email.username,
      token:token,
      Admin:email.isAdmin
    }})
  }catch(err){console.log(err)}
})
