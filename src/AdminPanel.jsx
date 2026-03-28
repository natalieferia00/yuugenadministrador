import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LayoutDashboard, PlusCircle, Trash2 } from 'lucide-react';
import './AdminPanel.css';

const AdminPanel = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  // CORRECCIÓN: Se inicializa con description para que no sea undefined
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  // URL ajustada para conectar con el puerto 5001 (backend local)
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
    if (!selectedFile) return alert("Por favor, selecciona una imagen");
    
    setIsLoading(true);
    const formData = new FormData();
    formData.append('name', newProduct.name);
    // Aseguramos que se envíe la descripción (o un texto vacío si no hay)
    formData.append('description', newProduct.description || ""); 
    formData.append('price', newProduct.price);
    formData.append('image', selectedFile);

    try {
      const response = await fetch(`${API_BASE_URL}/products`, { 
        method: 'POST', 
        body: formData 
        // No agregamos Content-Type manualmente, el navegador lo hace por nosotros con FormData
      });

      if (response.ok) {
        // Limpiamos todo el estado
        setNewProduct({ name: '', description: '', price: '' });
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = ""; 
        
        fetchData(); // Recargamos la tabla
        alert("✅ Producto guardado con éxito");
      } else {
        const errorData = await response.json();
        alert(`❌ Error: ${errorData.error || "No se pudo guardar"}`);
      }
    } catch (error) {
      console.error("Error en la petición:", error);
      alert("❌ Error de conexión con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este diseño?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      } else {
        alert("No se pudo eliminar el producto");
      }
    } catch (error) { 
      console.error(error);
      alert("Error al conectar con el servidor");
    }
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
            
            {/* Campo de descripción agregado para que sea funcional */}
            <div className="input-group full-width">
              <label>Descripción</label>
              <input 
                type="text"
                placeholder="Breve descripción de la prenda..."
                value={newProduct.description}
                onChange={e => setNewProduct({...newProduct, description: e.target.value})}
              />
            </div>

            <div className="input-group full-width">
              <label>Imagen del Producto</label>
              <div className="file-input-wrapper">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/*"
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
              {products.length > 0 ? (
                products.map(p => (
                  <tr key={p.id}>
                    <td><img src={p.image_url} alt={p.name} className="thumb" /></td>
                    <td><strong>{p.name}</strong></td>
                    <td>${Number(p.price).toLocaleString()}</td>
                    <td>
                      <button onClick={() => deleteProduct(p.id)} className="del-btn">
                        <Trash2 size={18}/>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                    No hay productos en el inventario.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;