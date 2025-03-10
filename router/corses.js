const router = require('express').Router()
const upload = require('../middelware/multer');
const { addCourse, getAllCourse, deleteCourse, getCourse, editCourse } = require('../controller/corsesController');
const {Authorization,verifyTokenAndAdmin} = require ('../middelware/Authorization')
// راوت لرفع الصورة ومجموعة فيديوهات
router.post('/upload-course',Authorization, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'videos', maxCount: 5 }]), addCourse);
router.get('/', getAllCourse)
router.route('/:id').delete(Authorization,deleteCourse).get(getCourse).put(Authorization,upload.fields([{ name: 'image', maxCount: 1 }, { name: 'videos', maxCount: 5 }]), editCourse)

module.exports = router;
