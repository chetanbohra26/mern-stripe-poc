const express = require('express');
const cors = require('cors');

require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const products = [
  {
    id: "PRODUCT_1",
    name: 'Product 1',
    price: 100
  },
  {
    id: "PRODUCT_2",
    name: 'Product 2',
    price: 150
  },
  {
    id: "PRODUCT_3",
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

app.post('/checkout', async (req, res) => {
  const order = req.body;
  const line_items = order.map(o => {
    const product = products.find(p => p.id === o.id);
    return ({
      quantity: o.qty,
      price_data: {
        currency: 'usd',
        product_data: {
          name: product.name
        },
        unit_amount: product.price * 100
      },
    })
  });
  const session = await stripe.checkout.sessions.create({
    line_items,
    mode: 'payment',
    success_url: `${process.env.REACT_APP_URL}/success?sessionId={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.REACT_APP_URL}/cancel?sessionId={CHECKOUT_SESSION_ID}`,
  });
  res.json({ success: true, message: 'Moving to payment', url: session?.url });
})

const PORT = process.env.PORT || 6969;
app.listen(PORT, (err) => {
  if (err) throw err;
  console.log(`Listening on port ${PORT}`)
})