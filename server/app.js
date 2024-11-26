const express = require('express');
const cors = require('cors');

const products = [
  {
    id: 1,
    name: 'Product 1',
    price: 100
  },
  {
    id: 2,
    name: 'Product 2',
    price: 150
  },
  {
    id: 3,
    name: 'Product 3',
    price: 300
  },
];

const app = express();
app.use(cors());
app.use(express.json());

app.get('/products', (req, res) => {
  res.json({ success: true, data: products });
});

app.post('/checkout', (req, res) => {
  const order = req.body;
  console.log("🚀 ~ file: app.js:34 ~ app.post ~ order:", order)
  res.json({ success: true, message: 'Moving to payment' });
})

const PORT = process.env.PORT || 6969;
app.listen(PORT, (err) => {
  if (err) throw err;
  console.log(`Listening on port ${PORT}`)
})