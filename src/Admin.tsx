import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Edit, Trash2, X 
} from 'lucide-react';
import { toast } from 'react-toastify';

// Type Definitions
interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  image: string;
}

// Mock API Service (replace with actual backend calls)
const ProductApiService = {
  async getAllProducts(): Promise<Product[]> {
    const API = import.meta.env.VITE_API_URL;
    return await fetch(API+'/product').then(res => res.json()).then(data => {
      return data.products;
    });   
  },

  async createProduct(productData: ProductFormData): Promise<Product | null> {
   const API = import.meta.env.VITE_API_URL;
   const createproducttoastId = toast.loading('Creating product...');
   const response = await fetch(API+'/product/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(productData)
   })
   const data = await response.json();
   toast.dismiss(createproducttoastId);
   if(response.status === 201){
     window.location.reload();
     return data.product;
   }else{
     toast.error('Failed to create product');
   }
   return null;
  },

  async updateProduct(productId: string, productData: ProductFormData): Promise<Product> {
    const API = import.meta.env.VITE_API_URL;
    const updateproducttoastId = toast.loading('Updating product...');
    const response = await fetch(API+'/product/'+productId, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(productData)
    })
    const data = await response.json();
    window.location.reload();
    toast.dismiss(updateproducttoastId);
    return data.product;
  },

  async deleteProduct(productId: string): Promise<Product> {
    const API = import.meta.env.VITE_API_URL;
    const deleteproducttoastId = toast.loading('Deleting product...');
    const response = await fetch(API+'/product/'+productId, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    const data = await response.json();
    toast.dismiss(deleteproducttoastId);
    if (response.status === 200) {
      return data.product;
    } else {
      throw new Error('Failed to delete product');
    }
    return data.product;
  },
  async verifyAdmin(): Promise<boolean> {
    const API = import.meta.env.VITE_API_URL;
    const response = await fetch(`${API}/auth/admin`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.status === 200;
  }
};




const AdminProductPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    image: '',
  });


  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const adminStatus = await ProductApiService.verifyAdmin();
        setIsAdmin(adminStatus);
        if (adminStatus) {
          const fetchedProducts = await ProductApiService.getAllProducts();
          setProducts(fetchedProducts);
        }
      } catch (error) {
        console.error('Admin verification failed', error);
        setIsAdmin(false);
      }
    };

    verifyAdmin();
  }, []);

  // Refs for inputs
  const inputRefs = {
    name: useRef<HTMLInputElement>(null),
    description: useRef<HTMLTextAreaElement>(null),
    price: useRef<HTMLInputElement>(null),
    image: useRef<HTMLInputElement>(null)
  };

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const fetchedProducts = await ProductApiService.getAllProducts();
        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Failed to fetch products', error);
        toast.error('Failed to fetch products');
      }
    };

    fetchProducts();
  }, []);

  // Handle input changes in form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Ensure input remains focused
    setTimeout(() => {
      const ref = inputRefs[name as keyof typeof inputRefs];
      if (ref && ref.current) {
        ref.current.focus();
      }
    }, 0);
  };

  // Open modal for adding new product
  const handleAddProduct = async () => {
    setSelectedProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      image: '',
    });

    setIsModalOpen(true);
  };

  // Open modal for editing existing product
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      image: product.image
    });
    setIsModalOpen(true);
  };

  // Save product (create or update)
  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
      } as ProductFormData;
      if (selectedProduct) {
        // Update existing product
         await ProductApiService.updateProduct(
          selectedProduct._id, 
          productData
        );
        //reload
        window.location.reload();
      } else {
        // Create new product
        await ProductApiService.createProduct(productData);
        
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save product', error);
      toast.error('Failed to save product');
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId: string) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this product?'
    );

    if (confirmDelete) {
      try {
        await ProductApiService.deleteProduct(productId);
        setProducts(prev => prev.filter(p => p._id !== productId));
      } catch (error) {
        console.error('Failed to delete product', error);
        toast.error('Failed to delete product');
      }
    }
  };

  if (isAdmin === null) {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return <div>Unauthorized: You do not have access to this page.</div>;
  }

  // Product Form Modal
  const ProductModal: React.FC = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {selectedProduct ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button 
            onClick={() => setIsModalOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSaveProduct} className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium">Product Name</label>
            <input
              ref={inputRefs.name}
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Enter product name"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Description</label>
            <textarea
              ref={inputRefs.description}
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Enter product description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium">Price</label>
              <input
                ref={inputRefs.price}
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                step="0.01"
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Price"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Image URL</label>
            <input
              ref={inputRefs.image}
              type="text"
              name="image"
              value={formData.image}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Enter image URL"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Product Management</h1>
        <button
          onClick={handleAddProduct}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="mr-2" /> Add Product
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <div 
            key={product._id} 
            className="bg-white border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition"
          >
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h2 className="text-xl font-bold mb-2">{product.name}</h2>
              <p className="text-gray-600 mb-2">{product.description}</p>
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold text-lg">${product.price.toFixed(2)}</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditProduct(product)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && <ProductModal />}
    </div>
  );
};

export default AdminProductPage;