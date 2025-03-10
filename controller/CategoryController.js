const asyncHandler = require('express-async-handler');
const { category, validateCategory } = require('../module/Category');

module.exports.addCategory = asyncHandler(async (req, res) => {
    // ✅ التحقق من البيانات باستخدام Joi
    const { error } = validateCategory(req.body);
    if (error) {
        return res.status(400).json({ message: 'هناك خطأ في البيانات' });
    }

    // ✅ التحقق مما إذا كان التصنيف موجودًا بالفعل
    const find = await category.findOne({ name: req.body.name });
    if (find) {
        return res.status(401).json({ message: 'التصنيف موجود بالفعل' });
    }

    // ✅ إنشاء التصنيف الجديد
    const addCategory = new category({
        name: req.body.name
    });

    await addCategory.save();
    res.status(201).json(addCategory);
});
module.exports.getCategory = asyncHandler(async (req, res) => {
   

   try{ // ✅ التحقق مما إذا كان التصنيف موجودًا بالفعل
    const find = await category.find();
    if (!find) {
        return res.status(401).json({ message: 'لم يتم العصور علي اي تصنيفات' });
    }
    res.status(200).json(find);}catch(err){
        res.status(500).json(err)
    }
});
module.exports.deleteCategory = asyncHandler(async (req, res) => {
   
try{
     // ✅ التحقق مما إذا كان التصنيف موجودًا بالفعل
     const find = await category.findById(req.params.id);
     if (!find) {
         return res.status(401).json({ message: 'لم يتم العصور علي اي تصنيفات' });
     }
     const dele = await category.findByIdAndDelete(req.params.id)
     res.status(200).json({message:'تم الحذف بنجاح'});
}catch(err){
    res.status(500).json(err)
}
   
});
