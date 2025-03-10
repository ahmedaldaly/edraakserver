const router = require('express').Router()
const {addCategory,getCategory,deleteCategory} =require('../controller/CategoryController')
const {Authorization,verifyTokenAndAdmin} = require ('../middelware/Authorization')
router.post ('/add',verifyTokenAndAdmin,addCategory)
router.route('/').get(getCategory)
router.route('/:id').delete(verifyTokenAndAdmin,deleteCategory)
module.exports =router;