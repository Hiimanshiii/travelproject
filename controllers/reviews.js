const Review=require('../models/reviews');
const Listing=require('../models/listing');
const wrapAsync=require('../utils/wrapAsync');

module.exports.createReview = wrapAsync(async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id);

    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    req.flash("success","Review added successfully!");
    res.redirect(`/listings/${id}`);
})

module.exports.deleteReview = wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Review deleted successfully!");
    res.redirect(`/listings/${id}`);
})