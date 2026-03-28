import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LayoutDashboard, PlusCircle, Trash2 } from 'lucide-react';
import './AdminPanel.css';

const AdminPanel = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const API_BASE_URL = window.location.hostname.includes('localhost')
    ? 'http://localhost:5001/api/admin'
    : 'https://yuugen-backend.onrender.com/api/admin';

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/products`);
      if (!res.ok) throw new Error("Error al obtener datos");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando productos:", err);
    }
  }, [API_BASE_URL]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!selectedFile) return alert("Selecciona una imagen");
    setIsLoading(true);
    const formData = new FormData();
    formData.append('name', newProduct.name);
    formData.append('description', newProduct.description);
    formData.append('price', newProduct.price);
    formData.append('image', selectedFile);

    try {
      const response = await fetch(`${API_BASE_URL}/products`, { method: 'POST', body: formData });
      if (response.ok) {
        setNewProduct({ name: '', description: '', price: '' });
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = ""; 
        fetchData();
        alert("✅ Producto guardado");
      }
    } catch (error) {
      alert("❌ Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("¿Eliminar este producto?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (error) { console.error(error); }
  };

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="admin-logo">yuugen</div>
        <nav>
          <button className="active">
            <LayoutDashboard size={20} /> Inventario
          </button>
        </nav>
      </aside>

      <main className="content">
        <header className="content-header">
          <h2>Yuugen Admin</h2>
        </header>

        {/* Formulario de Registro */}
        <div className="admin-card">
          <form onSubmit={handleAddProduct} className="admin-form">
            <div className="input-group">
              <label>Nombre del Diseño</label>
              <input 
                type="text" 
                placeholder="Ej: Kanji Hoodie"
                value={newProduct.name} 
                onChange={e => setNewProduct({...newProduct, name: e.target.value})} 
                required 
              />
            </div>
            <div className="input-group">
              <label>Precio (COP)</label>
              <input 
                type="number" 
                placeholder="00.000"
                value={newProduct.price} 
                onChange={e => setNewProduct({...newProduct, price: e.target.value})} 
                required 
              />
            </div>
            <div className="input-group full-width">
              <label>Imagen del Producto</label>
              <div className="file-input-wrapper">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={e => setSelectedFile(e.target.files[0])} 
                  required 
                />
              </div>
            </div>
            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? 'Registrando...' : <><PlusCircle size={20} /> REGISTRAR PRODUCTO</>}
            </button>
          </form>
        </div>

        {/* Tabla de Inventario */}
        <div className="admin-card table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Vista</th>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td><img src={p.image_url} alt="" className="thumb" /></td>
                  <td><strong>{p.name}</strong></td>
                  <td>${Number(p.price).toLocaleString()}</td>
                  <td>
                    <button onClick={() => deleteProduct(p.id)} className="del-btn">
                      <Trash2 size={18}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;