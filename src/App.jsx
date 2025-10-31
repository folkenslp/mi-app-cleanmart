import React, { useState } from 'react';
// Importamos Sparkles (chispas) para los nuevos botones de IA
import { ShoppingCart, Plus, Minus, Trash2, Search, Package, Send, Clock, CreditCard, CheckCircle, Sparkles } from 'lucide-react';

// --- Hook de LocalStorage ---
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };
  return [storedValue, setValue];
};

// --- FUNCIONES DE AYUDA PARA GEMINI API ---

// Función de reintento con backoff exponencial para la API
const fetchWithRetry = async (url, options, retries = 3, delay = 1000) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    } else {
      console.error("API call failed after retries:", error);
      throw error;
    }
  }
};

// Función genérica para llamar a Gemini
const callGeminiAPI = async (prompt) => {
  const apiKey = ""; // Dejar vacío, se inyectará en el entorno
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
    ],
  };

  try {
    const result = await fetchWithRetry(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const candidate = result.candidates?.[0];
    if (candidate && candidate.content?.parts?.[0]?.text) {
      return candidate.content.parts[0].text;
    } else {
      throw new Error("Respuesta de la API inválida o vacía.");
    }
  } catch (error) {
    console.error("Error al llamar a Gemini API:", error);
    return "Error: No se pudo generar la respuesta. Intenta de nuevo.";
  }
};


// --- Datos Iniciales (Actualizados) ---
const initialProducts = [
  { id: 1, name: 'Cloro', price: 9.00, category: 'Desinfección', image: '🧪', stock: 50, unit: 'L' },
  { id: 2, name: 'Limpiador Multiusos Tipo Fabuloso', price: 13.00, category: 'Limpieza General', image: '🧽', stock: 50, unit: 'L' },
  { id: 3, name: 'Detergente Líquido para Trastes Plus', price: 33.00, category: 'Cocina', image: '🍽️', stock: 50, unit: 'L' },
  { id: 4, name: 'Limpiador Multiusos Pino', price: 20.00, category: 'Limpieza General', image: '🌲', stock: 50, unit: 'L' },
  { id: 5, name: 'Limpiador para Ropa Pino', price: 20.00, category: 'Lavandería', image: '🧺', stock: 50, unit: 'L' },
  { id: 6, name: 'Detergente Líquido para Ropa Tipo Zote', price: 33.00, category: 'Lavandería', image: '🧴', stock: 50, unit: 'L' },
  { id: 7, name: 'Detergente Líquido para Ropa Tipo Vel Rosita', price: 33.00, category: 'Lavandería', image: '🌸', stock: 50, unit: 'L' },
  { id: 8, name: 'Detergente Líquido para Ropa Tipo Ariel Downy', price: 33.00, category: 'Lavandería', image: '💧', stock: 50, unit: 'L' },
  { id: 9, name: 'Detergente Líquido para Ropa Tipo Downy', price: 35.00, category: 'Lavandería', image: '🧼', stock: 50, unit: 'L' },
  { id: 10, name: 'Detergente Líquido para Ropa Tipo Persil', price: 33.00, category: 'Lavandería', image: '🧺', stock: 50, unit: 'L' },
  { id: 11, name: 'Detergente Líquido para Ropa Tipo Más Color', price: 33.00, category: 'Lavandería', image: '🎨', stock: 50, unit: 'L' },
  { id: 12, name: 'Detergente Líquido para Ropa Tipo Ace', price: 33.00, category: 'Lavandería', image: '🧺', stock: 50, unit: 'L' },
  { id: 13, name: 'Quitamanchas Tipo Vanish Líquido', price: 48.00, category: 'Lavandería', image: '✨', stock: 50, unit: 'L' },
  { id: 14, name: 'Quitamanchas Tipo Oxy-Clean', price: 52.00, category: 'Lavandería', image: '💫', stock: 50, unit: 'Kg' },
  { id: 15, name: 'Detergente Clorado (Cloro en Gel)', price: 25.00, category: 'Desinfección', image: '🫧', stock: 50, unit: 'L' },
  { id: 16, name: 'Jabón Líquido para Manos', price: 25.00, category: 'Higiene Personal', image: '🧴', stock: 50, unit: 'L' },
  { id: 17, name: 'Pastillas de Cloro', price: 150.00, category: 'Desinfección', image: '⚪', stock: 50, unit: 'Kg' },
  { id: 18, name: 'Desengrasante', price: 30.00, category: 'Limpieza General', image: '🔧', stock: 50, unit: 'L' },
  { id: 19, name: 'Quitacochambre Líquido', price: 45.00, category: 'Cocina', image: '🧹', stock: 50, unit: 'L' },
  { id: 20, name: 'Suavizante de Telas', price: 20.00, category: 'Lavandería', image: '👕', stock: 50, unit: 'L' },
  { id: 21, name: 'Suavizante de Telas (Momentos Mágicos)', price: 22.00, category: 'Lavandería', image: '✨', stock: 50, unit: 'L' },
  { id: 22, name: 'Insecticida', price: 50.00, category: 'Control de Plagas', image: '🦟', stock: 50, unit: 'L' },
  { id: 23, name: 'Shampoo Capilar a Base de Romero', price: 65.00, category: 'Higiene Personal', image: '🌿', stock: 50, unit: 'L' },
  { id: 24, name: 'Limpiavidrios', price: 30.00, category: 'Limpieza General', image: '🪟', stock: 50, unit: 'L' },
  { id: 25, name: 'Sarricida', price: 45.00, category: 'Limpieza General', image: '🚽', stock: 50, unit: 'L' },
  { id: 26, name: 'Body Shower', price: 43.00, category: 'Higiene Personal', image: '🚿', stock: 50, unit: 'L' },
  { id: 27, name: 'Aromatizante', price: 55.00, category: 'Aromas', image: '🌺', stock: 50, unit: 'L' }
];

