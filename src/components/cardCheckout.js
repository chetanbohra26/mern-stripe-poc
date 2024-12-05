import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

const CardCheckout = (props) => {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState();

  useEffect(() => {
    let response;
    fetch(`${BASE_URL}/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then(res => {
        response = res;
        return res.json()
      })
      .then(data => {
        if (!response.ok) return;
        const secret = data?.clientSecret;

        if (secret) setClientSecret(secret)
      });
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log('stripe', stripe);
    console.log('elements', elements);

    elements.submit();
    const result = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: 'http://localhost:3001/redirect'
      },
      redirect: 'always'
    });

    if (result.error) return console.log('Error:', result.error);
    console.log('Result:', result);
  }

  return <form onSubmit={handleSubmit}>
    <div
      style={{
        display: "flex",
        flexDirection: 'column',
        marginTop: 10,
        marginBottom: 10
      }}
    >
      {clientSecret && <PaymentElement />}
      <button
        style={{ alignSelf: 'left', padding: 10, marginTop: 10 }}
        type="submit"
        disabled={!stripe}
      >
        Pay
      </button>
    </div>
  </form>;
}

export default CardCheckout;