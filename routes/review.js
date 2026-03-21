const express=require("express");
const router=express.Router({mergeParams:true});
const wrapAsync=require('../utils/wrapAsync');
const ExpressError=require('../utils/ExpressError');
const { listingSchema, reviewSchema } = require('../schema');
const Listing=require('../models/listing');
const Review=require('../models/reviews');
const { isLoggedIn,isOwner,validateReview, isReviewAuthor } = require('../middleware');
const reviewController=require('../controllers/reviews');


//Review route to add a review to a listing
router.post('/', isLoggedIn, validateReview, reviewController.createReview);

//Delete route to remove a review from a listing
router.delete('/:reviewId',isLoggedIn,isReviewAuthor,reviewController.deleteReview);

module.exports=router;