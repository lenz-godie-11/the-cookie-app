import { useEffect, useState } from 'react';
import axios from 'axios';
import { Copy, CheckCheck, Plus, X } from 'lucide-react';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://the-cookie-app.onrender.com') + '/api';

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', count: 10 });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const familyId = localStorage.getItem('family_id');
  const username = localStorage.getItem('username');
  const isAdmin = localStorage.getItem('is_admin') === 'true';
  const inviteLink = `${window.location.origin}/family/join/${familyId}`;

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/${familyId}`);
      setProducts(response.data);
    } catch (err) {
      setError('Failed to fetch products');
    }
  };

  useEffect(() => {
    if (familyId) fetchProducts();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('count', form.count);
      formData.append('family_id', familyId);
      if (image) formData.append('image', image);

      await axios.post(`${API_BASE_URL}/products/add`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setShowModal(false);
      setForm({ name: '', description: '', count: 10 });
      setImage(null);
      setPreview(null);
      fetchProducts();
    } catch (err) {
      setError('Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  const handleConsume = async (id) => {
    try {
      await axios.post(`${API_BASE_URL}/products/consume/${id}`);
      setProducts(products.map(p => p.id === id ? { ...p, count: Math.max(0, p.count - 1) } : p));
    } catch (err) {
      alert(err.response?.data?.message || 'Item update failed');
    }
  };

  const handleRestock = async (id) => {
    try {
      await axios.post(`${API_BASE_URL}/products/restock/${id}`);
      setProducts(products.map(p => p.id === id ? { ...p, count: 10 } : p));
    } catch (err) {
      alert('Failed to restock item');
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-[80vh] text-white">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-[#3b5d8f]">Cookie App Inventory</h1>
        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#3b5d8f] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#2e4a72]"
          >
            <Plus size={16} /> Add Product
          </button>
        )}
      </div>

      <div className="bg-[#121214] border border-white/5 rounded-2xl p-4 mb-8 flex items-center justify-between gap-4">
        <div className="overflow-hidden">
          <p className="text-slate-400 text-xs mb-1">Your Family Invite Link</p>
          <p className="text-slate-300 text-sm truncate max-w-xs">{inviteLink}</p>
        </div>
        <button onClick={handleCopy} className="flex items-center gap-2 bg-[#3b5d8f] text-white px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap">
          {copied ? <><CheckCheck size={16} /> Copied!</> : <><Copy size={16} /> Copy Link</>}
        </button>
      </div>

      {error && <p className="text-red-500 font-bold mb-4">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <div key={product.id} className="bg-[#121214] border border-white/5 rounded-2xl shadow-xl overflow-hidden">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="w-full h-48 object-cover" />
            ) : (
              <div className="w-full h-48 bg-[#1a1a1c] flex items-center justify-center text-slate-600 text-sm">
                No Image
              </div>
            )}
            <div className="p-5">
              <h3 className="text-xl font-semibold capitalize mb-1">{product.name}</h3>
              {product.description && (
                <p className="text-slate-500 text-xs mb-3">{product.description}</p>
              )}
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
                {isAdmin && (
                  <button
                    onClick={() => handleRestock(product.id)}
                    className="bg-[#1a1a1c] border border-white/10 text-slate-300 px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#252528]"
                  >
                    Restock
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#121214] border border-white/5 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Add New Product</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <input
                type="text"
                placeholder="Product name"
                required
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})}
                className="w-full bg-[#1a1a1c] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-1 focus:ring-[#3b5d8f]"
              />
              <textarea
                placeholder="Description (optional)"
                value={form.description}
                onChange={(e) => setForm({...form, description: e.target.value})}
                className="w-full bg-[#1a1a1c] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-1 focus:ring-[#3b5d8f] resize-none h-24"
              />
              <input
                type="number"
                placeholder="Initial stock"
                value={form.count}
                onChange={(e) => setForm({...form, count: e.target.value})}
                className="w-full bg-[#1a1a1c] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-1 focus:ring-[#3b5d8f]"
              />
              <div className="border border-white/10 rounded-xl p-4 bg-[#1a1a1c]">
                {preview && (
                  <img src={preview} alt="preview" className="w-full h-40 object-cover rounded-xl mb-3" />
                )}
                <label className="cursor-pointer flex items-center gap-2 text-slate-400 text-sm hover:text-white">
                  <Plus size={16} />
                  {preview ? 'Change Image' : 'Upload Image'}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#3b5d8f] text-white py-3 rounded-xl font-bold disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}