const mongoose = require('mongoose');
const initData=require('./data.js');
const Listing=require('../models/listing.js');
const { init } = require('../models/reviews.js');

async function main(){
        await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}
main().then(() => {
    console.log("Connected to MongoDB");
}).catch(err => {
    console.error("Failed to connect to MongoDB:", err);
});

const initDB= async () => {
    await Listing.deleteMany({});
    initData.data=initData.data.map(listing => ({...listing,
        owner: new mongoose.Types.ObjectId("69b5bdc377f276fea670d939")}));
    await Listing.insertMany(initData.data);
    console.log("Database initialized with sample data");
}

initDB();