const Listing=require("./models/listing");
const Review=require("./models/reviews");
const ExpressError=require("./utils/ExpressError");
const { listingSchema } = require('./schema');
const { reviewSchema } = require('./schema');


module.exports.isLoggedIn=(req,res,next)=>{
     if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl;
        req.flash("error","You must be logged in to create a listing!");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner=async(req,res,next)=>{
    const {id}=req.params;
    const listing = await Listing.findById(id);
    if(req.user && !listing.owner._id.equals(req.user._id)){
        req.flash("error","You do not have permission!");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.validateListing=(req,res,next)=>{
     let { error } = listingSchema.validate(req.body);
        if (error) {
            let errorMessage = error.details.map(el => el.message).join(', ');
            throw new ExpressError(400, errorMessage);
        }else{
            next();
        }
    };

module.exports.validateReview=(req,res,next)=>{
        let { error } = reviewSchema.validate(req.body);
             if (error) {
                    let errorMessage = error.details.map(el => el.message).join(', ');
                    throw new ExpressError(400, errorMessage);
                }else{
                    next();
                }
            };

module.exports.isReviewAuthor=async(req,res,next)=>{
    const {id,reviewId}=req.params;
    const review = await Review.findById(reviewId);
    if(req.user && !review.author.equals(req.user._id)){
        req.flash("error","You do not have permission!");
        return res.redirect(`/listings/${id}`);
    }
    next();
}