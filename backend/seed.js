require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const https = require('https');
const User = require('./models/User');
const Vendor = require('./models/Vendor');
const Product = require('./models/Product');
const DeliveryPartner = require('./models/DeliveryPartner');

const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Download image helper
const downloadImage = (url, filename) => {
    return new Promise((resolve, reject) => {
        const filepath = path.join(UPLOADS_DIR, filename);
        // If file already exists from a previous seed, skip downloading
        if (fs.existsSync(filepath)) return resolve(`/uploads/${filename}`);

        // We use Unsplash source API for realistic initial images
        https.get(url, (response) => {
            if (response.statusCode === 301 || response.statusCode === 302) {
                return downloadImage(response.headers.location, filename).then(resolve).catch(reject);
            }
            if (response.statusCode !== 200) {
                return reject(new Error(`Failed to download: ${response.statusCode}`));
            }
            const file = fs.createWriteStream(filepath);
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve(`/uploads/${filename}`);
            });
        }).on('error', (err) => {
            fs.unlink(filepath, () => { });
            reject(err);
        });
    });
};


const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for High-Volume Seeding');
    } catch (error) {
        console.error('Connection Error:', error.message);
        process.exit(1);
    }
};

const seedData = async () => {
    await connectDB();

    console.log('1. Clearing existing products and vendors...');
    await Vendor.deleteMany();
    await Product.deleteMany();

    console.log('2. Creating 5 Vendors...');
    const vendors = await Vendor.insertMany([
        {
            shopName: 'Royal Kings Biryani', ownerName: 'Ahmed', email: 'ahmed@royalkings.com', phone: '9000000001',
            passwordHash: 'Vendor@123', shopAddress: '12 Mount Road, Chennai', district: 'Chennai', category: 'Food',
            isVerified: true, openingTime: '11:00', closingTime: '23:30', location: { lat: 13.0604, lng: 80.2495 }
        },
        {
            shopName: 'Madurai Tiffin Center', ownerName: 'Murugan', email: 'murugan@maduraitiffin.com', phone: '9000000002',
            passwordHash: 'Vendor@123', shopAddress: '45 Velachery Main Rd, Chennai', district: 'Chennai', category: 'Food',
            isVerified: true, openingTime: '07:00', closingTime: '22:00', location: { lat: 12.9815, lng: 80.2180 }
        },
        {
            shopName: 'Snack Attack', ownerName: 'Priya', email: 'priya@snackattack.com', phone: '9000000003',
            passwordHash: 'Vendor@123', shopAddress: 'Besant Nagar Beach Rd, Chennai', district: 'Chennai', category: 'Snacks',
            isVerified: true, openingTime: '15:00', closingTime: '23:00', location: { lat: 13.0002, lng: 80.2736 }
        },
        {
            shopName: 'Juice Magic', ownerName: 'Karthik', email: 'karthik@juicemagic.com', phone: '9000000004',
            passwordHash: 'Vendor@123', shopAddress: 'T Nagar, Chennai', district: 'Chennai', category: 'Beverages',
            isVerified: true, openingTime: '09:00', closingTime: '21:00', location: { lat: 13.0382, lng: 80.2364 }
        },
        {
            shopName: 'Burger Brothers', ownerName: 'Sam', email: 'sam@burgerbros.com', phone: '9000000005',
            passwordHash: 'Vendor@123', shopAddress: 'Anna Nagar, Chennai', district: 'Chennai', category: 'Food',
            isVerified: true, openingTime: '11:00', closingTime: '23:59', location: { lat: 13.0850, lng: 80.2101 }
        }
    ]);

    const vBiryani = vendors[0];
    const vTiffin = vendors[1];
    const vSnacks = vendors[2];
    const vJuice = vendors[3];
    const vBurger = vendors[4];

    console.log('3. Downloading images and generating 30+ products... (This may take a minute)');

    const productsToSeed = [
        // Royal Kings Biryani
        { vendorId: vBiryani._id, name: 'Chicken Dum Biryani', category: 'Food', subCategory: 'Rice Dishes', price: 250, description: 'Classic basmati dum biryani with raita', imgQuery: 'chicken,biryani' },
        { vendorId: vBiryani._id, name: 'Mutton Biryani', category: 'Food', subCategory: 'Rice Dishes', price: 380, description: 'Spicy tender mutton biryani', imgQuery: 'meat,biryani' },
        { vendorId: vBiryani._id, name: 'Chicken 65', category: 'Food', subCategory: 'Non-Veg', price: 160, description: 'Crispy fried spicy chicken bites', imgQuery: 'fried,chicken' },
        { vendorId: vBiryani._id, name: 'Tandoori Chicken (Half)', category: 'Food', subCategory: 'Non-Veg', price: 220, description: 'Fire roasted tandoori chicken', imgQuery: 'tandoori,chicken' },
        { vendorId: vBiryani._id, name: 'Egg Fried Rice', category: 'Food', subCategory: 'Rice Dishes', price: 130, description: 'Wok tossed egg fried rice', imgQuery: 'fried,rice' },
        { vendorId: vBiryani._id, name: 'Chicken Lollipop (6 pcs)', category: 'Food', subCategory: 'Non-Veg', price: 190, description: 'Spicy chicken wings', imgQuery: 'chicken,wings' },

        // Madurai Tiffin Center
        { vendorId: vTiffin._id, name: 'Idli (3 pcs)', category: 'Food', subCategory: 'Tiffin', price: 45, description: 'Soft fluffy idlis with 3 chutneys', imgQuery: 'idli,south-indian' },
        { vendorId: vTiffin._id, name: 'Masala Dosa', category: 'Food', subCategory: 'Tiffin', price: 80, description: 'Crispy dosa with potato filling', imgQuery: 'masala,dosa' },
        { vendorId: vTiffin._id, name: 'Ghee Roast Dosa', category: 'Food', subCategory: 'Tiffin', price: 95, description: 'Crispy dosa roasted in pure ghee', imgQuery: 'dosa,ghee' },
        { vendorId: vTiffin._id, name: 'Pongal', category: 'Food', subCategory: 'Tiffin', price: 65, description: 'Ghee pongal with sambar', imgQuery: 'pongal,food' },
        { vendorId: vTiffin._id, name: 'South Indian Meals', category: 'Food', subCategory: 'Meals', price: 120, description: 'Full vegetarian thali', imgQuery: 'thali,indian' },
        { vendorId: vTiffin._id, name: 'Parotta (2 pcs) with Salna', category: 'Food', subCategory: 'Tiffin', price: 60, description: 'Flaky parotta with veg salna', imgQuery: 'paratha,indian' },

        // Snack Attack
        { vendorId: vSnacks._id, name: 'Pani Puri (6 pcs)', category: 'Snacks', subCategory: 'Chaat', price: 40, description: 'Crispy puris with spicy mint water', imgQuery: 'panipuri,chaat' },
        { vendorId: vSnacks._id, name: 'Bhel Puri', category: 'Snacks', subCategory: 'Chaat', price: 50, description: 'Puffed rice and tangy tamarind mix', imgQuery: 'indian,snacks' },
        { vendorId: vSnacks._id, name: 'Aloo Samosa (2 pcs)', category: 'Snacks', subCategory: 'Snacks', price: 30, description: 'Hot potato samosas', imgQuery: 'samosa' },
        { vendorId: vSnacks._id, name: 'Pav Bhaji', category: 'Snacks', subCategory: 'Fast Food', price: 90, description: 'Spicy mashed veggies with butter bread', imgQuery: 'pavbhaji' },
        { vendorId: vSnacks._id, name: 'French Fries', category: 'Snacks', subCategory: 'Fast Food', price: 80, description: 'Crispy salted potato fries', imgQuery: 'french,fries' },
        { vendorId: vSnacks._id, name: 'Veg Cutlet (2 pcs)', category: 'Snacks', subCategory: 'Snacks', price: 40, description: 'Crispy mixed vegetable patties', imgQuery: 'cutlet,food' },
        { vendorId: vSnacks._id, name: 'Mixture (250g)', category: 'Snacks', subCategory: 'Snacks', price: 80, description: 'Classic South Indian savory mixture', imgQuery: 'snacks,namkeen' },

        // Juice Magic
        { vendorId: vJuice._id, name: 'Fresh Watermelon Juice', category: 'Beverages', subCategory: 'Beverages', price: 60, description: 'Chilled watermelon juice', imgQuery: 'watermelon,juice' },
        { vendorId: vJuice._id, name: 'Mango Milkshake', category: 'Beverages', subCategory: 'Beverages', price: 90, description: 'Thick mango shake with ice cream', imgQuery: 'mango,shake' },
        { vendorId: vJuice._id, name: 'Cold Coffee', category: 'Beverages', subCategory: 'Beverages', price: 80, description: 'Iced coffee blend', imgQuery: 'cold,coffee' },
        { vendorId: vJuice._id, name: 'Rose Milk', category: 'Beverages', subCategory: 'Beverages', price: 50, description: 'Classic chilled rose milk', imgQuery: 'pink,drink' },
        { vendorId: vJuice._id, name: 'Lime Mint Cooler', category: 'Beverages', subCategory: 'Beverages', price: 40, description: 'Refreshing lime and mint drink', imgQuery: 'lime,mint,drink' },
        { vendorId: vJuice._id, name: 'Oreo Thick Shake', category: 'Beverages', subCategory: 'Beverages', price: 110, description: 'Chocolate Oreo blended shake', imgQuery: 'oreo,shake' },

        // Burger Brothers
        { vendorId: vBurger._id, name: 'Classic Chicken Burger', category: 'Food', subCategory: 'Fast Food', price: 150, description: 'Crispy chicken patty with lettuce & mayo', imgQuery: 'chicken,burger' },
        { vendorId: vBurger._id, name: 'Double Cheese Veg Burger', category: 'Food', subCategory: 'Fast Food', price: 130, description: 'Veg patty loaded with cheese', imgQuery: 'veg,burger' },
        { vendorId: vBurger._id, name: 'Chicken Wrap', category: 'Food', subCategory: 'Fast Food', price: 140, description: 'Tortilla wrapped chicken and veggies', imgQuery: 'chicken,wrap' },
        { vendorId: vBurger._id, name: 'Margherita Pizza (8")', category: 'Food', subCategory: 'Fast Food', price: 199, description: 'Classic cheese and tomato pizza', imgQuery: 'cheese,pizza' },
        { vendorId: vBurger._id, name: 'Chicken BBQ Pizza (8")', category: 'Food', subCategory: 'Fast Food', price: 249, description: 'BBQ chicken and onion pizza', imgQuery: 'chicken,pizza' },
        { vendorId: vBurger._id, name: 'Loaded Nachos', category: 'Snacks', subCategory: 'Fast Food', price: 120, description: 'Nachos with cheese block and salsa', imgQuery: 'nachos,cheese' }
    ];

    const finalProducts = [];
    for (const p of productsToSeed) {
        const filename = `${p.imgQuery.replace(/,/g, '_')}_${Date.now().toString().slice(-4)}.jpg`;
        // Fetch a random food image via Unsplash Source based on keywords 
        // 400x300 size
        try {
            const url = `https://loremflickr.com/400/300/${p.imgQuery}`;
            const imagePath = await downloadImage(url, filename);

            finalProducts.push({
                vendorId: p.vendorId,
                name: p.name,
                category: p.category,
                subCategory: p.subCategory,
                price: p.price,
                description: p.description,
                image: imagePath
            });
            process.stdout.write('.');
        } catch (err) {
            console.log(`Failed to download image for ${p.name}, using fallback.`);
            finalProducts.push({
                vendorId: p.vendorId, name: p.name, category: p.category, subCategory: p.subCategory,
                price: p.price, description: p.description, image: `https://loremflickr.com/400/300/${p.imgQuery}`
            });
        }
    }
    console.log();

    await Product.insertMany(finalProducts);

    console.log(`Seed completed successfully! Added ${vendors.length} Vendors and ${finalProducts.length} Products with images.`);
    process.exit(0);
};

seedData();