// --- Componente Principal ---
export default function App() {
  // --- Estados de la App ---
  
  // Catálogo y Carrito
  const [products, setProducts] = useLocalStorage('cleanMartProducts', initialProducts);
  const [cart, setCart] = useLocalStorage('cleanMartCart', []);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  // Campos del Cliente
  const [customerName, setCustomerName] = useLocalStorage('cleanMartCustomerName', '');
  const [customerPhone, setCustomerPhone] = useLocalStorage('cleanMartCustomerPhone', '');
  
  // Campo del Negocio
  const [businessPhone, setBusinessPhone] = useLocalStorage('cleanMartBusinessPhone', '');
  
  // Estados para el Historial de Ventas
  const [ventasACredito, setVentasACredito] = useLocalStorage('cleanMartVentasCredito', []);
  const [ventasPagadas, setVentasPagadas] = useLocalStorage('cleanMartVentasPagadas', []);
  const [isCreditSale, setIsCreditSale] = useState(false);
  
  // Estados de Modales
  const [showSalesModal, setShowSalesModal] = useState(false);
  
  // Estados para MODAL DE PRODUCTO
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedFragrance, setSelectedFragrance] = useState('');
  const [customFragrance, setCustomFragrance] = useState('');
  const [selectedSize, setSelectedSize] = useState('');

  // Estados para FUNCIONES GEMINI
  const [includeTips, setIncludeTips] = useState(false);
  const [isGeneratingTips, setIsGeneratingTips] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderMessage, setReminderMessage] = useState('');
  const [isLoadingReminder, setIsLoadingReminder] = useState(false);
  const [currentSaleForReminder, setCurrentSaleForReminder] = useState(null);

  // --- Listas de Datos ---
  const categories = ['Todos', 'Lavandería', 'Desinfección', 'Limpieza General', 'Cocina', 'Higiene Personal', 'Control de Plagas', 'Aromas'];
  const fragrances = ['Lavanda', 'Limón', 'Flores', 'Manzana', 'Océano', 'Pino', 'Vainilla', 'Sin Fragancia'];
  const sizes = ['250ml', '500ml', '1L', '2L', '5L', '10L', '20L', 'Galón']; // Galón añadido


  // --- Funciones del Carrito ---
  
  // Abre el modal de producto
  const openProductModal = (product) => {
    setSelectedProduct(product);
    setSelectedFragrance('');
    setCustomFragrance('');
    setSelectedSize('');
    setShowProductModal(true);
  };

  // Confirma desde el modal
  const confirmAddToCart = () => {
    const finalFragrance = selectedFragrance === 'Personalizada' ? customFragrance : selectedFragrance;
    
    if (!selectedFragrance || !selectedSize) {
      alert('Por favor selecciona fragancia y tamaño');
      return;
    }
    if (selectedFragrance === 'Personalizada' && !customFragrance.trim()) {
      alert('Por favor escribe la fragancia personalizada');
      return;
    }

    // Lógica de cálculo de precio
    let sizeInLiters = 1;
    if (selectedSize.includes('ml')) {
      sizeInLiters = parseFloat(selectedSize.replace('ml', '')) / 1000;
    } else if (selectedSize.includes('L')) {
      sizeInLiters = parseFloat(selectedSize.replace('L', ''));
    } else if (selectedSize === 'Galón') {
      sizeInLiters = 3.785; // Conversión de Galón a Litros
    }
    
    const calculatedPrice = selectedProduct.price * sizeInLiters;

    // Crear ID único para el item
    const productWithDetails = {
      ...selectedProduct,
      fragrance: finalFragrance,
      size: selectedSize,
      unitPrice: selectedProduct.price,
      price: calculatedPrice,
      uniqueId: `${selectedProduct.id}-${finalFragrance}-${selectedSize}`
    };

    const existing = cart.find(item => item.uniqueId === productWithDetails.uniqueId);
    if (existing) {
      setCart(cart.map(item =>
        item.uniqueId === productWithDetails.uniqueId ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...productWithDetails, quantity: 1 }]);
    }

    setShowProductModal(false);
    setSelectedProduct(null);
  };

  // Actualiza cantidad en carrito
  const updateQuantity = (uniqueId, delta) => {
    setCart(currentCart =>
      currentCart.map(item =>
        item.uniqueId === uniqueId ? { ...item, quantity: item.quantity + delta } : item
      ).filter(item => item.quantity > 0)
    );
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // --- Funciones de Gemini ---

  const generateUsageTips = async () => {
    setIsGeneratingTips(true);
    const productNames = cart.map(item => item.name).join(', ');
    const prompt = `Eres 'CleanBot', un asistente amigable de CleanMart. Para esta lista de productos de limpieza: ${productNames}, genera uno o dos consejos de uso muy breves y útiles (máximo 15 palabras por consejo). Junta todos los consejos en un solo párrafo corto.`;
    
    try {
      const tips = await callGeminiAPI(prompt);
      setIsGeneratingTips(false);
      return `\n\n✨ *Consejos de CleanBot:*\n${tips}`;
    } catch (error) {
      setIsGeneratingTips(false);
      return "\n\n(No se pudieron generar los consejos de uso en este momento.)";
    }
  };

  const handleGenerateReminder = async (sale) => {
    setIsLoadingReminder(true);
    setCurrentSaleForReminder(sale);
    setReminderMessage('');
    setShowReminderModal(true);

    const saleDate = new Date(sale.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'long' });
    const prompt = `Eres el dueño de 'CleanMart', un negocio amigable. Escribe un recordatorio de pago corto (máximo 40 palabras) y muy amable para WhatsApp. El cliente es ${sale.customerName}, debe $${sale.total.toFixed(2)} de un pedido del ${saleDate}. Ofrece pasar a cobrar o un enlace de pago (genérico).`;

    try {
      const reminder = await callGeminiAPI(prompt);
      setReminderMessage(reminder);
    } catch (error) {
      setReminderMessage("Error al generar el mensaje. Por favor, intente de nuevo.");
    }
    setIsLoadingReminder(false);
  };
  
  const copyToClipboard = (text, phone) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      alert("¡Mensaje copiado! Listo para pegar en WhatsApp.");
      
      const cleanPhone = phone.replace(/\D/g, '');
      const phoneWithPrefix = cleanPhone.startsWith('52') ? cleanPhone : `52${cleanPhone}`;
      const whatsappUrl = `https://wa.me/${phoneWithPrefix}`;
      window.open(whatsappUrl, '_blank');
      
      setShowReminderModal(false);
    } catch (err) {
      console.error('Error al copiar: ', err);
      alert("Error al copiar el mensaje.");
    }
    document.body.removeChild(textArea);
  };

  // --- Funciones de Pedido y Ventas ---

  const sendWhatsAppOrder = async () => {
    if (!customerName.trim() || !customerPhone.trim() || !businessPhone.trim() || cart.length === 0) {
      alert('Por favor, completa todos los campos del cliente, el teléfono del negocio y asegúrate de que el carrito no esté vacío.');
      return;
    }

    let usageTips = "";
    if (includeTips) {
      usageTips = await generateUsageTips();
    }

    const newSale = {
      id: Date.now(),
      customerName,
      customerPhone,
      cart: [...cart],
      total,
      itemCount,
      createdAt: new Date().toISOString(),
      type: isCreditSale ? 'Crédito' : 'Pagada'
    };

    if (isCreditSale) {
      setVentasACredito([newSale, ...ventasACredito]);
    } else {
      setVentasPagadas([newSale, ...ventasPagadas]);
    }

    let message = `🧼 *PEDIDO CLEANMART* 🧼\n\n`;
    message += `👤 *Cliente:* ${customerName}\n`;
    message += `📱 *Teléfono:* ${customerPhone}\n`;
    message += `💰 *Tipo de Venta:* ${isCreditSale ? 'A CRÉDITO' : 'PAGADA'}\n\n`;
    message += `🛒 *PRODUCTOS:*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n`;

    cart.forEach((item, index) => {
      message += `\n${index + 1}. *${item.name}*\n`;
      message += `   🌸 Fragancia: ${item.fragrance}\n`;
      message += `   📦 Tamaño: ${item.size}\n`;
      message += `   💰 Precio Unit.: $${item.price.toFixed(2)}\n`;
      message += `   🔢 Cantidad: ${item.quantity}\n`;
      message += `   💵 Subtotal: $${(item.price * item.quantity).toFixed(2)}\n`;
    });

    message += `\n━━━━━━━━━━━━━━━━━━━━\n`;
    message += `\n💰 *TOTAL: $${total.toFixed(2)}*`;
    message += usageTips;

    setCart([]);
    setIsCreditSale(false);
    setIncludeTips(false);
    setCustomerName('');
    setCustomerPhone('');
    
    const encodedMessage = encodeURIComponent(message);
    const cleanPhone = businessPhone.replace(/\D/g, '');
    const phoneWithPrefix = cleanPhone.startsWith('52') ? cleanPhone : `52${cleanPhone}`;
    const whatsappUrl = `https://wa.me/${phoneWithPrefix}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  const markAsPaid = (saleId) => {
    const saleToMove = ventasACredito.find(sale => sale.id === saleId);
    if (!saleToMove) return;

    const paidSale = { ...saleToMove, type: 'Pagada', paidAt: new Date().toISOString() };
    setVentasPagadas([paidSale, ...ventasPagadas]);
    setVentasACredito(ventasACredito.filter(sale => sale.id !== saleId));
  };
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // --- Renderizado del Componente (JSX) ---
  return (
    <div className="min-h-screen bg-gray-100">
      {/* --- Encabezado --- */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-4xl">🫧</div>
              <div>
                <h1 className="text-2xl font-bold text-blue-600">CleanMart</h1>
                <p className="text-sm text-gray-600">Punto de Venta PWA</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowSalesModal(true)}
                className="relative text-gray-600 hover:text-blue-600"
                aria-label="Ver ventas"
              >
                <Clock size={28} />
                {ventasACredito.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-yellow-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                    {ventasACredito.length}
                  </span>
                )}
              </button>

              <div className="relative">
                <ShoppingCart className="text-blue-600" size={32} />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    {itemCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- Contenido Principal --- */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* --- Columna de Productos (Izquierda) --- */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                      selectedCategory === cat
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredProducts.map(product => (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition flex flex-col">
                  <div className="bg-gray-100 p-6 flex items-center justify-center h-40">
                    <span className="text-6xl">{product.image}</span>
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-lg font-semibold text-gray-800 flex-grow">{product.name}</h3>
                    <p className="text-xs text-gray-500 mb-2">{product.category}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">${product.price.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">/{product.unit}</p>
                      </div>
                      <button
                        onClick={() => openProductModal(product)}
                        className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
                        aria-label={`Agregar ${product.name} al carrito`}
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* --- Columna de Carrito (Derecha) --- */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <ShoppingCart className="mr-2" size={24} />
                Pedido Actual
              </h2>

              <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                {cart.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">Tu carrito está vacío</p>
                ) : (
                  cart.map(item => (
                    <div key={item.uniqueId} className="flex items-center space-x-3">
                      <span className="text-3xl">{item.image}</span>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-800">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.fragrance} • {item.size}</p>
                        <p className="text-sm text-blue-600 font-semibold">${item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.uniqueId, -1)}
                          className="bg-gray-200 rounded p-1 hover:bg-gray-300"
                          aria-label={`Quitar uno de ${item.name}`}
                        >
                          <Minus size={16} />
                        </button>
                        <span className="font-semibold w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.uniqueId, 1)}
                          className="bg-gray-200 rounded p-1 hover:bg-gray-300"
                          aria-label={`Añadir uno de ${item.name}`}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold text-gray-800">Total:</span>
                    <span className="text-2xl font-bold text-blue-600">${total.toFixed(2)}</span>
                  </div>

                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Cliente *
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Nombre de quien recibe"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono del Cliente *
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Ej: 4441234567"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      WhatsApp del Negocio *
                    </label>
                    <input
                      type="tel"
                      value={businessPhone}
                      onChange={(e) => setBusinessPhone(e.target.value)}
                      placeholder="Tu número (se guardará)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="flex items-center space-x-2 cursor-pointer p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <input
                        type="checkbox"
                        className="w-5 h-5 text-yellow-600 rounded focus:ring-yellow-500"
                        checked={isCreditSale}
                        onChange={(e) => setIsCreditSale(e.target.checked)}
                      />
                      <span className="font-medium text-yellow-800">Marcar como Venta a Crédito</span>
                    </label>
                  </div>

                  <div className="mb-4">
                    <label className="flex items-center space-x-2 cursor-pointer p-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <input
                        type="checkbox"
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                        checked={includeTips}
                        onChange={(e) => setIncludeTips(e.target.checked)}
                      />
                      <span className="font-medium text-blue-800">✨ Incluir Consejos de Uso</span>
                    </label>
                  </div>
                  
                  <button 
                    onClick={sendWhatsAppOrder}
                    disabled={isGeneratingTips}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center space-x-2 disabled:bg-gray-400"
                  >
                    {isGeneratingTips ? (
                      <>
                        <Sparkles size={20} className="animate-spin" />
                        <span>Generando consejos...</span>
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        <span>Enviar Pedido y Guardar</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL: Configurar Producto --- */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Configurar Producto
            </h3>
            <div className="mb-4">
              <p className="font-semibold text-gray-700 mb-2">{selectedProduct.name}</p>
              <p className="text-2xl font-bold text-blue-600">${selectedProduct.price.toFixed(2)} por {selectedProduct.unit}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecciona Fragancia *
              </label>
              <select
                value={selectedFragrance}
                onChange={(e) => {
                  setSelectedFragrance(e.target.value);
                  if (e.target.value !== 'Personalizada') {
                    setCustomFragrance('');
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Elige una fragancia --</option>
                {fragrances.map(frag => (
                  <option key={frag} value={frag}>{frag}</option>
                ))}
                <option value="Personalizada">✏️ Personalizada</option>
              </select>
              
              {selectedFragrance === 'Personalizada' && (
                <input
                  type="text"
                  value={customFragrance}
                  onChange={(e) => setCustomFragrance(e.target.value)}
                  placeholder="Escribe la fragancia personalizada..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
                />
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecciona Tamaño *
              </label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Elige un tamaño --</option>
                {sizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowProductModal(false);
                  setSelectedProduct(null);
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={confirmAddToCart}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Agregar al Carrito
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: Gestión de Ventas --- */}
      {showSalesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <Clock className="mr-2" size={24} />
              Gestión de Ventas
            </h3>

            <h4 className="text-lg font-semibold text-yellow-700 mb-3 flex items-center">
              <CreditCard size={20} className="mr-2" />
              Ventas a Crédito (Por Cobrar)
            </h4>
            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
              {ventasACredito.length === 0 ? (
                <p className="text-gray-500">No hay ventas a crédito pendientes.</p>
              ) : (
                ventasACredito.map(sale => (
                  <div key={sale.id} className="border border-yellow-200 bg-yellow-50 p-4 rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                      <div className="flex-1">
                        <p className="font-bold text-gray-800">{sale.customerName}</p>
                        <p className="text-sm text-gray-600">{sale.customerPhone}</p>
                        <p className="text-lg font-semibold text-blue-600">${sale.total.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">
                          Pedido: {new Date(sale.createdAt).toLocaleString()}
                        </p>
                        <details className="text-sm mt-2 cursor-pointer">
                          <summary className="font-medium text-gray-600">Ver {sale.itemCount} productos...</summary>
                          <ul className="list-disc pl-5 mt-1">
                            {sale.cart.map(item => (
                              <li key={item.uniqueId}>
                                {item.quantity}x {item.name} ({item.size}, {item.fragrance})
                              </li>
                            ))}
                          </ul>
                        </details>
                      </div>
                      <div className="mt-4 sm:mt-0 sm:ml-4 flex-shrink-0 flex flex-col space-y-2">
                        <button
                          onClick={() => markAsPaid(sale.id)}
                          className="flex items-center justify-center space-x-2 cursor-pointer p-2 bg-green-200 text-green-800 rounded-lg hover:bg-green-300 font-medium"
                        >
                          <CheckCircle size={18} />
                          <span>Marcar como Pagada</span>
                        </button>
                        <button
                          onClick={() => handleGenerateReminder(sale)}
                          disabled={isLoadingReminder && currentSaleForReminder?.id === sale.id}
                          className="flex items-center justify-center space-x-2 cursor-pointer p-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 font-medium disabled:bg-gray-200"
                        >
                          <Sparkles size={18} />
                          <span>Recordar Pago</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <h4 className="text-lg font-semibold text-green-700 mb-3 flex items-center">
              <CheckCircle size={20} className="mr-2" />
              Historial de Ventas Pagadas
            </h4>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
               {ventasPagadas.length === 0 ? (
                <p className="text-gray-500">No hay ventas pagadas.</p>
              ) : (
                ventasPagadas.map(sale => (
                  <div key={sale.id} className="border border-green-200 bg-green-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-gray-800">{sale.customerName}</p>
                        <p className="text-lg font-semibold text-green-700">${sale.total.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">
                          {sale.paidAt ? `Pagado: ${new Date(sale.paidAt).toLocaleString()}` : `Registrado: ${new Date(sale.createdAt).toLocaleString()}`}
                        </p>
                      </div>
                      <details className="text-sm cursor-pointer">
                        <summary className="font-medium text-gray-600">Ver {sale.itemCount} productos...</summary>
                        <ul className="list-disc pl-5 mt-1">
                          {sale.cart.map(item => (
                            <li key={item.uniqueId}>
                              {item.quantity}x {item.name} ({item.size}, {item.fragrance})
                            </li>
                          ))}
                        </ul>
                      </details>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowSalesModal(false)}
              className="mt-8 w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL: Recordatorio de Pago --- */}
      {showReminderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Sparkles size={22} className="mr-2 text-blue-500" />
              Recordatorio de Pago
            </h3>
            
            {isLoadingReminder ? (
              <div className="flex items-center justify-center h-24">
                <Sparkles size={32} className="animate-spin text-blue-500" />
                <p className="ml-3 text-gray-600">Generando mensaje...</p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje Generado:
                </label>
                <textarea
                  readOnly
                  value={reminderMessage}
                  className="w-full h-32 p-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
            )}
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowReminderModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Cerrar
              </button>
              <button
                onClick={() => copyToClipboard(reminderMessage, currentSaleForReminder.customerPhone)}
                disabled={isLoadingReminder || !reminderMessage}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-medium disabled:bg-gray-400"
              >
                Copiar y Enviar por WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

