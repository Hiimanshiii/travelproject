require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const axios = require("axios");
const Listing = require("../models/listing");

// 🔗 connect to DB
main()
  .then(() => console.log("DB connected"))
  .catch(err => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

const geocodeListings = async () => {
  const listings = await Listing.find({});

  for (let listing of listings) {
    // skip if already has coordinates
    if (listing.coordinates && listing.coordinates.lat) continue;

    try {
      console.log("Processing:", listing.location);

      const response = await axios.get(
        "https://api.opencagedata.com/geocode/v1/json",
        {
          params: {
            q: listing.location,
            key: process.env.OPENCAGE_API_KEY
          }
        }
      );

      if (!response.data.results.length) {
        console.log("❌ Not found:", listing.location);
        continue;
      }

      const { lat, lng } = response.data.results[0].geometry;

      listing.coordinates = { lat, lng };
      await listing.save();

      console.log("✅ Updated:", listing.title);

    } catch (err) {
      console.log("Error:", err.message);
    }
  }

  console.log("🎉 All listings updated!");
  mongoose.connection.close();
};

geocodeListings();