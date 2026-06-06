const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Service = require('./models/Service');

dotenv.config();

const services = [
  { name: 'Classic Haircut', description: 'Traditional men\'s haircut', price: 20, duration: '30 min', category: 'haircut', icon: '✂️' },
  { name: 'Beard Trim', description: 'Professional beard shaping', price: 15, duration: '20 min', category: 'beard', icon: '🧔' },
  { name: 'Hot Towel Shave', description: 'Straight razor shave', price: 25, duration: '40 min', category: 'shave', icon: '🪒' },
  { name: 'Hair Coloring', description: 'Professional coloring', price: 50, duration: '90 min', category: 'coloring', icon: '🎨' },
  { name: 'Facial Treatment', description: 'Cleansing facial', price: 35, duration: '45 min', category: 'facial', icon: '💆' },
];

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    await Service.deleteMany();
    await Service.insertMany(services);
    console.log('✅ Services seeded successfully');
    mongoose.connection.close();
  })
  .catch(err => console.error('❌ Error seeding services:', err));
