import React, { useState, useEffect, useCallback, useRef } from 'react';
// 🛠️ Solo importamos los iconos que REALMENTE usamos
import { LayoutDashboard, PlusCircle, Trash2 } from 'lucide-react';
import './AdminPanel.css';

const AdminPanel = () => {
  const [view, setView] = useState('inventory');
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  // ✅ URL DINÁMICA
  const API_BASE_URL = window.location.hostname.includes('localhost')
    ? 'http://localhost:5001/api/admin'
    : 'https://yuugen-backend.onrender.com/api/admin';

  // ✅ Función envuelta en useCallback para evitar el error de dependencias
  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/products`);
      if (!res.ok) throw new Error("Error al obtener datos");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando productos de Yuugen:", err);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Ahora fetchData es una dependencia válida

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!selectedFile) return alert("Por favor, selecciona una imagen del diseño.");

    setIsLoading(true);
    const formData = new FormData();
    formData.append('name', newProduct.name);
    formData.append('description', newProduct.description);
    formData.append('price', newProduct.price);
    formData.append('image', selectedFile);

    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        setNewProduct({ name: '', description: '', price: '' });
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = ""; 
        fetchData();
        alert("✅ ¡Producto guardado con éxito!");
      } else {
        const errData = await response.json();
        alert(`❌ Error: ${errData.error || 'No se pudo guardar'}`);
      }
    } catch (error) {
      alert("❌ Error de conexión con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este producto?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Error al borrar:", error);
    }
  };

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="admin-logo">
          <span>YUUGEN</span>
          <small>STUDIO ADMIN</small>
        </div>
        <nav>
          <button 
            className={view === 'inventory' ? 'active' : ''} 
            onClick={() => setView('inventory')}
          >
            <LayoutDashboard size={20} /> Inventario
          </button>
        </nav>
      </aside>

      <main className="content">
        <header className="content-header">
          <h1>Gestión de Productos</h1>
        </header>

        <div className="admin-card">
          <form onSubmit={handleAddProduct} className="admin-form">
            <div className="inputs-grid">
              <div className="input-group">
                <label>Nombre del Diseño</label>
                <input 
                  type="text" 
                  value={newProduct.name} 
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})} 
                  required 
                />
              </div>
              <div className="input-group">
                <label>Precio (COP)</label>
                <input 
                  type="number" 
                  value={newProduct.price} 
                  onChange={e => setNewProduct({...newProduct, price: e.target.value})} 
                  required 
                />
              </div>
              <div className="input-group">
                <label>Imagen</label>
                <input 
                  type="file" 
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={e => setSelectedFile(e.target.files[0])} 
                  required 
                />
              </div>
              <div className="input-group full-width">
                <label>Descripción</label>
                <textarea 
                  value={newProduct.description} 
                  onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                ></textarea>
              </div>
              <button type="submit" className="submit-btn" disabled={isLoading}>
                {isLoading ? 'Registrando...' : <><PlusCircle size={18} /> Registrar</>}
              </button>
            </div>
          </form>
        </div>

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