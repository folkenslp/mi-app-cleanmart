import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  ShoppingCart, Plus, Minus, Trash2, Search, Package, Send, Clock, CreditCard, 
  CheckCircle, Sparkles, Settings, Lock, Check, X, Save, Printer, Tag, Users, 
  BarChart3, TrendingUp, DollarSign, PieChart 
} from 'lucide-react';

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

// --- Datos Iniciales (Ordenados Alfabéticamente) ---
const initialProducts = [
  { id: 27, name: 'Aromatizante', price: 55.00, category: 'Aromas', image: '🌺', stock: 50, unit: 'L' },
  { id: 26, name: 'Body Shower', price: 43.00, category: 'Higiene Personal', image: '🚿', stock: 50, unit: 'L' },
  { id: 1, name: 'Cloro', price: 9.00, category: 'Desinfección', image: '🧪', stock: 50, unit: 'L' },
  { id: 18, name: 'Desengrasante', price: 33.00, category: 'Limpieza General', image: '🔧', stock: 50, unit: 'L' },
  { id: 15, name: 'Detergente Clorado (Cloro en Gel)', price: 25.00, category: 'Desinfección', image: '🟢', stock: 50, unit: 'L' },
  { id: 9, name: 'Detergente Liquido para Ropa Tipo Carisma', price: 33.00, category: 'Lavandería', image: '🧼', stock: 50, unit: 'L' },
  { id: 12, name: 'Detergente Líquido para Ropa Tipo Ace', price: 33.00, category: 'Lavandería', image: '🧺', stock: 50, unit: 'L' },
  { id: 8, name: 'Detergente Líquido para Ropa Tipo Ariel Downy', price: 33.00, category: 'Lavandería', image: '💧', stock: 50, unit: 'L' },
  { id: 11, name: 'Detergente Líquido para Ropa Tipo Más Color', price: 33.00, category: 'Lavandería', image: '🎨', stock: 50, unit: 'L' },
  { id: 10, name: 'Detergente Líquido para Ropa Tipo Persil', price: 33.00, category: 'Lavandería', image: '🧺', stock: 50, unit: 'L' },
  { id: 7, name: 'Detergente Líquido para Ropa Tipo Vel Rosita', price: 33.00, category: 'Lavandería', image: '🌸', stock: 50, unit: 'L' },
  { id: 6, name: 'Detergente Líquido para Ropa Tipo Zote', price: 33.00, category: 'Lavandería', image: '🧴', stock: 50, unit: 'L' },
  { id: 3, name: 'Detergente Líquido para Trastes Plus', price: 33.00, category: 'Cocina', image: '🍽️', stock: 50, unit: 'L' },
  { id: 22, name: 'Insecticida', price: 50.00, category: 'Control de Plagas', image: '🦟', stock: 50, unit: 'L' },
  { id: 16, name: 'Jabón Líquido para Manos', price: 25.00, category: 'Higiene Personal', image: '🧴', stock: 50, unit: 'L' },
  { id: 24, name: 'Limpiavidrios', price: 30.00, category: 'Limpieza General', image: '🪟', stock: 50, unit: 'L' },
  { id: 4, name: 'Limpiador Multiusos Pino', price: 20.00, category: 'Limpieza General', image: '🌲', stock: 50, unit: 'L' },
  { id: 2, name: 'Limpiador Multiusos Tipo Fabuloso', price: 13.00, category: 'Limpieza General', image: '🧽', stock: 50, unit: 'L' },
  { id: 5, name: 'Limpiador para Ropa Pino', price: 20.00, category: 'Lavandería', image: '🧺', stock: 50, unit: 'L' },
  { id: 17, name: 'Pastillas de Cloro', price: 150.00, category: 'Desinfección', image: '⚪', stock: 50, unit: 'Kg' },
  { id: 19, name: 'Quitacochambre Líquido', price: 45.00, category: 'Cocina', image: '🧹', stock: 50, unit: 'L' },
  { id: 14, name: 'Quitamanchas Tipo Oxy-Clean', price: 52.00, category: 'Lavandería', image: '💫', stock: 50, unit: 'Kg' },
  { id: 13, name: 'Quitamanchas Tipo Vanish Líquido', price: 48.00, category: 'Lavandería', image: '✨', stock: 50, unit: 'L' },
  { id: 25, name: 'Sarricida', price: 45.00, category: 'Limpieza General', image: '🚽', stock: 50, unit: 'L' },
  { id: 23, name: 'Shampoo Capilar a Base de Romero', price: 65.00, category: 'Higiene Personal', image: '🌿', stock: 50, unit: 'L' },
  { id: 20, name: 'Suavizante de Telas', price: 20.00, category: 'Lavandería', image: '👕', stock: 50, unit: 'L' },
  { id: 21, name: 'Suavizante de Telas (Momentos Mágicos)', price: 22.00, category: 'Lavandería', image: '✨', stock: 50, unit: 'L' }
];

