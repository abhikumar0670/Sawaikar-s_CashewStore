const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

// Sample product data matching frontend structure
const sampleProducts = [
  {
    id: "product1",
    name: "Premium Cashews",
    price: 150000,
    image: [
      "https://5.imimg.com/data5/JW/HP/MY-39690665/premium-cashew-nut-500x500.jpg",
      "https://d3kgrlupo77sg7.cloudfront.net/media/chococoorgspice.com/images/products/organic-coorg-cashew-nuts-500-gm-coorg-dry-fruits-whole-big-size.20220919003557.webp",
      "https://kanwarjis.in/cdn/shop/files/Cashew3.webp?v=1727696207",
      "https://royalfantasy.in/cdn/shop/products/Cashew-Nuts-Small-1.jpg?v=1627471481"
    ],
    category: "dry fruits",
    company: "HealthyBites",
    description: "High-quality premium cashews with a rich taste.",
    colors: ["#ff0000"],
    stock: 8,
    numReviews: 150,
    rating: 4.9,
    featured: true,
    shipping: true,
    variants: [
      { weight: '250g', price: 45000, stock: 20 },
      { weight: '500g', price: 85000, stock: 15 },
      { weight: '1kg', price: 150000, stock: 8 }
    ],
    defaultWeight: '500g'
  },
  {
    id: "product2",
    name: "Organic Almonds",
    price: 120000,
    image: [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSot_aTLnVz8sRdgRj76HbkEe-8Ei1tKToEHA&s",
      "https://www.greendna.in/cdn/shop/products/almond2_1200x1200.jpeg?v=1564303633",
      "https://cowberry-static.s3.ap-south-1.amazonaws.com/static/uploads/products/cowberry-6682649521733374165.jpg",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVsn9mJP1eFnWFBycA1A7bKbPGw_X4XPu6jw&s"
    ],
    category: "nuts",
    company: "NuttyDelight",
    description: "Fresh organic almonds packed with nutrients.",
    colors: ["#000"],
    stock: 8,
    numReviews: 120,
    rating: 4.5,
    featured: false,
    shipping: true,
    variants: [
      { weight: '250g', price: 35000, stock: 25 },
      { weight: '500g', price: 65000, stock: 18 },
      { weight: '1kg', price: 120000, stock: 8 }
    ],
    defaultWeight: '500g'
  },
  {
    id: "product3",
    name: "Natural Walnuts",
    price: 170000,
    image: [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSA0PO9XYcGyd4Dxuos6IThn4EKFSo44l5FPA&s",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6qIX6hXySwBhDa3qNAkGnRZ5sX0pm_x-1gQ&s",
      "https://images-prod.healthline.com/hlcmsresource/images/AN_images/benefits-of-walnuts-1296x728-feature.jpg",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqwtMgQjpd-BTAR47DSHsP80SmUlHlaZEGUg&s"
    ],
    category: "nuts",
    company: "Nature's Basket",
    description: "Rich and crunchy walnuts full of omega-3s.",
    colors: ["#22D3EF"],
    stock: 5,
    numReviews: 125,
    rating: 4.2,
    featured: true,
    shipping: false,
    variants: [
      { weight: '250g', price: 50000, stock: 12 },
      { weight: '500g', price: 95000, stock: 10 },
      { weight: '1kg', price: 170000, stock: 5 }
    ],
    defaultWeight: '500g'
  },
  {
    id: "product4",
    name: "Dried Figs",
    price: 140000,
    image: [
      "https://www.greendna.in/cdn/shop/files/dryfig6_600x.jpg?v=1710672994",
      "https://ayoubs.ca/cdn/shop/articles/dried_figs_520x500_520x500_2f44883e-6fe8-4993-b160-f7df8dcd8d3f_500x.png?v=1744047961",
      "https://fairfieldcheese.com/cdn/shop/products/Untitleddesign_11.png?v=1630964430&width=600"
    ],
    category: "dry fruits",
    company: "Fruit Harvest",
    description: "Sweet and chewy dried figs perfect for snacking.",
    colors: ["#CDD0D0"],
    stock: 6,
    numReviews: 96,
    rating: 4.0,
    featured: false,
    shipping: true,
    variants: [
      { weight: '250g', price: 40000, stock: 15 },
      { weight: '500g', price: 75000, stock: 12 },
      { weight: '1kg', price: 140000, stock: 6 }
    ],
    defaultWeight: '500g'
  },
  {
    id: "product5",
    name: "Dry-Dates",
    price: 160000,
    image: [
      "https://www.aldahome.com/media/catalog/product/p/r/premium-red-dry-dates-chuhara.jpg",
      "https://daivikorganic.com/cdn/shop/products/4_45136c9c-702e-4916-acf8-448330f32134.png?v=1670409164",
      "https://marudharmewa.com/cdn/shop/files/C5D_3949.webp?v=1715949146",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQoMHp-es0nv6HBONn_pIg3KD1-BJbDIdr6MA&s"
    ],
    category: "dry-dates",
    company: "CrunchyDelight",
    description: "Lightly salted roasted cashews with a crunchy texture.",
    colors: ["#000"],
    stock: 4,
    numReviews: 89,
    rating: 4.6,
    featured: true,
    shipping: true,
    variants: [
      { weight: '250g', price: 45000, stock: 20 },
      { weight: '500g', price: 85000, stock: 10 },
      { weight: '1kg', price: 160000, stock: 4 }
    ],
    defaultWeight: '500g'
  },
  {
    id: "product6",
    name: "Dry Fruits Hamper",
    price: 180000,
    image: [
      "https://images.prestogifts.com/upload/Gift-Combos/Gift-Hampers/GH06/1431X1431/62dae23212c13_1a.jpg",
      "https://snaktime.in/images/chocolates/new-year-gift-hamper-with-dry-fruits-1.jpg",
      "https://m.media-amazon.com/images/I/91IVJBUPCBL.jpg",
      "https://www.zupppy.com/wp-content/uploads/2024/03/WhatsApp-Image-2024-03-29-at-13.38.16_ac4d0ec6.jpg"
    ],
    category: "dry fruits",
    company: "NuttyFlavors",
    description: "Spicy flavored cashews for an extra zing.",
    colors: ["#ff0000"],
    stock: 9,
    numReviews: 98,
    rating: 4.8,
    featured: false,
    shipping: false,
    variants: [
      { weight: '500g', price: 90000, stock: 15 },
      { weight: '1kg', price: 180000, stock: 9 },
      { weight: '2kg', price: 340000, stock: 5 }
    ],
    defaultWeight: '1kg'
  },
  {
    id: "product7",
    name: "Flavored Cashews - Honey Roasted",
    price: 190000,
    image: [
      "https://www.beyondthechickencoop.com/wp-content/uploads/2022/05/Honey-Roasted-Cashews.jpg",
      "https://5.imimg.com/data5/SELLER/Default/2022/5/NE/JH/BJ/152317219/flavored-cashew-png.png",
      "https://thebellyrulesthemind.net/wp-content/uploads/2021/02/Roasted-cashew-nuts-3-flavors-5-720x720.png",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRd_2CllPC1UtefJCRdFYBiYUY3TygIcflG3A&s"
    ],
    category: "flavored cashews",
    company: "NuttyFlavors",
    description: "Sweet honey-roasted cashews for a delicious treat.",
    colors: ["#22D3EF"],
    stock: 6,
    numReviews: 115,
    rating: 4.2,
    featured: true,
    shipping: true,
    variants: [
      { weight: '250g', price: 55000, stock: 18 },
      { weight: '500g', price: 100000, stock: 12 },
      { weight: '1kg', price: 190000, stock: 6 }
    ],
    defaultWeight: '500g'
  },
  {
    id: "product8",
    name: "Trail Mix",
    price: 160000,
    image: [
      "https://www.aromaco.com/wp-content/uploads/2021/08/OrangeQuoteCatsFacebookCover28129-1200x676.png",
      "https://www.eatingbirdfood.com/wp-content/uploads/2022/11/superfood-trail-mix-hero.jpg",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZrN2rCfRM3KiqAfFXooRkTwBbCEvDyfEqI2cjZSkQT0V5dkcJ2elm9eRJAjt9go_KsPs&usqp=CAU",
      "https://feelgoodfoodie.net/wp-content/uploads/2024/06/Trail-Mix-08.jpg"
    ],
    category: "snacks",
    company: "HealthyBites",
    description: "A healthy mix of nuts, seeds, and dried fruits.",
    colors: ["#22D3EF"],
    stock: 7,
    numReviews: 96,
    rating: 4.0,
    featured: true,
    shipping: true,
    variants: [
      { weight: '250g', price: 45000, stock: 20 },
      { weight: '500g', price: 85000, stock: 15 },
      { weight: '1kg', price: 160000, stock: 7 }
    ],
    defaultWeight: '500g'
  },
  {
    id: "product9",
    name: "Granola Bars",
    price: 80000,
    image: [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4VGqFK--IWCbgPLTukmOtiXm_w-pT6sV2VQ&s",
      "https://www.paleorunningmomma.com/wp-content/uploads/2021/03/peanut-butter-granola-bars-5.jpg",
      "https://www.redpathsugar.com/sites/redpathsugar_com/files/styles/m/public/2024-08/No_Bake_Granola_Bars-600x400.jpg.webp?itok=QdpX2AI9",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTptK4S9Xqm3zZZgzkYq30smIpOTM0BOfTYre_kdf1-SSQzhyEH2nJoQajrfToPezmnVs4&usqp=CAU"
    ],
    category: "snacks",
    company: "NuttyDelight",
    description: "Crunchy granola bars for a quick energy boost.",
    colors: ["#CDD0D0"],
    stock: 8,
    numReviews: 122,
    rating: 4.6,
    featured: false,
    shipping: true,
    variants: [
      { weight: '100g', price: 25000, stock: 30 },
      { weight: '250g', price: 45000, stock: 20 },
      { weight: '500g', price: 80000, stock: 8 }
    ],
    defaultWeight: '250g'
  },
  {
    id: "product10",
    name: "Roasted Chickpeas",
    price: 100000,
    image: [
      "https://www.eatingwell.com/thmb/U9XX4O3Ds4geco7uTt-t6LeKsYE=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/Spice-Roasted-Chickpeas-2-454859750de34b71bb8c900d35852844.jpg"
    ],
    category: "snacks",
    company: "Golden Harvest",
    description: "Crunchy roasted chickpeas seasoned to perfection.",
    colors: ["#000"],
    stock: 6,
    numReviews: 88,
    rating: 4.7,
    featured: false,
    shipping: false,
    variants: [
      { weight: '250g', price: 30000, stock: 25 },
      { weight: '500g', price: 55000, stock: 15 },
      { weight: '1kg', price: 100000, stock: 6 }
    ],
    defaultWeight: '500g'
  },
  {
    id: "product11",
    name: "Pistachios",
    price: 180000,
    image: [
      "https://images.healthshots.com/healthshots/en/uploads/2023/09/04073149/pistachip-1600x900.jpg",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUtAIDhVm8nSd7nm18oLigkeYQcu0_2Fv1jQ&s",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbpNqpe6cBBgnN8JkB9z_wYCOb_PYbQh6LBA&s",
      "https://nuttygritties.com/cdn/shop/products/71zUpdUXAPL._SX679_8a2400f6-48e2-4f45-bd8b-90219558d476_1024x1024.jpg?v=1704713139",
      "https://images-cdn.ubuy.co.in/667df3105590fa2fca56fc5f-wonderful-roasted-salted-pistachios.jpg"
    ],
    category: "nuts",
    company: "NuttyDelight",
    description: "Fresh pistachios with a delicious crunch.",
    colors: ["#22D3EF"],
    stock: 9,
    variants: [
      { weight: '250g', price: 55000, stock: 20 },
      { weight: '500g', price: 100000, stock: 15 },
      { weight: '1kg', price: 180000, stock: 9 }
    ],
    defaultWeight: '500g',
    numReviews: 89,
    rating: 4.8,
    featured: true,
    shipping: false
  },
  {
    id: "product12",
    name: "Raisins",
    price: 120000,
    image: [
      "https://images.meesho.com/images/products/295937458/qra1i_512.webp",
      "https://www.sendbestgift.com/assets/images/product/Raisins.jpg",
      "https://cdn-prod.medicalnewstoday.com/content/images/articles/325/325127/raisins-on-a-wooden-spoon.jpg",
      "https://d146hunxuupfmg.cloudfront.net/blog_images/black_raisins.webp"
    ],
    category: "dry fruits",
    company: "Golden Harvest",
    description: "Naturally sweet raisins for a healthy snack.",
    colors: ["#ff0000"],
    stock: 8,
    numReviews: 115,
    rating: 4.9,
    featured: false,
    shipping: true,
    variants: [
      { weight: '250g', price: 35000, stock: 25 },
      { weight: '500g', price: 65000, stock: 18 },
      { weight: '1kg', price: 120000, stock: 8 }
    ],
    defaultWeight: '500g'
  },
  {
    id: "product13",
    name: "Dry Fruit Energy Bites",
    price: 95000,
    image: [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjKoTsw_UdoBjKeobJF3WaVUn1_temwx7lAg&s",
      "https://withsaltandwit.com/wp-content/uploads/2015/01/Fruit-Nut-Trail-Mix-Energy-Bites_-5.jpg",
      "https://www.layersofhappiness.com/wp-content/uploads/2014/05/HealthyAlmond-Energy-Balls.jpg",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7Y3z9bj7IBj5vhIYk9j9Cxb0HmwTASy04iQ&s"
    ],
    category: "sweets",
    company: "CrunchyDelight",
    description: "Hand Made product. Authentic product.",
    colors: ["#F5DEB3"],
    stock: 10,
    numReviews: 250,
    rating: 4.9,
    featured: true,
    shipping: true,
    variants: [
      { weight: '250g', price: 30000, stock: 25 },
      { weight: '500g', price: 55000, stock: 15 },
      { weight: '1kg', price: 95000, stock: 10 }
    ],
    defaultWeight: '500g'
  },
  {
    id: "product14",
    name: "Kaju Katli Dry Fruit Sweet",
    price: 155000,
    image: [
      "https://jainvijay.in/img/Products/sweet/regular%20items/dry%20fruit%20kaju%20katri/Bg.jpg",
      "https://www.shreemithai.com/cdn/shop/products/kaju-dry-fruit-burfi-773541.jpg?v=1707819886&width=700",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_dm9xi6pRlAbIWeEdWNsQjewPgnN39gCLUQ&s",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzIip4f76fb2Yjumr0ueAtC3CtdZU5XSV5yQ&s"
    ],
    category: "sweets",
    company: "HealthyBites",
    description: "Hand Made product. Authentic product.",
    colors: ["#F5DEB3"],
    stock: 15,
    numReviews: 230,
    rating: 4.8,
    featured: true,
    shipping: true,
    variants: [
      { weight: '250g', price: 45000, stock: 30 },
      { weight: '500g', price: 85000, stock: 20 },
      { weight: '1kg', price: 155000, stock: 15 }
    ],
    defaultWeight: '500g'
  },
  {
    id: "product15",
    name: "Stuffed Dates with Almonds",
    price: 120000,
    image: [
      "https://img.taste.com.au/zrJDqpk8/taste/2016/11/almond-stuffed-dates-6748-1.jpeg",
      "https://images.eatthismuch.com/med/343996_tabitharwheeler_de1a76c5-083f-4a38-939b-00c85f1f4187.jpg",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjSoU2EK0ssGwrif1yQvM3TVSfM68uSXMVqw&s",
      "https://www.unicornsinthekitchen.com/wp-content/uploads/2018/06/stuffed-dates-sq.jpg"
    ],
    category: "dry fruits",
    company: "CrunchyDelight",
    description: "High-quality premium dry fruits with a rich taste.",
    colors: ["#F5DEB3"],
    stock: 10,
    numReviews: 150,
    rating: 4.3,
    featured: true,
    shipping: true,
    variants: [
      { weight: '250g', price: 35000, stock: 20 },
      { weight: '500g', price: 65000, stock: 15 },
      { weight: '1kg', price: 120000, stock: 10 }
    ],
    defaultWeight: '500g'
  },
  {
    id: "product16",
    name: "Dry Fruit Laddu",
    price: 135000,
    image: [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwVzdpdKMRhrLOLlo0b_sqjyl0fwoyEqJxnQ&s",
      "https://www.cookclickndevour.com/wp-content/uploads/2019/09/dry-fruits-laddu-recipe-2.jpg",
      "https://patnamlopalleruchulu.in/wp-content/uploads/2024/09/Dry-fruits-laddu-560x580.png",
      "https://www.kartiksmithai.com/cdn/shop/products/Untitleddesign-2022-03-15T175707.965.png?v=1647352412"
    ],
    category: "sweets",
    company: "HealthyBites",
    description: "High-quality premium dry fruits laddu with a rich taste.",
    colors: ["#F5DEB3"],
    stock: 15,
    numReviews: 220,
    rating: 4.7,
    featured: true,
    shipping: true,
    variants: [
      { weight: '250g', price: 40000, stock: 25 },
      { weight: '500g', price: 75000, stock: 20 },
      { weight: '1kg', price: 135000, stock: 15 }
    ],
    defaultWeight: '500g'
  },
  {
    id: "product17",
    name: "Hazelnuts",
    price: 165000,
    image: [
      "https://www.greendna.in/cdn/shop/products/hnut.jpg?v=1567521689",
      "https://www.greendna.in/cdn/shop/products/hnut.jpg?v=1567521689",
      "https://thebakingtools.com/cdn/shop/files/thebakingtools-com-50-grams-hazelnut-kernels-38545125703868.png?v=1742652385",
      "https://cdn.shopify.com/s/files/1/0437/8953/files/Hazelnuts.png?v=1652477908"
    ],
    category: "dry fruits",
    company: "HealthyBites",
    description: "High-quality hazelnuts.",
    colors: ["#F5DEB3"],
    stock: 7,
    numReviews: 160,
    rating: 4.2,
    featured: true,
    shipping: true,
    variants: [
      { weight: '250g', price: 50000, stock: 18 },
      { weight: '500g', price: 90000, stock: 12 },
      { weight: '1kg', price: 165000, stock: 7 }
    ],
    defaultWeight: '500g'
  },
  {
    id: "product18",
    name: "Pine Nuts (Chilgoza)",
    price: 90000,
    image: [
      "https://staticimg.amarujala.com/assets/images/2024/09/28/chilgoza_a25fde0cf512bf041e02955bcbd5c473.jpeg?w=1200",
      "https://www.thukralfoods.com/wp-content/uploads/2022/03/pine-nuts-unshelled-600x400.jpg",
      "https://triphal.com/cdn/shop/files/1220212000041_1.jpg?v=1686831785&width=1445",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrucrzJv0WHs_oPcVAj1sbI0JZyMupiyVRdg&s"
    ],
    category: "dry fruits",
    company: "Golden Harvest",
    description: "High-quality premium Pine Nuts.",
    colors: ["#F5DEB3"],
    stock: 5,
    numReviews: 120,
    rating: 4.1,
    variants: [
      { weight: '100g', price: 25000, stock: 15 },
      { weight: '250g', price: 55000, stock: 10 },
      { weight: '500g', price: 90000, stock: 5 }
    ],
    defaultWeight: '250g',
    featured: true,
    shipping: true
  },
  {
    id: "product19",
    name: "Organic Blueberries",
    price: 600000,
    image: [
      "https://m.media-amazon.com/images/I/71oJlHDge3L.jpg",
      "https://cdn.shopaccino.com/rootz/products/blueberry-2-361710558531335_m.jpg?v=562",
      "https://image.made-in-china.com/202f0j00uUrkbpngqDzI/Natural-Organic-Freeze-Dried-Wild-Blueberry-Fruit-Juice-Powder.webp",
      "https://images.squarespace-cdn.com/content/v1/58ebe6632994ca71ba304549/1491938746710-RE9ICCSBHSDYRFNJU5WG/image-asset.jpeg"
    ],
    category: "berries",
    company: "HealthyBites",
    description: "High-quality Organic Blueberries with a rich taste.",
    colors: ["#4169E1"],
    stock: 9,
    numReviews: 180,
    rating: 4.9,
    featured: true,
    shipping: false
  },
  {
    id: "product20",
    name: "Organic Cranberries",
    price: 150000,
    image: [
      "https://www.melissas.com/cdn/shop/files/image-of-organic-cranberries-fruit-1125637327_600x600.jpg?v=1738768960",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbwDLTRoz1KdqIVOOlpPSnA3tjdnQgfGzjpA&s",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbLTinPzNvk2fOboHwpqQxFvTSKDELVR5D6A&s",
      "https://satopradhan.com/cdn/shop/products/cranberries-whole-dried-organically-cultivated-and-naturally-dehydrated-in-200g-pack-unsweetened-and-unsulphured-without-synthetic-flavourscolors-or-chemical-preservatives-satopradhan-2-31584937115874_728x728.jpg?v=1702970694"
    ],
    category: "berries",
    company: "HealthyBites",
    description: "High-quality Organic Cranberries with a rich taste.",
    colors: ["#DC143C"],
    stock: 6,
    numReviews: 110,
    rating: 4.2,
    featured: true,
    shipping: false
  }
];

// Connect to MongoDB and seed data
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/SawaikarCashew');
    console.log('✅ Connected to MongoDB');
    
    // Clear existing products
    await Product.deleteMany({});
    console.log('🗑️ Cleared existing products');
    
    // Insert sample products
    const insertedProducts = await Product.insertMany(sampleProducts);
    console.log(`✅ Inserted ${insertedProducts.length} products`);
    
    // Display inserted products
    console.log('\n📦 Seeded Products:');
    console.log('─'.repeat(50));
    insertedProducts.forEach(product => {
      console.log(`  • ${product.name} - ₹${(product.price / 100).toFixed(2)}`);
    });
    console.log('─'.repeat(50));
    
    console.log('\n🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeder
seedDatabase();
