import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";

const CardCheckout = (props) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log('submit action');
    console.log('stripe', stripe);
    console.log('elements', elements);

    if (!stripe || !elements) {
      return;
    }

    const { paymentMethod, error } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement),
    });
    if (error) return console.log('Error:', error);
    if (paymentMethod) {
      props.onSubmit(paymentMethod);
    }

    console.log('Paying....');
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
      <CardElement />
      <button
        style={{ alignSelf: 'left', padding: 10 }}
        type="submit"
        disabled={!stripe}
      >
        Pay
      </button>
    </div>
  </form>;
}

export default CardCheckout;