import { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://the-cookie-app.onrender.com') + '/api';

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');

  const fetchInventory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stock`);
      setProducts(response.data);
    } catch (err) {
      setError('Failed to fetch stock items');
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleConsume = async (id) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/consume/${id}`);
      if (response.data.success) {
        setProducts(products.map(p => p.id === id ? { ...p, count: Math.max(0, p.count - 1) } : p));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Item update failed');
    }
  };

  const handleRestock = async (id) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/restock/${id}`);
      if (response.data.success) {
        setProducts(products.map(p => p.id === id ? { ...p, count: 10 } : p));
      }
    } catch (err) {
      alert('Failed to restock item');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-[80vh] text-white">
      <h1 className="text-3xl font-bold mb-6 text-[#3b5d8f]">Cookie App Inventory</h1>
      {error && <p className="text-red-500 font-bold mb-4">{error}</p>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <div key={product.id} className="bg-[#121214] border border-white/5 p-6 rounded-2xl shadow-xl">
            <h3 className="text-xl font-semibold capitalize mb-2">{product.name}</h3>
            <p className="text-slate-400 text-sm mb-4">Stock Level: 
              <span className={`ml-2 font-bold ${product.count === 0 ? 'text-red-500' : 'text-green-400'}`}>
                {product.count} / 10
              </span>
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => handleConsume(product.id)}
                disabled={product.count === 0}
                className="flex-1 bg-[#3b5d8f] text-white py-2 rounded-xl text-sm font-bold disabled:opacity-40"
              >
                Consume
              </button>
              <button 
                onClick={() => handleRestock(product.id)}
                className="bg-[#1a1a1c] border border-white/10 text-slate-300 px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#252528]"
              >
                Restock
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}