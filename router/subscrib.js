const router = require('express').Router()
const {addSubscribe,getUserSubscribe,deleteUserSubscribe} = require ('../controller/SubscribeController')
const {Authorization,verifyTokenAndAdmin} = require ('../middelware/Authorization')
// راوت لرفع الصورة ومجموعة فيديوهات
router.post('/add',Authorization,addSubscribe)
router.get('/',Authorization,getUserSubscribe)
router.delete('/:id',Authorization,deleteUserSubscribe)
module.exports = router;
