// Definir primero las empresas y sus marcas asociadas
export const empresas = [
  {
    id: "AUTOLLANTA",
    nombre: "AUTOLLANTA",
    descripcion: "Especialistas en neumáticos de alta calidad",
    logo: "/src/assets/enterprises/AutollantaLogo.png",
    color: "#0056b3",
    marcas: ["Fortune", "Roadcruza"],
    products: 210,
  },
  {
    id: "MAXXIMUNDO",
    nombre: "MAXXIMUNDO",
    descripcion: "Neumáticos y lubricantes de calidad superior",
    logo: "/src/assets/enterprises/MaxximundoLogo.png",
    color: "#28a745",
    marcas: ["Maxxis", "Shell", "Roadcruza", "Aplus"],
    products: 312,
  },
  {
    id: "STOX",
    nombre: "STOX",
    descripcion: "Soluciones automotrices integrales",
    logo: "/src/assets/enterprises/StoxLogo.png",
    color: "#dc3545",
    marcas: ["CST", "Farroad", "Ansu", "Bayi-Rubber"],
    products: 240,
  },
  {
    id: "AUTOMAX",
    nombre: "AUTOMAX",
    descripcion: "Accesorios y repuestos para vehículos",
    logo: "/src/assets/enterprises/AutomaxLogo.png",
    color: "#fd7e14",
    marcas: ["Cost"],
    products: 200,
  },
  {
    id: "IKONIX",
    nombre: "IKONIX",
    descripcion: "Herramientas profesionales y sistemas de iluminación",
    logo: "/src/assets/enterprises/IkonixLogo.png",
    color: "#6610f2",
    marcas: ["Uyustools", "FSL"],
    products: 347,
  },
];

// Definir categorías por tipo de producto
export const categorias = {
  neumaticos: [
    { id: 1, name: "sedan", displayName: "Para Sedán" },
    { id: 2, name: "suv", displayName: "Para SUV/Camionetas" },
    { id: 3, name: "camion", displayName: "Para Camiones" },
    { id: 4, name: "moto", displayName: "Para Motocicletas" },
    { id: 5, name: "todoterreno", displayName: "Todo Terreno" },
  ],
  lubricantes: [
    { id: 6, name: "aceite_motor", displayName: "Aceite de Motor" },
    { id: 7, name: "aceite_transmision", displayName: "Aceite de Transmisión" },
    { id: 8, name: "liquido_frenos", displayName: "Líquido de Frenos" },
    { id: 9, name: "refrigerante", displayName: "Refrigerante" },
    { id: 10, name: "aditivos", displayName: "Aditivos" },
  ],
  herramientas: [
    { id: 11, name: "manuales", displayName: "Herramientas Manuales" },
    { id: 12, name: "electricas", displayName: "Herramientas Eléctricas" },
    { id: 13, name: "neumaticas", displayName: "Herramientas Neumáticas" },
    {
      id: 14,
      name: "especialidad",
      displayName: "Herramientas de Especialidad",
    },
  ],
  iluminacion: [
    { id: 15, name: "interior", displayName: "Iluminación Interior" },
    { id: 16, name: "exterior", displayName: "Iluminación Exterior" },
    { id: 17, name: "led", displayName: "Tecnología LED" },
    { id: 18, name: "accesorios", displayName: "Accesorios de Iluminación" },
  ],
};

// Exportar todas las categorías en un solo array para compatibilidad con el código existente
export const categories = [].concat(
  ...Object.values(categorias).map((catArray) => catArray)
);

