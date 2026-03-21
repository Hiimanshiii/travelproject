const Listing = require("../models/listing");
const { isLoggedIn, isOwner, validateListing } = require("../middleware");
const wrapAsync = require("../utils/wrapAsync");
const axios = require("axios");

module.exports.index=wrapAsync(async (req, res) => {
    const listings = await Listing.find({});
    res.render("listings/index", { listings });
});

module.exports.newForm = wrapAsync(async (req, res) => {
    res.render("listings/new");
});

module.exports.show = wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
    .populate({path: "reviews", populate: {path: "author"}})
    .populate("owner");
    if(!listing){
        req.flash("error","Listing not found!");
        return res.redirect("/listings");
    }
    res.render("listings/show", { listing });
});


module.exports.create = wrapAsync(async (req, res) => {
  let url = req.file ? req.file.path : "";
  let filename = req.file ? req.file.filename : "";

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };

  // 🔥 GET location from form
  const location = req.body.listing.location;

  // 🔥 API call to OpenCage
  const response = await axios.get("https://api.opencagedata.com/geocode/v1/json", {
    params: {
      q: location,
      key: process.env.OPENCAGE_API_KEY
    }
  });
console.log("API KEY:", process.env.OPENCAGE_API_KEY);
console.log("GEOCODE RESULT:", response.data.results[0]);
  // ⚠️ Safety check
  if (!response.data.results.length) {
    req.flash("error", "Invalid location");
    return res.redirect("/listings/new");
  }

  const data = response.data.results[0].geometry;

  // 🔥 SET dynamic coordinates
  newListing.coordinates = {
    lat: data.lat,
    lng: data.lng
  };

  await newListing.save();

  req.flash("success", "Listing created successfully!");
  res.redirect(`/listings/${newListing._id}`);
});

module.exports.editForm = wrapAsync(async (req, res) => {
    const {id}=req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing not found!");
        return res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload/", "/upload/h_100,w_100/");
    res.render("listings/edit",{listing, originalImageUrl});
})

module.exports.update = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const data = req.body.listing;

    let listing = await Listing.findByIdAndUpdate(
        id,
        { ...data },
        { new: true }
    );

    if (req.file) {
        listing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
        await listing.save();
    }

    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listings/${id}`);
});

module.exports.delete = wrapAsync(async (req, res) => {
    const {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","Listing deleted successfully!");
    res.redirect('/listings');
})