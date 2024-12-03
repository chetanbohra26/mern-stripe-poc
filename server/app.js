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


// Payment flow: send Stripe checkout page URL to FE
app.post('/get-checkout-url', async (req, res) => {
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
  res.json({ success: true, message: 'Session initiated', url: session?.url });
});

// check session status
app.get('/session-status', async (req, res) => {
  const session = await stripe.checkout.sessions.retrieve(req.query.session_id);

  res.send({
    status: session.status,
    customer_email: session.customer_details.email
  });
});

// Payment Flow: Stripe Payment Intent 
app.post('/create-payment-intent', async (req, res) => {
  const { paymentMethodType, paymentMethod } = req.body;
  if (!paymentMethodType || paymentMethodType.length === 0)
    return res.status(400).json({ success: false, message: 'Invalid paymentMethodType' })

  const paymentIntent = await stripe.paymentIntents.create({
    amount: 1500,
    currency: 'usd',
    payment_method_types: [paymentMethodType],
    confirm: true,
    payment_method: paymentMethod,
  });

  res.json({ success: true, message: 'Intent created', clientSecret: paymentIntent.client_secret })
});

// webhook
app.post('/webhook', express.json({ type: 'application/json' }), (req, res) => {
  const event = req.body;
  switch (event.type) {
    case 'payment_intent.created':
      const paymentIntentCreated = event.data.object;
      console.log("🚀 ~ file: app.js:100 ~ app.post ~ paymentIntentCreated:", paymentIntentCreated)
      // Then define and call a method to handle the successful payment intent.
      break;
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log("🚀 ~ file: app.js:102 ~ app.post ~ paymentIntent:", paymentIntent)
      // Then define and call a method to handle the successful payment intent.
      break;
    case 'payment_method.attached':
      const paymentMethod = event.data.object;
      console.log("🚀 ~ file: app.js:103 ~ app.post ~ paymentMethod:", paymentMethod)
      // Then define and call a method to handle the successful attachment of a PaymentMethod.
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  res.json({ received: true });
})

const PORT = process.env.BE_PORT || 6969;
app.listen(PORT, (err) => {
  if (err) throw err;
  console.log(`Listening on port ${PORT}`)
})