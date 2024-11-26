import { useMemo, useState } from "react";

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  const productMap = useMemo(() => {
    const obj = {};

    if (products.length === 0) return obj;

    products?.forEach(i => {
      obj[i.id] = i;
    });

    return obj;
  }, [products]);

  const loadProducts = async (event) => {
    event.preventDefault();
    const res = await fetch(`${BASE_URL}/products`, {
      method: 'GET'
    });
    const data = await res.json();
    if (!res.ok) {
      console.log('Error:', data);
      return;
    }
    setProducts(data.data);
  }

  const addQty = (id) => {
    const index = cart.findIndex(i => i.id === id);
    if (index >= 0) {
      const newCart = [...cart];
      newCart[index] = { ...newCart[index], qty: newCart[index].qty + 1 };
      setCart(newCart);
    } else {
      const item = { id, qty: 1 };
      const newCart = [...cart, item];
      setCart(newCart);
    }
  }

  const subtractQty = (id) => {
    const index = cart.findIndex(i => i.id === id);
    if (index === -1) return;

    const newCart = [...cart];
    if (newCart[index].qty === 1) {
      newCart.splice(index, 1);
      setCart(newCart);
    } else {
      newCart[index] = { ...newCart[index], qty: newCart[index].qty - 1 };
      setCart(newCart);
    }
  }

  const checkout = async (event) => {
    event.preventDefault();
    const res = await fetch(`${BASE_URL}/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cart)
    });

    const data = await res.json();

    if (!res.ok) {
      console.log('Error:', data);
      return;
    }

    console.log("🚀 ~ file: App.js:60 ~ checkout ~ data:", data);
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <button
        style={{ alignSelf: 'center', padding: 10, margin: 10 }}
        onClick={loadProducts}>
        Load Products
      </button>

      <div style={{ padding: 10, margin: 10 }}>
        {products?.length ? <h2>Products:</h2> : null}
        {
          products.map(
            p => (
              <div
                key={p.id}
                style={{
                  padding: 10,
                  border: '1px solid black',
                  margin: 10,
                  display: 'flex',
                  justifyContent: 'space-between'
                }}
              >
                <span>{p.name}</span>
                <span>$ {p.price || 0}</span>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => addQty(p.id)}>+</button>
                  <button onClick={() => subtractQty(p.id)}>-</button>
                </div>
              </div>
            )
          )
        }
      </div>
      {
        cart.length ? <div>
          <h2>Cart</h2>
          {
            cart.map(
              i => (
                <div
                  key={i.id}
                  style={{
                    padding: 10,
                    border: '1px solid black',
                    margin: 10,
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>{productMap[i.id]?.name}</span>
                  <span>{productMap[i.id]?.price}</span>
                  <span>{i?.qty}</span>
                </div>
              )
            )
          }
        </div> : null
      }
      {
        cart.length ? <div style={{ padding: 10, margin: 10, display: 'flex', justifyContent: 'center' }}>
          <button
            style={{ padding: 10, margin: 10 }}
            onClick={checkout}
          >
            Checkout
          </button>
        </div> : null
      }
    </div>
  );
}

export default App;