// Función para generar productos por empresa
function generarProductosPorEmpresa() {
  // Objeto que contendrá todos los productos organizados por empresa
  const productosPorEmpresa = {};
  let idCounter = 1;

  // Para Autollanta (Neumáticos)
  productosPorEmpresa.AUTOLLANTA = [
    // Fortune
    {
      id: idCounter++,
      name: "Neumático Fortune FSR-303 225/65R17",
      description:
        "Neumático para SUV con excelente agarre en superficie húmeda y seca.",
      price: 129.99,
      discount: 5,
      image: "https://via.placeholder.com/300x300?text=Fortune+FSR303",
      categories: ["suv", "todoterreno"],
      brand: "Fortune",
      rating: 4.5,
      stock: 45,
      destacado: true,
      empresaId: "AUTOLLANTA",
      // Atributos específicos para neumáticos
      specs: {
        medida: "225/65R17",
        indiceVelocidad: "H",
        indiceCarga: "102",
        tipo: "Radial",
        perfil: "Asimétrico",
      },
    },
    {
      id: idCounter++,
      name: "Neumático Fortune FSR-201 195/55R15",
      description:
        "Neumático deportivo para sedán con excelente respuesta en curvas.",
      price: 89.5,
      discount: 0,
      image: "https://via.placeholder.com/300x300?text=Fortune+FSR201",
      categories: ["sedan"],
      brand: "Fortune",
      rating: 4.3,
      stock: 60,
      destacado: false,
      empresaId: "AUTOLLANTA",
      specs: {
        medida: "195/55R15",
        indiceVelocidad: "V",
        indiceCarga: "85",
        tipo: "Radial",
        perfil: "Deportivo",
      },
    },
    // Roadcruza
    {
      id: idCounter++,
      name: "Neumático Roadcruza RA1100 265/70R16",
      description:
        "Neumático todo terreno con alta durabilidad y tracción superior.",
      price: 145.75,
      discount: 10,
      image: "https://via.placeholder.com/300x300?text=Roadcruza+RA1100",
      categories: ["suv", "todoterreno"],
      brand: "Roadcruza",
      rating: 4.7,
      stock: 35,
      destacado: true,
      empresaId: "AUTOLLANTA",
      specs: {
        medida: "265/70R16",
        indiceVelocidad: "S",
        indiceCarga: "112",
        tipo: "Radial",
        perfil: "All-Terrain",
      },
    },
    {
      id: idCounter++,
      name: "Neumático Roadcruza RA510 185/65R14",
      description:
        "Neumático económico con buen rendimiento para vehículos compactos.",
      price: 75.9,
      discount: 0,
      image: "https://via.placeholder.com/300x300?text=Roadcruza+RA510",
      categories: ["sedan"],
      brand: "Roadcruza",
      rating: 4.0,
      stock: 80,
      destacado: false,
      empresaId: "AUTOLLANTA",
      specs: {
        medida: "185/65R14",
        indiceVelocidad: "T",
        indiceCarga: "86",
        tipo: "Radial",
        perfil: "Estándar",
      },
    },
  ];

  // Para Maxximundo (Neumáticos y Lubricantes)
  productosPorEmpresa.MAXXIMUNDO = [
    // Maxxis (Neumáticos)
    {
      id: idCounter++,
      name: "Neumático Maxxis AT980E 245/75R16",
      description:
        "Neumático todo terreno para camionetas con rendimiento extremo en superficies difíciles.",
      price: 189.99,
      discount: 0,
      image: "https://via.placeholder.com/300x300?text=Maxxis+AT980E",
      categories: ["suv", "todoterreno"],
      brand: "Maxxis",
      rating: 4.8,
      stock: 25,
      destacado: true,
      empresaId: "MAXXIMUNDO",
      specs: {
        medida: "245/75R16",
        indiceVelocidad: "Q",
        indiceCarga: "120/116",
        tipo: "Radial",
        perfil: "Mud Terrain",
      },
    },
    {
      id: idCounter++,
      name: "Neumático Maxxis MA-Z4S 215/45ZR17",
      description:
        "Neumático ultra-high performance para vehículos deportivos.",
      price: 165.5,
      discount: 5,
      image: "https://via.placeholder.com/300x300?text=Maxxis+MA-Z4S",
      categories: ["sedan"],
      brand: "Maxxis",
      rating: 4.6,
      stock: 30,
      destacado: false,
      empresaId: "MAXXIMUNDO",
      specs: {
        medida: "215/45ZR17",
        indiceVelocidad: "W",
        indiceCarga: "91",
        tipo: "Radial",
        perfil: "Ultra High Performance",
      },
    },
    // CST (Neumáticos)
    {
      id: idCounter++,
      name: "Neumático CST Adreno AT 235/75R15",
      description:
        "Neumático all-terrain para camionetas con excelente durabilidad.",
      price: 132.75,
      discount: 0,
      image: "https://via.placeholder.com/300x300?text=CST+Adreno",
      categories: ["suv", "todoterreno"],
      brand: "CST",
      rating: 4.2,
      stock: 40,
      destacado: false,
      empresaId: "MAXXIMUNDO",
      specs: {
        medida: "235/75R15",
        indiceVelocidad: "S",
        indiceCarga: "109",
        tipo: "Radial",
        perfil: "All Terrain",
      },
    },
    // Shell (Lubricantes)
    {
      id: idCounter++,
      name: "Aceite Shell Helix Ultra 5W-40 4L",
      description:
        "Aceite 100% sintético de alto rendimiento para motores modernos.",
      price: 58.9,
      discount: 10,
      image: "https://via.placeholder.com/300x300?text=Shell+Helix+Ultra",
      categories: ["aceite_motor"],
      brand: "Shell",
      rating: 4.9,
      stock: 100,
      destacado: true,
      empresaId: "MAXXIMUNDO",
      specs: {
        viscosidad: "5W-40",
        tipo: "Sintético",
        capacidad: "4L",
        apiSn: true,
        aceaC3: true,
      },
    },
    {
      id: idCounter++,
      name: "Refrigerante Shell Anticongelante 50/50 3.78L",
      description: "Protección contra la congelación y el sobrecalentamiento.",
      price: 22.99,
      discount: 0,
      image: "https://via.placeholder.com/300x300?text=Shell+Anticongelante",
      categories: ["refrigerante"],
      brand: "Shell",
      rating: 4.3,
      stock: 85,
      destacado: false,
      empresaId: "MAXXIMUNDO",
      specs: {
        tipo: "50/50 Mezcla",
        capacidad: "3.78L",
        color: "Verde",
        temperatura: "-34°C a +103°C",
      },
    },
  ];

  // Para Stox
  productosPorEmpresa.STOX = [
    // Hahua
    {
      id: idCounter++,
      name: "Neumático Hahua HH301 205/60R16",
      description: "Neumático para sedán con excelente rendimiento en ciudad.",
      price: 92.5,
      discount: 5,
      image: "https://via.placeholder.com/300x300?text=Hahua+HH301",
      categories: ["sedan"],
      brand: "Hahua",
      rating: 4.1,
      stock: 65,
      destacado: true,
      empresaId: "STOX",
      specs: {
        medida: "205/60R16",
        indiceVelocidad: "H",
        indiceCarga: "92",
        tipo: "Radial",
        perfil: "Turismo",
      },
    },
    // PowerMax
    {
      id: idCounter++,
      name: "Neumático PowerMax PM100 175/70R13",
      description: "Neumático económico para vehículos compactos.",
      price: 59.99,
      discount: 15,
      image: "https://via.placeholder.com/300x300?text=PowerMax+PM100",
      categories: ["sedan"],
      brand: "PowerMax",
      rating: 3.8,
      stock: 110,
      destacado: false,
      empresaId: "STOX",
      specs: {
        medida: "175/70R13",
        indiceVelocidad: "T",
        indiceCarga: "82",
        tipo: "Radial",
        perfil: "Económico",
      },
    },
    // RimTech
    {
      id: idCounter++,
      name: "Aro RimTech Sport R17 Negro Mate",
      description:
        "Aros deportivos de alta resistencia con acabado negro mate.",
      price: 210.0,
      discount: 0,
      image: "https://via.placeholder.com/300x300?text=RimTech+R17",
      categories: ["sedan", "suv"],
      brand: "RimTech",
      rating: 4.5,
      stock: 20,
      destacado: true,
      empresaId: "STOX",
      specs: {
        diametro: '17"',
        anchura: "7.5J",
        offset: "ET35",
        pcd: "5x114.3",
        acabado: "Negro Mate",
      },
    },
  ];

  // Para Automax
  productosPorEmpresa.AUTOMAX = [
    // Cost
    {
      id: idCounter++,
      name: "Neumático Cost Roadmax 31x10.5R15",
      description: "Neumático off-road para 4x4 y camionetas.",
      price: 168.75,
      discount: 0,
      image: "https://via.placeholder.com/300x300?text=Cost+Roadmax",
      categories: ["suv", "todoterreno"],
      brand: "Cost",
      rating: 4.4,
      stock: 28,
      destacado: true,
      empresaId: "AUTOMAX",
      specs: {
        medida: "31x10.5R15",
        indiceVelocidad: "Q",
        indiceCarga: "109",
        tipo: "Radial",
        perfil: "Off-road",
      },
    },
    {
      id: idCounter++,
      name: "Neumático Cost EcoSport 185/70R14",
      description:
        "Neumático para uso diario con buen rendimiento y economía de combustible.",
      price: 69.99,
      discount: 10,
      image: "https://via.placeholder.com/300x300?text=Cost+EcoSport",
      categories: ["sedan"],
      brand: "Cost",
      rating: 4.0,
      stock: 95,
      destacado: false,
      empresaId: "AUTOMAX",
      specs: {
        medida: "185/70R14",
        indiceVelocidad: "T",
        indiceCarga: "88",
        tipo: "Radial",
        perfil: "Turismo",
      },
    },
  ];

  // Para Ikonix (Herramientas e Iluminación)
  productosPorEmpresa.IKONIX = [
    // Uyustools (Herramientas)
    {
      id: idCounter++,
      name: "Taladro Inalámbrico Uyustools 20V",
      description: "Taladro a batería con 2 velocidades y alto torque.",
      price: 145.0,
      discount: 15,
      image: "https://via.placeholder.com/300x300?text=Uyustools+Taladro",
      categories: ["electricas"],
      brand: "Uyustools",
      rating: 4.7,
      stock: 35,
      destacado: true,
      empresaId: "IKONIX",
      specs: {
        potencia: "20V",
        velocidad: "0-450/0-1800 RPM",
        bateria: "Li-Ion 2.0Ah",
        mandril: "13mm",
        incluye: "2 baterías, cargador, maletín",
      },
    },
    {
      id: idCounter++,
      name: "Juego de Llaves Uyustools 40 piezas",
      description:
        "Juego completo de llaves combinadas en medidas métricas y pulgadas.",
      price: 89.9,
      discount: 0,
      image: "https://via.placeholder.com/300x300?text=Uyustools+Llaves",
      categories: ["manuales"],
      brand: "Uyustools",
      rating: 4.5,
      stock: 50,
      destacado: false,
      empresaId: "IKONIX",
      specs: {
        piezas: 40,
        material: "Acero Cromo-Vanadio",
        acabado: "Cromado",
        medidas: '8-19mm y 5/16"-3/4"',
        estuche: "Plástico resistente",
      },
    },
    // LumC (Iluminación)
    {
      id: idCounter++,
      name: "Foco LED LumC 12W E27 Luz Blanca",
      description: "Foco LED de alta eficiencia para iluminación interior.",
      price: 8.5,
      discount: 5,
      image: "https://via.placeholder.com/300x300?text=LumC+LED",
      categories: ["interior", "led"],
      brand: "LumC",
      rating: 4.3,
      stock: 200,
      destacado: true,
      empresaId: "IKONIX",
      specs: {
        potencia: "12W",
        socket: "E27",
        lumen: "1200lm",
        colorTemp: "6500K (Blanco frío)",
        vidaUtil: "25000 horas",
      },
    },
    {
      id: idCounter++,
      name: "Reflector LED LumC 50W Exterior",
      description: "Reflector LED para exteriores de alta resistencia.",
      price: 39.99,
      discount: 0,
      image: "https://via.placeholder.com/300x300?text=LumC+Reflector",
      categories: ["exterior", "led"],
      brand: "LumC",
      rating: 4.6,
      stock: 45,
      destacado: false,
      empresaId: "IKONIX",
      specs: {
        potencia: "50W",
        lumen: "5000lm",
        colorTemp: "6000K (Blanco frío)",
        ip: "IP65 (Resistente al agua)",
        angulo: "120°",
      },
    },
  ];

  return productosPorEmpresa;
}

// Generar los productos por empresa
export const productosPorEmpresa = generarProductosPorEmpresa();

// Exportar una versión plana de todos los productos para compatibilidad
export const products = [].concat(...Object.values(productosPorEmpresa));

// Extraer todas las marcas disponibles
export const brands = [
  { id: 1, name: "Fortune" },
  { id: 2, name: "Roadcruza" },
  { id: 3, name: "Maxxis" },
  { id: 4, name: "CST" },
  { id: 5, name: "Shell" },
  { id: 6, name: "Hahua" },
  { id: 7, name: "PowerMax" },
  { id: 8, name: "RimTech" },
  { id: 9, name: "Cost" },
  { id: 10, name: "Uyustools" },
  { id: 11, name: "LumC" },
];
