import { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'react-toastify';

interface ProductSchema {
  _id: string,
  name: string,
  description: string,
  image: string,
  price: number
}
interface ProductCardProps {
  product: ProductSchema
}


const ProductCard = ({ product  }: ProductCardProps) => {
    const API = import.meta.env.VITE_API_URL;
    const onAddToCart = () => {
      const addcarttoastId =toast.loading('Adding product to cart...');
      // Add product to cart
      fetch(API+'/cart/'+product._id, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ productId: product._id })
      })
        .then(response => {
          toast.dismiss(addcarttoastId);
          if (response.status === 200) {
            toast.success('Product added to cart');
          } else {
            toast.error('Failed to add product to cart');
          }
        })
        .catch(error => {
          console.error('Error adding product to cart:', error);
          toast.error('Error adding product to cart');
        });
    };
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 relative group">
      <div className="relative">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-64 object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="font-bold text-xl mb-2">{product.name}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
          <button onClick={()=>onAddToCart()} className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors flex items-center">
            <ShoppingCart className="mr-2" size={20} />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

const Home = () => {
    const API = import.meta.env.VITE_API_URL;
 const [products,setProducts] = useState<ProductSchema[]>([]);
 useEffect(()=>{
    // get the products from the API
    fetch(API+'/product').then(res => res.json()).then(data => {
      setProducts(data.products);
    });
 },[])
  return (
    <div className="bg-gray-50 min-h-screen">
    
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-4xl font-bold mb-4 text-gray-900">Discover Your Perfect Pair</h2>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          Explore our latest collection of comfortable and stylish shoes for every occasion.
        </p>
      </div>

      {/* Product Grid */}
      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white py-8 border-t">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600">&copy; 2024 Shoe Haven. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home