// --- FUNCIONES DE AYUDA PARA GEMINI API ---
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

const callGeminiAPI = async (prompt) => {
  const apiKey = ""; // Dejar vacío
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

// --- Componente Principal ---
export default function App() {
  // --- Estados de la App ---
  
  // Catálogo y Carrito
  const [products, setProducts] = useLocalStorage('cleanMartProducts', initialProducts);
  const [cart, setCart] = useLocalStorage('cleanMartCart', []);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  // Campos del Cliente (Teléfono Eliminado)
  const [customerName, setCustomerName] = useLocalStorage('cleanMartCustomerName', '');

  // --- NUEVO: Base de Datos de Clientes ---
  const [savedCustomers, setSavedCustomers] = useLocalStorage('cleanMartCustomers', []);
  
  // Campo del Negocio (Fijo)
  const BUSINESS_WHATSAPP_NUMBER = "4446013668";
  
  // Estados para el Historial de Ventas
  const [ventasACredito, setVentasACredito] = useLocalStorage('cleanMartVentasCredito', []);
  const [ventasPagadas, setVentasPagadas] = useLocalStorage('cleanMartVentasPagadas', []);
  const [isCreditSale, setIsCreditSale] = useState(false);
  
  // Estados de Modales
  const [showSalesModal, setShowSalesModal] = useState(false);
  
  // Estados para MODAL DE PRODUCTO
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [customFragrance, setCustomFragrance] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedDishSoapFragrance, setSelectedDishSoapFragrance] = useState('');


  // Estados para FUNCIONES GEMINI
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderMessage, setReminderMessage] = useState('');
  const [isLoadingReminder, setIsLoadingReminder] = useState(false);
  const [currentSaleForReminder, setCurrentSaleForReminder] = useState(null);

  // --- NUEVOS ESTADOS PARA PANEL DE ADMIN ---
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [adminError, setAdminError] = useState('');
  const [adminView, setAdminView] = useState('dashboard'); // 'dashboard' | 'edit' | 'add'
  const [editingProduct, setEditingProduct] = useState(null); // Producto que se está editando
  const [editedPrice, setEditedPrice] = useState('');
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    price: '',
    category: 'Limpieza General',
    image: '🧴',
    stock: 50,
    unit: 'L'
  });

  // --- NUEVO: Ref para el scroll ---
  const cartRef = useRef(null);

  // --- Listas de Datos ---
  const categories = ['Todos', 'Lavandería', 'Desinfección', 'Limpieza General', 'Cocina', 'Higiene Personal', 'Control de Plagas', 'Aromas'];
  const sizes = ['1L', '2L', '5L', '10L', '20L', 'Galón'];
  const sizesForSpecialProducts = ['500ml', '1L', '2L', '5L', '10L', '20L', 'Galón'];
  const sizesForPastillas = ['1/2 Kg', '1 Kg'];
  const dishSoapFragrances = ['LIMÓN', 'NARANJA'];
  const emojis = ['🧴', '🧪', '🧽', '🍽️', '🌲', '🧺', '🌸', '💧', '🧼', '🎨', '✨', '💫', '🫧', '⚪', '🔧', '🧹', '👕', '🦟', '🌿', '🪟', '🐜', '🚿', '🌺', '🐾', '🚽', '🟢'];

  const productsWithCustomFragrance = [
    'Limpiador Multiusos Tipo Fabuloso',
    'Shampoo Capilar a Base de Romero',
    'Aromatizante',
    'Body Shower'
  ];

  const productsWith500ml = [
    'Shampoo Capilar a Base de Romero',
    'Aromatizante',
    'Body Shower'
  ];
  
  const productsWithNoOptions = [];


  // --- NUEVA FUNCIÓN: Scroll al Carrito ---
  const handleCartIconClick = () => {
    cartRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // --- CALCULO DE ESTADISTICAS DASHBOARD ---
  const dashboardStats = useMemo(() => {
    const allSales = [...ventasPagadas, ...ventasACredito];
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    let salesToday = 0;
    let salesMonth = 0;
    let pendingCredit = 0;
    const productStats = {};

    allSales.forEach(sale => {
      const saleTime = new Date(sale.createdAt).getTime();
      
      // Calcular ventas
      if (saleTime >= startOfDay) salesToday += sale.total;
      if (saleTime >= startOfMonth) salesMonth += sale.total;

      // Contar productos
      sale.cart.forEach(item => {
        productStats[item.name] = (productStats[item.name] || 0) + item.quantity;
      });
    });

    // Calcular crédito pendiente
    ventasACredito.forEach(sale => pendingCredit += sale.total);

    // Ordenar productos más vendidos
    const topProducts = Object.entries(productStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, quantity]) => ({ name, quantity }));
      
    // Encontrar la cantidad máxima para la barra de progreso
    const maxQuantity = topProducts.length > 0 ? topProducts[0].quantity : 1;

    return { salesToday, salesMonth, pendingCredit, topProducts, maxQuantity };
  }, [ventasPagadas, ventasACredito]);


  // --- Funciones del Carrito ---
  
  const openProductModal = (product) => {
    setSelectedProduct(product);
    setCustomFragrance('');
    setSelectedSize('');
    setSelectedDishSoapFragrance(''); // Resetea el aroma de trastes
    setShowProductModal(true);
  };

  const addSimpleProductToCart = (product) => {
    const uniqueId = `${product.id}`; 
    
    const productWithDetails = {
      ...product,
      fragrance: "N/A",
      size: product.unit, 
      unitPrice: product.price,
      price: product.price, 
      uniqueId: uniqueId
    };

    const existing = cart.find(item => item.uniqueId === productWithDetails.uniqueId);
    if (existing) {
      setCart(cart.map(item =>
        item.uniqueId === productWithDetails.uniqueId ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...productWithDetails, quantity: 1 }]);
    }
  };


  const confirmAddToCart = () => {
    const needsCustomFragrance = productsWithCustomFragrance.includes(selectedProduct.name);
    const isDishSoap = selectedProduct.id === 3;
    const isPastillasCloro = selectedProduct.id === 17;
    
    let finalFragrance = "N/A";
    let uniqueId = "";

    // Validación
    if (needsCustomFragrance) {
      if (!customFragrance.trim()) {
        alert('Por favor escribe la fragancia personalizada');
        return;
      }
      finalFragrance = customFragrance;
    } else if (isDishSoap) {
      if (!selectedDishSoapFragrance) {
        alert('Por favor selecciona un aroma');
        return;
      }
      finalFragrance = selectedDishSoapFragrance;
    }
    
    if (!selectedSize) {
       alert('Por favor selecciona un tamaño');
      return;
    }

    // Cálculo de precio
    let calculatedPrice = 0;
    const isSpecial500ml = selectedSize === '500ml' && productsWith500ml.includes(selectedProduct.name);

    if (isPastillasCloro) { 
      if (selectedSize === '1/2 Kg') {
        calculatedPrice = 80;
      } else if (selectedSize === '1 Kg') {
        calculatedPrice = 150; // Precio base del producto
      }
    } else if (isSpecial500ml) {
      calculatedPrice = Math.ceil((selectedProduct.price / 2) + 1);
    } else if (selectedSize === 'Galón') {
      const sizeInLiters = 4; 
      calculatedPrice = selectedProduct.price * sizeInLiters;
    } else {
      const sizeInLiters = parseFloat(selectedSize.replace('ml', '').replace('L', '')) / (selectedSize.includes('ml') ? 1000 : 1);
      calculatedPrice = selectedProduct.price * sizeInLiters;
    }

    // Crear ID único
    if (finalFragrance !== "N/A") {
      uniqueId = `${selectedProduct.id}-${finalFragrance}-${selectedSize}`;
    } else {
      uniqueId = `${selectedProduct.id}-${selectedSize}`;
    }
      
    const productWithDetails = {
      ...selectedProduct,
      fragrance: finalFragrance,
      size: selectedSize,
      unitPrice: selectedProduct.price, // Precio base por L/Kg
      price: calculatedPrice, // Precio calculado para el tamaño
      uniqueId: uniqueId
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

  const updateQuantity = (uniqueId, delta) => {
    setCart(currentCart =>
      currentCart.map(item =>
        item.uniqueId === uniqueId ? { ...item, quantity: item.quantity + delta } : item
      ).filter(item => item.quantity > 0) // Elimina si la cantidad es 0
    );
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // --- NUEVA FUNCIÓN: IMPRESIÓN DE ETIQUETAS (10x5 cm) ---
  const handlePrintLabels = (sale) => {
    const printWindow = window.open('', '', 'width=600,height=400');
    
    // Logo en formato SVG Data URI (Clean Mart con burbujas y fondo azul)
    const cleanMartLogo = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Crect width='512' height='512' fill='%233B82F6' rx='80'/%3E%3Ccircle cx='200' cy='200' r='90' fill='white'/%3E%3Ccircle cx='380' cy='150' r='40' fill='white'/%3E%3Ccircle cx='420' cy='280' r='50' fill='white'/%3E%3Ccircle cx='120' cy='120' r='30' fill='white'/%3E%3Ctext x='50%25' y='420' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-weight='900' font-size='70' fill='white' style='text-shadow: 2px 2px 4px rgba(0,0,0,0.2);'%3EClean Mart%3C/text%3E%3C/svg%3E";

    const itemsToPrint = [];
    sale.cart.forEach(item => {
      for (let i = 0; i < item.quantity; i++) {
        itemsToPrint.push(item);
      }
    });

    const printContent = `
      <html>
        <head>
          <title>Etiquetas - CleanMart</title>
          <style>
            @page { size: 10cm 5cm; margin: 0; }
            body { 
              font-family: sans-serif; 
              margin: 0; 
              padding: 0; 
            }
            .label { 
              width: 10cm;
              height: 5cm;
              box-sizing: border-box;
              padding: 3mm 5mm;
              border: 1px dashed #ccc; /* Borde visible en pantalla */
              page-break-after: always;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              text-align: center;
              position: relative;
            }
            @media print {
              .label { border: none; } /* Sin borde al imprimir */
            }
            .logo-img {
              height: 1.4cm; /* Ajustado para 5cm de alto total */
              width: auto;
              object-fit: contain;
              margin-bottom: 2px;
              border-radius: 8px;
            }
            .product-name { font-size: 18px; font-weight: 800; margin: 2px 0; line-height: 1.1; max-height: 2.2em; overflow: hidden; text-transform: capitalize; }
            .details { font-size: 14px; font-weight: bold; color: #333; margin: 1px 0; }
            .footer { font-size: 9px; color: #666; margin-top: 4px; border-top: 1px solid #ddd; padding-top: 2px; width: 90%; }
          </style>
        </head>
        <body>
          ${itemsToPrint.map(item => `
            <div class="label">
              <!-- LOGO GENERADO -->
              <img src="${cleanMartLogo}" class="logo-img" alt="CleanMart Logo" />
              
              <div class="product-name">${item.name}</div>
              
              <div class="details">
                 ${item.size}
                 ${item.fragrance !== 'N/A' ? ` • ${item.fragrance}` : ''}
              </div>
              
              <div class="footer">
                Cliente: ${sale.customerName} • ${new Date(sale.createdAt).toLocaleDateString()}
              </div>
            </div>
          `).join('')}
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const sendWhatsAppOrder = () => { 
    // Validación
    if (!customerName.trim()) {
      alert('Por favor ingresa el nombre del cliente.');
      return;
    }
    
    if (cart.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }

    // --- CRM: Guardar cliente si no existe ---
    const trimmedName = customerName.trim();
    if (!savedCustomers.includes(trimmedName)) {
      // Agregamos el nuevo cliente y ordenamos la lista alfabéticamente
      const newCustomerList = [...savedCustomers, trimmedName].sort((a, b) => a.localeCompare(b));
      setSavedCustomers(newCustomerList);
    }

    const newSale = {
      id: Date.now(),
      customerName: trimmedName,
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
    message += `👤 *Cliente:* ${trimmedName}\n`;
    message += `💰 *Tipo de Venta:* ${isCreditSale ? 'A CRÉDITO' : 'PAGADA'}\n\n`;
    message += `🛒 *PRODUCTOS:*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n`;

    cart.forEach((item, index) => {
      message += `\n${index + 1}. *${item.name}*\n`;
      if (item.fragrance !== "N/A") {
        message += `   🌸 Aroma: ${item.fragrance}\n`;
      }
      if (productsWithNoOptions.includes(item.name) || item.id === 17 /* Pastillas */) {
        message += `   📦 Tamaño: ${item.size}\n`;
      } else {
        message += `   📦 Tamaño: ${item.size}\n`;
      }
      message += `   💰 Precio Unit.: $${item.price.toFixed(2)}\n`;
      message += `   🔢 Cantidad: ${item.quantity}\n`;
      message += `   💵 Subtotal: $${(item.price * item.quantity).toFixed(2)}\n`;
    });

    message += `\n━━━━━━━━━━━━━━━━━━━━\n`;
    message += `\n💰 *TOTAL: $${total.toFixed(2)}*`;

    // Limpiar
    setCart([]);
    setIsCreditSale(false);
    setCustomerName('');
    
    const encodedMessage = encodeURIComponent(message);
    const cleanPhone = BUSINESS_WHATSAPP_NUMBER.replace(/\D/g, '');
    const phoneWithPrefix = cleanPhone.startsWith('52') ? cleanPhone : `52${cleanPhone}`;
    const whatsappUrl = `https://wa.me/${phoneWithPrefix}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  // --- Funciones de Gestión de Ventas ---
  const markAsPaid = (saleId) => {
    const saleToMove = ventasACredito.find(sale => sale.id === saleId);
    if (!saleToMove) return;
    const paidSale = { ...saleToMove, type: 'Pagada', paidAt: new Date().toISOString() };
    setVentasPagadas([paidSale, ...ventasPagadas]);
    setVentasACredito(ventasACredito.filter(sale => sale.id !== saleId));
  };
  
  // --- NUEVA FUNCIÓN: GEMINI PARA RECORDATORIO DE PAGO ---
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
  
  const copyToClipboard = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      alert("¡Mensaje copiado! Abre WhatsApp para pegar.");
      setShowReminderModal(false);
    } catch (err) {
      console.error('Error al copiar: ', err);
      alert("Error al copiar el mensaje.");
    }
    document.body.removeChild(textArea);
  };


  // --- Filtro de Productos ---
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // --- NUEVAS FUNCIONES DE ADMINISTRADOR ---
  const handleAdminLogin = () => {
    if (passwordInput === "Gusanagi") {
      setAdminError('');
      setPasswordInput('');
      setShowAdminLogin(false);
      // --- CAMBIO: Dashboard es la vista por defecto al entrar ---
      setAdminView('dashboard'); 
      setShowAdminPanel(true);
    } else {
      setAdminError('Contraseña incorrecta');
    }
  };

  const handleSelectProductToEdit = (product) => {
    setEditingProduct(product);
    setEditedPrice(product.price);
  };

  const handleSavePrice = () => {
    if (!editingProduct) return;
    const newPrice = parseFloat(editedPrice);
    if (isNaN(newPrice) || newPrice <= 0) {
      alert("Por favor ingresa un precio válido.");
      return;
    }

    setProducts(products.map(p => 
      p.id === editingProduct.id ? { ...p, price: newPrice } : p
    ));
    setEditingProduct(null);
    setEditedPrice('');
    alert("Precio actualizado exitosamente.");
  };

  const handleAddNewProduct = () => {
    if (!newProductForm.name || !newProductForm.price || !newProductForm.stock) {
      alert('Por favor completa Nombre, Precio y Stock.');
      return;
    }

    const newProduct = {
      id: Date.now(), 
      name: newProductForm.name,
      price: parseFloat(newProductForm.price),
      category: newProductForm.category,
      image: newProductForm.image,
      stock: parseInt(newProductForm.stock),
      unit: newProductForm.unit
    };

    setProducts([...products, newProduct]);
    setNewProductForm({
      name: '',
      price: '',
      category: 'Limpieza General',
      image: '🧴',
      stock: 50,
      unit: 'L'
    });
    alert("Producto agregado exitosamente.");
  };

  // --- Renderizado del Componente (JSX) ---
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* --- Encabezado --- */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* --- ICONO ELIMINADO AQUÍ --- */}
              <div>
                <h1 className="text-2xl font-bold text-blue-600">CleanMart</h1>
                <p className="text-sm text-gray-600">Punto de Venta PWA</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* --- NUEVO: Botón de Admin --- */}
              <button
                onClick={() => setShowAdminLogin(true)}
                className="relative text-gray-600 hover:text-blue-600"
                aria-label="Panel de Administrador"
              >
                <Settings size={28} />
              </button>

              {/* Botón de Ventas */}
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

              {/* Botón de Carrito (MODIFICADO) */}
              <button
                onClick={handleCartIconClick}
                className="relative text-blue-600"
                aria-label="Ver carrito y datos del pedido"
              >
                <ShoppingCart size={32} />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* --- Contenido Principal --- */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* --- Columna de Productos (Izquierda) --- */}
          <div className="lg:col-span-2">
            {/* Filtros */}
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

            {/* Grid de Productos */}
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
                        // --- ¡AQUÍ ESTÁ EL CAMBIO! ---
                        onClick={() => productsWithNoOptions.includes(product.name) 
                          ? addSimpleProductToCart(product) 
                          : openProductModal(product)
                        }
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

          {/* --- Columna de Carrito (Derecha) (MODIFICADO) --- */}
          <div className="lg:col-span-1" ref={cartRef}> {/* 2. Añadir el ref aquí */}
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <ShoppingCart className="mr-2" size={24} />
                Pedido Actual
              </h2>

              {/* Lista de Carrito (--- MODIFICADO ---) */}
              <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                {cart.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">Tu carrito está vacío</p>
                ) : (
                  cart.map(item => (
                    <div key={item.uniqueId} className="flex items-center space-x-3"> {/* Key usa uniqueId */}
                      <span className="text-3xl">{item.image}</span>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-800">{item.name}</p>
                        {/* Lógica condicional para fragancia/tamaño */}
                        <p className="text-xs text-gray-500">
                          {item.fragrance !== "N/A" ? `${item.fragrance} • ${item.size}` : item.size}
                        </p>
                        <p className="text-sm text-blue-600 font-semibold">${item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.uniqueId, -1)} // Usa uniqueId
                          className="bg-gray-200 rounded p-1 hover:bg-gray-300"
                          aria-label={`Quitar uno de ${item.name}`}
                        >
                          <Minus size={16} />
                        </button>
                        <span className="font-semibold w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.uniqueId, 1)} // Usa uniqueId
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

              {/* Total y Campos */}
              {cart.length > 0 && (
                <div className="border-t pt-4">
                  {/* Total */}
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold text-gray-800">Total:</span>
                    <span className="text-2xl font-bold text-blue-600">${total.toFixed(2)}</span>
                  </div>

                  {/* Campo 1: Nombre Cliente (Con Autocompletado) */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Cliente *
                    </label>
                    <div className="relative">
                        <input
                        type="text"
                        list="customer-list" // Conectar con el datalist
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Nombre de quien recibe"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {/* Lista de sugerencias */}
                        <datalist id="customer-list">
                            {savedCustomers.map(name => (
                                <option key={name} value={name} />
                            ))}
                        </datalist>
                    </div>
                  </div>
                  
                  {/* Check de Venta a Crédito */}
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
                  
                  {/* Botón de Enviar (MODIFICADO) */}
                  <button 
                    onClick={sendWhatsAppOrder}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center space-x-2 disabled:bg-gray-400"
                  >
                    <Send size={20} />
                    <span>Enviar Pedido y Guardar</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL: Configurar Producto (MODIFICADO) --- */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Configurar Producto
            </h3>
            <div className="mb-4">
              <p className="font-semibold text-gray-700 mb-2">{selectedProduct.name}</p>
              {/* --- LÓGICA MODIFICADA: Oculta el precio base para Pastillas de Cloro --- */}
              {selectedProduct.id !== 17 && (
                <p className="text-2xl font-bold text-blue-600">${selectedProduct.price.toFixed(2)} por {selectedProduct.unit}</p>
              )}
            </div>

            {/* --- LÓGICA DE FRAGANCIA MODIFICADA --- */}
            
            {/* 1. Selector para Detergente de Trastes (ID 3) */}
            {selectedProduct.id === 3 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecciona Aroma *
                </label>
                <select
                  value={selectedDishSoapFragrance}
                  onChange={(e) => setSelectedDishSoapFragrance(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Elige un aroma --</option>
                  {dishSoapFragrances.map(frag => (
                    <option key={frag} value={frag}>{frag}</option>
                  ))}
                </select>
              </div>
            )}

            {/* 2. Campo para Fragancia Personalizada (Otros productos) */}
            {productsWithCustomFragrance.includes(selectedProduct.name) && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fragancia Personalizada *
                </label>
                <input
                  type="text"
                  value={customFragrance}
                  // --- MODIFICADO: Convierte a mayúsculas ---
                  onChange={(e) => setCustomFragrance(e.target.value.toUpperCase())}
                  placeholder="Escribe la fragancia deseada..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* 3. (No se muestra nada de fragancia para los demás productos) */}


            {/* Selector de Tamaño */}
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
                {/* --- LÓGICA DE TAMAÑO CORREGIDA --- */}
                {(
                  selectedProduct.id === 17 // 1. Es Pastillas de Cloro?
                  ? sizesForPastillas
                  : productsWith500ml.includes(selectedProduct.name) // 2. Es producto con 500ml?
                    ? sizesForSpecialProducts 
                    : sizes // 3. Es un producto normal (sin 500ml)
                ).map(size => (
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

      {/* --- Modal de Gestión de Ventas (MODIFICADO) --- */}
      {showSalesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <Clock className="mr-2" size={24} />
              Gestión de Ventas
            </h3>

            {/* Sección: Ventas a Crédito */}
            <h4 className="text-lg font-semibold text-yellow-700 mb-3 flex items-center border-b border-yellow-200 pb-2">
              <Clock className="mr-2" size={20} />
              Ventas a Crédito (Pendientes)
            </h4>
            <div className="space-y-4 mb-8 max-h-[40vh] overflow-y-auto pr-2">
                {ventasACredito.length === 0 ? (
                    <p className="text-gray-400 italic text-sm">No hay ventas a crédito pendientes.</p>
                ) : (
                    ventasACredito.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(sale => (
                      <div 
                        key={sale.id} 
                        className="border border-yellow-200 bg-yellow-50 p-4 rounded-lg"
                      >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                          <div className="flex-1">
                            <div className="flex items-center mb-1">
                              <p className="font-bold text-gray-800 mr-2">{sale.customerName}</p>
                              <span className="text-xs font-medium text-yellow-800 bg-yellow-200 px-2 py-0.5 rounded-full">
                                A CRÉDITO
                              </span>
                            </div>
                            <p className="text-lg font-semibold text-blue-600">${sale.total.toFixed(2)}</p>
                            <p className="text-xs text-gray-500">
                              Pedido: {new Date(sale.createdAt).toLocaleString()}
                            </p>
                            <details className="text-sm mt-2 cursor-pointer">
                              <summary className="font-medium text-gray-600">Ver {sale.itemCount} productos...</summary>
                              <ul className="list-disc pl-5 mt-1">
                                {sale.cart.map(item => (
                                  <li key={item.uniqueId}>
                                    {item.quantity}x {item.name} 
                                    {item.fragrance !== "N/A" ? ` (${item.size}, ${item.fragrance})` : ` (${item.size})`}
                                  </li>
                                ))}
                              </ul>
                            </details>
                          </div>
                          <div className="mt-4 sm:mt-0 sm:ml-4 flex-shrink-0 flex flex-col space-y-2">
                            {/* --- NUEVO BOTÓN IMPRIMIR --- */}
                            <button
                              onClick={() => handlePrintLabels(sale)}
                              className="flex items-center justify-center space-x-2 cursor-pointer p-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
                            >
                              <Tag size={18} />
                              <span>Imprimir Productos</span>
                            </button>
                            <button
                              onClick={() => markAsPaid(sale.id)}
                              className="flex items-center justify-center space-x-2 cursor-pointer p-2 bg-green-200 text-green-800 rounded-lg hover:bg-green-300 font-medium"
                            >
                              <CheckCircle size={18} />
                              <span>Marcar como Pagada</span>
                            </button>
                            <button
                              onClick={() => handleGenerateReminder(sale)}
                              disabled={isLoadingReminder}
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

            {/* Sección: Ventas Pagadas */}
            <h4 className="text-lg font-semibold text-green-700 mb-3 flex items-center border-b border-green-200 pb-2">
              <CheckCircle className="mr-2" size={20} />
              Historial de Ventas Pagadas
            </h4>
            <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
                {ventasPagadas.length === 0 ? (
                    <p className="text-gray-400 italic text-sm">No hay ventas pagadas registradas.</p>
                ) : (
                    ventasPagadas.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(sale => (
                      <div 
                        key={sale.id} 
                        className="border border-green-200 bg-green-50 p-4 rounded-lg"
                      >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                          <div className="flex-1">
                            <div className="flex items-center mb-1">
                              <p className="font-bold text-gray-800 mr-2">{sale.customerName}</p>
                              <span className="text-xs font-medium text-green-800 bg-green-200 px-2 py-0.5 rounded-full">
                                PAGADA
                              </span>
                            </div>
                            <p className="text-lg font-semibold text-blue-600">${sale.total.toFixed(2)}</p>
                            <p className="text-xs text-gray-500">
                              {sale.paidAt 
                                ? `Pagado: ${new Date(sale.paidAt).toLocaleString()}` 
                                : `Pedido: ${new Date(sale.createdAt).toLocaleString()}`}
                            </p>
                            <details className="text-sm mt-2 cursor-pointer">
                              <summary className="font-medium text-gray-600">Ver {sale.itemCount} productos...</summary>
                              <ul className="list-disc pl-5 mt-1">
                                {sale.cart.map(item => (
                                  <li key={item.uniqueId}>
                                    {item.quantity}x {item.name} 
                                    {item.fragrance !== "N/A" ? ` (${item.size}, ${item.fragrance})` : ` (${item.size})`}
                                  </li>
                                ))}
                              </ul>
                            </details>
                          </div>
                           <div className="mt-4 sm:mt-0 sm:ml-4 flex-shrink-0 flex flex-col space-y-2">
                              {/* --- NUEVO BOTÓN IMPRIMIR --- */}
                             <button
                                onClick={() => handlePrintLabels(sale)}
                                className="flex items-center justify-center space-x-2 cursor-pointer p-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
                              >
                                <Tag size={18} />
                                <span>Imprimir Productos</span>
                              </button>
                           </div>
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
                onClick={() => copyToClipboard(reminderMessage)}
                disabled={isLoadingReminder || !reminderMessage}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-medium disabled:bg-gray-400"
              >
                Copiar Mensaje
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- NUEVO: Modal de Login de Admin --- */}
      {showAdminLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Lock size={20} className="mr-2" />
              Acceso de Administrador
            </h3>
            <p className="text-sm text-gray-600 mb-4">Ingresa la contraseña para gestionar el inventario.</p>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Contraseña"
            />
            {adminError && (
              <p className="text-red-500 text-sm mt-2">{adminError}</p>
            )}
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => { setShowAdminLogin(false); setPasswordInput(''); setAdminError(''); }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleAdminLogin}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Entrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- NUEVO: Modal de Panel de Admin --- */}
      {showAdminPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <Settings size={22} className="mr-2" />
                Gestión de Inventario
              </h3>
              <button onClick={() => setShowAdminPanel(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            {/* Pestañas de Admin */}
            <div className="flex border-b mb-4 overflow-x-auto">
              <button
                onClick={() => setAdminView('dashboard')}
                className={`py-2 px-4 font-medium flex-shrink-0 flex items-center ${adminView === 'dashboard' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
              >
                <BarChart3 size={16} className="mr-1" /> Dashboard
              </button>
              <button
                onClick={() => setAdminView('edit')}
                className={`py-2 px-4 font-medium flex-shrink-0 ${adminView === 'edit' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
              >
                Modificar Precios
              </button>
              <button
                onClick={() => setAdminView('add')}
                className={`py-2 px-4 font-medium flex-shrink-0 ${adminView === 'add' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
              >
                Agregar Producto
              </button>
            </div>

            {/* VISTA: DASHBOARD DE ESTADÍSTICAS */}
            {adminView === 'dashboard' && (
                <div className="space-y-6">
                    {/* Tarjetas de Resumen */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                    <DollarSign size={20} />
                                </div>
                                <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">Hoy</span>
                            </div>
                            <p className="text-sm text-gray-500">Ventas Totales</p>
                            <h4 className="text-2xl font-bold text-gray-800">${dashboardStats.salesToday.toFixed(2)}</h4>
                        </div>

                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                                <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                                    <TrendingUp size={20} />
                                </div>
                                <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">Mes Actual</span>
                            </div>
                            <p className="text-sm text-gray-500">Ventas Acumuladas</p>
                            <h4 className="text-2xl font-bold text-gray-800">${dashboardStats.salesMonth.toFixed(2)}</h4>
                        </div>

                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                                <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600">
                                    <Clock size={20} />
                                </div>
                                <span className="text-xs font-semibold text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full">Pendiente</span>
                            </div>
                            <p className="text-sm text-gray-500">Cuentas por Cobrar</p>
                            <h4 className="text-2xl font-bold text-gray-800">${dashboardStats.pendingCredit.toFixed(2)}</h4>
                        </div>
                    </div>

                    {/* Gráfico de Productos Más Vendidos */}
                    <div className="bg-white border rounded-lg p-4 shadow-sm">
                        <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                            <PieChart size={18} className="mr-2 text-gray-500" />
                            Top 5 Productos Más Vendidos
                        </h4>
                        <div className="space-y-3">
                            {dashboardStats.topProducts.length === 0 ? (
                                <p className="text-sm text-gray-400 italic text-center py-4">No hay datos de ventas suficientes.</p>
                            ) : (
                                dashboardStats.topProducts.map((product, index) => (
                                    <div key={product.name} className="relative">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-gray-700">{index + 1}. {product.name}</span>
                                            <span className="text-gray-500">{product.quantity} un.</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                                            <div 
                                                className="bg-blue-600 h-2.5 rounded-full" 
                                                style={{ width: `${(product.quantity / dashboardStats.maxQuantity) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Vista: Modificar Precios */}
            {adminView === 'edit' && (
              <div>
                {!editingProduct ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    <p className="text-sm text-gray-600 mb-2">Selecciona un producto para editar su precio:</p>
                    {products.sort((a, b) => a.name.localeCompare(b.name)).map(p => (
                      <div key={p.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{p.name}</p>
                          <p className="text-sm text-gray-500">Precio actual: ${p.price.toFixed(2)}</p>
                        </div>
                        <button
                          onClick={() => handleSelectProductToEdit(p)}
                          className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700"
                        >
                          Modificar
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    <h4 className="text-lg font-semibold mb-2">Editando: {editingProduct.name}</h4>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nuevo Precio (por {editingProduct.unit})</label>

                      <input
                        type="number"
                        step="0.01"
                        value={editedPrice}
                        onChange={(e) => setEditedPrice(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex space-x-3">
                      <button onClick={() => setEditingProduct(null)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300">
                        Cancelar
                      </button>
                      <button onClick={handleSavePrice} className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
                        <Save size={18} className="inline mr-1" /> Guardar Precio
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Vista: Agregar Producto */}
            {adminView === 'add' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Producto *</label>
                  <input
                    type="text"
                    value={newProductForm.name}
                    onChange={(e) => setNewProductForm({...newProductForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio (por Kg/L) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProductForm.price}
                    onChange={(e) => setNewProductForm({...newProductForm, price: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <select
                    value={newProductForm.category}
                    onChange={(e) => setNewProductForm({...newProductForm, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {categories.filter(c => c !== 'Todos').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Inicial *</label>
                  <input
                    type="number"
                    value={newProductForm.stock}
                    onChange={(e) => setNewProductForm({...newProductForm, stock: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unidad (L/Kg)</label>
                  <select
                    value={newProductForm.unit}
                    onChange={(e) => setNewProductForm({...newProductForm, unit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="L">Litro (L)</option>
                    <option value="Kg">Kilogramo (Kg)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ícono (Emoji)</label>
                  <div className="grid grid-cols-8 gap-2 p-2 border rounded-lg max-h-32 overflow-y-auto">
                    {emojis.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setNewProductForm({...newProductForm, image: emoji})}
                        className={`text-2xl p-2 rounded-lg hover:bg-blue-100 transition ${
                          newProductForm.image === emoji ? 'bg-blue-200 ring-2 ring-blue-500' : 'bg-gray-100'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleAddNewProduct}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  <Plus size={20} className="inline mr-1" /> Agregar Nuevo Producto
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}