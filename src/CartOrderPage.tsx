import React, { useState, useEffect } from 'react';
import { Trash2, ShoppingCart, Truck, Package, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';

// Type Definitions
interface Product {
  _id: string;
  name: string;
  image: string;
  price: number;
}

interface Cart {
  _id?: string;
  user: string;
  products: Product[];
}

interface Order {
  _id: string;
  user: string;
  products: Product[];
  totalPrice: number;
  status: 'Processing' | 'Shipped' | 'Delivered';
}

const CartOrderPage: React.FC = () => {
    const API = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('token');

    const ApiService = {
        getCart: async (): Promise<Cart | null> => {
            try {
              const response = await fetch(`${API}/cart/`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
              });
              const data = await response.json();
              console.log(data.cart);
              
              return data.cart;
            } catch(error) {
                console.error('Failed to fetch cart:', error);
                toast.error('Failed to fetch cart');
                return null;
            }
        },
        getOrders: async (): Promise<Order[] | null> => {
            try {
              const response = await fetch(API+'/order', {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              });
              const data = await response.json();
              console.log(data.orders);
              
              return data.orders;
            } catch(error) {
                console.error('Failed to fetch orders:', error);
                toast.error('Failed to fetch orders');
                return null;
            }
        },
        removeFromCart: async (productId: string): Promise<Cart | null> => {
            const removecarttoastId = toast.loading('Removing product from cart...');
          try {
            const response = await fetch(`${API}/cart/${productId}`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
            });
            const data = await response.json();
            toast.dismiss(removecarttoastId);
            if (response.status === 200) {
              return data.cart;
            } else {
              toast.error('Failed to remove product from cart');
              return null;
            }
            return data.cart;
          } catch (error) {
            console.error('Failed to remove product from cart:', error);
            toast.error('Failed to remove product from cart');
            return null;
          }
        },
        createOrder: async (cart: Cart): Promise<Order | null> => {
            const API = import.meta.env.VITE_API_URL;
          try {
            const response = await fetch(API+'/order/add', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify(cart)
            });
            const data = await response.json();
            console.log(data.order);
            return data.order;
          } catch (error) {
            console.error('Failed to create order:', error);
            toast.error('Failed to create order');
            return null;
          }
        },
        verify : async (): Promise<boolean> => {
            try {
              const response = await fetch(`${API}/auth/verify`, {
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
              });

              return response.status === 200;
            } catch (error) {
              console.error('Failed to verify user:', error);
              return false;
            }
        }
    };
  
    const [activeTab, setActiveTab] = useState<'cart' | 'orders'>('cart');
    const [cart, setCart] = useState<Cart | null>(null);
    const [orders, setOrders] = useState<Order[] | null>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean|null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const cartData = await ApiService.getCart();
                const ordersData = await ApiService.getOrders();

                setCart(cartData);
                setOrders(ordersData);
                setError(null);
            } catch (err) {
                setError('Failed to load data. Please try again.');
                toast.error('Failed to load data. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };
        const verifyUser = async () => {
            try {
                const isVerified = await ApiService.verify();
                setIsLoggedIn(isVerified);
            } catch (error) {
                console.error('Failed to verify user:', error);
            }
        };
        verifyUser();
        fetchData();
    }, []);

    const removeFromCart = async (productId: string) => {
        if (!cart) return;

        try {
            const updatedCart = await ApiService.removeFromCart(productId);
            if (updatedCart) {
                setCart(updatedCart);
            }
        } catch (error) {
            console.error('Error removing item from cart:', error);
            toast.error('Error removing item from cart');
        }
    };

    const proceedToCheckout = async () => {
        if (!cart || cart.products.length === 0) return;

        try {
            await ApiService.createOrder(cart);
            // reload the page
            window.location.reload();
        } catch (error) {
            console.error('Error creating order:', error);
            toast.error('Error creating order');
        }
    };

    const getTotalAmount = (products: Product[]) => {
        return products.reduce((total, product) => total + product.price, 0);
    };

    const CartComponent: React.FC = () => {
        if (isLoading) {
            return (
                <div className="text-center py-10">
                    <p className="text-gray-600">Loading cart...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center py-10 text-red-600">
                    <p>{error}</p>
                </div>
            );
        }

        if (!cart || cart.products.length === 0) {
            return (
                <div className="text-center py-10">
                    <ShoppingCart className="mx-auto text-gray-400 mb-4" size={64} />
                    <p className="text-gray-600">Your cart is empty</p>
                </div>
            );
        }

        return (
            <div className="bg-white shadow-md rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Your Cart</h2>
                    <span className="text-gray-600">
                        {cart.products.length} item{cart.products.length !== 1 ? 's' : ''}
                    </span>
                </div>

                <div className="space-y-4 mb-6">
                    {cart.products.map(product => (
                        <div 
                            key={product._id} 
                            className="flex items-center justify-between border-b pb-4"
                        >
                            <div className="flex items-center space-x-4">
                                <img 
                                    src={product.image} 
                                    alt={product.name} 
                                    className="w-20 h-20 object-cover rounded-md"
                                />
                                <div>
                                    <h3 className="font-semibold">{product.name}</h3>
                                    <p className="text-gray-600">${product.price.toFixed(2)}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => removeFromCart(product._id)}
                                className="text-red-500 hover:text-red-700"
                            >
                                <Trash2 size={24} />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between items-center border-t pt-6">
                    <span className="text-xl font-bold">Total</span>
                    <span className="text-2xl font-bold">${getTotalAmount(cart.products).toFixed(2)}</span>
                </div>

                <button 
                    onClick={proceedToCheckout}
                    className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
                >
                    Proceed to Checkout
                </button>
            </div>
        );
    };

    const OrdersComponent: React.FC = () => {
        if (isLoading) {
            return (
                <div className="text-center py-10">
                    <p className="text-gray-600">Loading orders...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center py-10 text-red-600">
                    <p>{error}</p>
                </div>
            );
        }

        if (!orders || orders.length === 0) {
            return (
                <div className="text-center py-10">
                    <Package className="mx-auto text-gray-400 mb-4" size={64} />
                    <p className="text-gray-600">No orders yet</p>
                </div>
            );
        }

        return (
            <div className="bg-white shadow-md rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Your Orders</h2>
                    <span className="text-gray-600">
                        {orders.length} order{orders.length !== 1 ? 's' : ''}
                    </span>
                </div>

                <div className="space-y-6">
                    {orders.map(order => (
                        <div 
                            key={order._id} 
                            className="border rounded-lg p-4 hover:shadow-sm transition"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center space-x-2">
                                    {order.status === 'Shipped' ? (
                                        <Truck className="text-green-500" size={24} />
                                    ) : order.status === 'Processing' ? (
                                        <Package className="text-yellow-500" size={24} />
                                    ) : (
                                        <CheckCircle className="text-blue-500" size={24} />
                                    )}
                                    <span className="font-semibold">{order.status}</span>
                                </div>
                                <span className="text-gray-600">Order #{order._id}</span>
                            </div>

                            <div className="space-y-2">
                                {order.products.map(product => (
                                    <div 
                                        key={product._id} 
                                        className="flex items-center space-x-4"
                                    >
                                        <img 
                                            src={product.image} 
                                            alt={product.name} 
                                            className="w-16 h-16 object-cover rounded-md"
                                        />
                                        <div>
                                            <h3 className="font-semibold">{product.name}</h3>
                                            <p className="text-gray-600">${product.price.toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between items-center mt-4 border-t pt-4">
                                <span>Total</span>
                                <span className="font-bold">${order.totalPrice.toFixed(2)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    if(isLoggedIn===null){
        return <div>Loading...</div>;
    }

    if(!isLoggedIn){
        return <div>You are not logged in. Please login to access this page.</div>;
    }

    return (
        <div className="bg-gray-100 min-h-screen p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex mb-6">
                    <button
                        onClick={() => setActiveTab('cart')}
                        className={`w-1/2 py-3 text-center font-semibold ${
                            activeTab === 'cart' 
                                ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-600' 
                                : 'text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                        Cart
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`w-1/2 py-3 text-center font-semibold ${
                            activeTab === 'orders' 
                                ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-600' 
                                : 'text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                        Orders
                    </button>
                </div>

                {activeTab === 'cart' ? <CartComponent /> : <OrdersComponent />}
            </div>
        </div>
    );
};

export default CartOrderPage;