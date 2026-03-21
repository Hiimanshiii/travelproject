const express=require("express");
const router=express.Router();
const wrapAsync=require('../utils/wrapAsync');
const { listingSchema, reviewSchema } = require('../schema');
const Listing=require('../models/listing');
const { isLoggedIn,isOwner } = require('../middleware');
const { validateListing } = require('../middleware');
const listingControllers=require('../controllers/listings');
const multer=require('multer'); 
const { storage } = require('../cloudConfig');
const upload=multer({storage});

//Index route to display all listings
router.get('/',listingControllers.index);

//Route to display form for creating new listing
router.get('/new',isLoggedIn,listingControllers.newForm);


//Show route to display a single listing
router.get("/:id", listingControllers.show);

//Create route to add new listing to database
router.post('/',isLoggedIn,validateListing,upload.single('listing[image]'),listingControllers.create);

//Edit route to display form for editing a listing
router.get('/:id/edit',
    isLoggedIn,
    isOwner,
    listingControllers.editForm
  );

//Update route to update a listing in the database
router.put("/:id",
    isLoggedIn,
    isOwner,
    upload.single('listing[image]'),
validateListing,
listingControllers.update
);

//Delete route to remove a listing from the database
router.delete('/:id',
    isLoggedIn,
    isOwner,
listingControllers.delete);

module.exports=router;