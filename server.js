// Import modules
const express  = require('express'); 
const mongoose = require('mongoose');
const path     = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Connect to MongoDB ─
mongoose.connect('Add ur mongodb link ')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// ── Menu Schema ─
const menuSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String
});
const MenuItem = mongoose.model('MenuItem', menuSchema);

//Order Schema -Defines structure of orders
const orderSchema = new mongoose.Schema({
  orderNumber: Number, // identifier hai
  pickupCode: Number,
  items: [            // array jo order main
    {
      name: String,
      price: Number,
      quantity: Number
    }
  ],
  totalAmount: Number,
  date: {
    type: Date,
    default: Date.now
  }
});
const Order = mongoose.model('Order', orderSchema);// model jo order collection mongodb me hai

// ── Seed menu data ────
async function seedMenu() { //a function that runs once when server starts
  const count = await MenuItem.countDocuments();
  if (count === 0) {//database is empty
    await MenuItem.insertMany([
      { name: 'Matcha Latte', price: 120, category: 'Beverages' },
      { name: 'Brown Sugar Milk', price: 100, category: 'Beverages' },
      { name: 'Iced Hojicha', price: 110, category: 'Beverages' },
      { name: 'Rice Cake', price: 80, category: 'Snacks' },
      { name: 'Mochi Waffle', price: 90, category: 'Snacks' },
      { name: 'Cheese Toast', price: 70, category: 'Snacks' },
      { name: 'Mochi Ice Cream', price: 130, category: 'Desserts' },
      { name: 'Matcha Roll Cake', price: 150, category: 'Desserts' },
      { name: 'Pudding Cup', price: 95, category: 'Desserts' },
      { name: 'Mofu Cloud Set', price: 250, category: 'Mofu-special' },
      { name: 'Mofu Bento Box', price: 280, category: 'Mofu-special' },
      { name: 'Mofu Dream Drink', price: 200, category: 'Mofu-special' }
    ]);
    console.log('Menu seeded!');
  }
}
seedMenu();

// ── GET menu ──
app.get('/api/menu', async (req, res) => {
  const items = await MenuItem.find(); //Get ALL menu items from database
  res.json(items); // send kr rhe frontend pe
});

// ── POST order ──
app.post('/api/order', async (req, res) => {

  console.log(" API HIT");
  console.log(" Incoming Items:", req.body.items);

  const items = req.body.items;//connection btw frontend and backend

  let total = 0;
  items.forEach(item => {
    total += item.price * item.quantity;
  });

  const lastOrder = await Order.findOne().sort({ orderNumber: -1 });

  let orderNumber = 1;
  if (lastOrder) {
    orderNumber = lastOrder.orderNumber + 1;
  }

  const pickupCode = Math.floor(1000 + Math.random() * 9000);

  const newOrder = new Order({
    orderNumber,
    pickupCode,
    items,
    totalAmount: total
  });

  await newOrder.save();// store in db, order

  console.log(" Saved Order:", newOrder);


  const allOrders = await Order.find();
  console.log(" All Orders in DB:", allOrders);

  res.json({
    orderNumber: orderNumber,
    pickupCode: pickupCode,
    items: items,
    total: total
  });
});

// ── Home route ──────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Start server
app.listen(3000, () => {
  console.log('Mofu Cafe running at http://localhost:3000');
});