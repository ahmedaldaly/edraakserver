const asynchandler = require('express-async-handler');
const Jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { user, validateRegister } = require('../module/User.js');

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