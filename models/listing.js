const mongoose=require("mongoose");
const Review=require("./reviews");

const listingSchema=new mongoose.Schema({
    title:String,
    description:String,
  image: {
    url: String,
    filename: String
},
    price:Number,
    location:String,
    country:String,
    reviews:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Review"
        }
    ],
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    coordinates: {
  lat: Number,
  lng: Number
    }
});

listingSchema.post('findOneAndDelete', async function(listing) {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

const Listing=mongoose.model("Listing",listingSchema);
module.exports=Listing;