if(process.env.NODE_ENV!=='production'){
    require('dotenv').config();
}
const express=require('express');
const app=express();
const port = process.env.PORT || 8080;
const mongoose=require('mongoose');
const path=require('path');
const methodOverride=require('method-override');
const ejsMate=require('ejs-mate');
const ExpressError=require('./utils/ExpressError');
const listingRoutes=require('./routes/listing');
const reviewRoutes=require('./routes/review');
const session=require('express-session');
const MongoStore=require('connect-mongo').default;
const flash=require('connect-flash');
const User=require('./models/user');
const passport=require('passport');
const LocalStrategy=require('passport-local');
const userRoutes=require('./routes/user');

app.engine('ejs', ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')));

// async function main(){
//         await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
// }

const dbUrl = process.env.ATLASDB_URL || 'mongodb://127.0.0.1:27017/wanderlust';
const sessionSecret = process.env.SESSION_SECRET || 'change-this-secret-in-production';

if (!process.env.ATLASDB_URL) {
    console.warn('Warning: ATLASDB_URL is not set; using local MongoDB fallback.');
}
if (!process.env.SESSION_SECRET) {
    console.warn('Warning: SESSION_SECRET is not set; using fallback secret (not secure).');
}

// Start MongoDB connection but don't block server startup
mongoose.connect(dbUrl, { retryWrites: true, w: 'majority' })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('Initial MongoDB connection failed:', err.message);
        console.log('Server will continue running; MongoDB will retry...');
    });

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('disconnected', () => {
    console.warn('Mongoose disconnected from MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err.message);
});

let store;
try {
    store = MongoStore.create({
        mongoUrl: dbUrl,
        crypto: { secret: sessionSecret },
        touchAfter: 24*60*60
    });

    store.on('error', function(e){
        console.log('Session store error (non-fatal):', e);
    });
} catch (err) {
    console.warn('MongoStore creation failed, using memory store:', err.message);
    // Fallback: use default MemoryStore (not suitable for production but prevents crash)
    const session = require('express-session');
    store = new session.MemoryStore();
}

const sessionOptions={
    store,
    secret: sessionSecret,
    resave:false,
    saveUninitialized:false, 
    cookie:{
        expires:Date.now() + 1000*60*60*24*7, //1 week
        maxAge:1000*60*60*24*7,
        httpOnly:true
    }
};




app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    console.log(req.user);
    next();
});

app.use((req,res,next)=>{
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    res.locals.currentUser=req.user || null;
    res.locals.currUser=req.user || null; // backward compatibility for legacy templates
    next();
});

app.get("/demouser", async (req, res) => {
    let fakeUser = new User({
        email: "demo" + Date.now() + "@example.com",
        username: "user" + Date.now()
    });

    let registeredUser = await User.register(fakeUser, "helloworld");
    res.send(registeredUser);
});


app.get('/', (req, res) => {
    res.redirect('/listings');
});

app.use('/listings',listingRoutes);
app.use('/listings/:id/reviews',reviewRoutes);
app.use('/',userRoutes);

//Catch-all route for handling 404 errors
app.use((req,res,next)=>{
    next(new ExpressError(404, "Page Not Found"));
});

//Error handling middleware
app.use((err, req, res, next) => {
    let {statusCode=500, message="Something went wrong"} = err;
    res.render("error.ejs",{message});
    //res.status(statusCode).send(message);
});

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});


// app.get('/listings',(req,res)=>{
//     let sampleListings=new Listing(
//         {
//             title:"Beautiful Beach House",
//             description:"A stunning beach house with ocean views.",
//             price:250,
//             location:"Malibu",
//             country:"United States"
//         });
//         sampleListings.save().then(() => {
//             console.log("Sample listing saved to database");
//             res.send(sampleListings);
//         }).catch(err => {
//             console.error("Failed to save sample listing:", err);
//         });
// });

