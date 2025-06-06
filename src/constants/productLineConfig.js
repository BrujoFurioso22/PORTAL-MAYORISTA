export const CATEGORY_TYPE_LABELS = {
  categoria: "Categoría",
  segmento: "Segmento",
  aplicacion: "Aplicación",
  tipo: "Tipo",
  linea: "Línea",
  viscosidad: "Viscosidad",
  // Añadir cualquier otro tipo que necesites
};

// También podemos añadir un orden de visualización para cada línea de negocio
export const CATEGORY_TYPE_ORDER = {
  DEFAULT: ["categoria"],
  LLANTAS: ["categoria", "aplicacion", "segmento"],
  LUBRICANTES: ["categoria", "tipo", "viscosidad"],
  LUCES: ["categoria", "tipo"],
  // Añadir otras líneas de negocio según sea necesario
};

export const PRODUCT_LINE_CONFIG = {
  LLANTAS: {
    specs: [
      {
        field: "rin",
        label: "Rin",
        defaultValue: "-",
        transform: (item) => item.DMA_RIN,
      },
      {
        field: "ancho",
        label: "Ancho",
        defaultValue: "-",
        transform: (item) => item.DMA_ANCHO,
      },
      {
        field: "serie",
        label: "Serie",
        defaultValue: "",
        transform: (item) => item.DMA_SERIE,
      },
      {
        field: "medida",
        label: "Medida",
        defaultValue: "N/A",
        transform: (item) => `${item.DMA_ANCHO || ""}R${item.DMA_RIN || ""}`,
      },
      {
        field: "indiceVelocidad",
        label: "Índice de velocidad",
        defaultValue: "-",
        transform: (item) => item.DMA_VELOCIDAD,
      },
      {
        field: "indiceCarga",
        label: "Índice de carga",
        defaultValue: "-",
        transform: (item) => item.DMA_CARGA,
      },
      {
        field: "lonas",
        label: "Lonas",
        defaultValue: "N/D",
        transform: (item) => item.DMA_LONAS,
      },

      {
        field: "eje",
        label: "Posición",
        defaultValue: "N/A",
        transform: (item) => item.DMA_EJE,
      },
      {
        field: "aplicacion",
        label: "Aplicación",
        defaultValue: "N/A",
        transform: (item) => item.DMA_APLICACION,
      },
    ],
    categories: [
      {
        field: "DMA_CATEGORIA",
        transform: (value) => value.toLowerCase().replace(/ /g, "_"),
      },
      {
        field: "DMA_APLICACION",
        transform: (value) => value.toLowerCase().replace(/ /g, "_"),
      },
      {
        field: "DMA_SEGMENTO",
        transform: (value) => value.toLowerCase().replace(/ /g, "_"),
      },
    ],
    nameTemplate: (item) =>
      `${item.DMA_MARCA || ""} ${item.DMA_DISENIO || ""} ${
        item.DMA_ANCHO || ""
      }R${item.DMA_RIN || ""} ${item.DMA_CARGA || ""}`,
    descriptionTemplate: (item) =>
      `${item.DMA_MARCA || ""} ${item.DMA_DISENIO || ""} ${
        item.DMA_APLICACION || ""
      }`,
    categoryLabels: CATEGORY_TYPE_LABELS,
    categoryOrder: CATEGORY_TYPE_ORDER.LLANTAS,
  },

  LUBRICANTES: {
    specs: [
      {
        field: "clasificacion",
        label: "Clasificación",
        defaultValue: "N/D",
        transform: (item) => item.DMA_CLASIFICACION,
      },
      {
        field: "presentacion",
        label: "Presentación",
        defaultValue: "N/D",
        transform: (item) => item.DMA_PRESENTACION,
      },
      {
        field: "aplicacion",
        label: "Aplicación",
        defaultValue: "N/D",
        transform: (item) => item.DMA_APLICACION,
      },
      {
        field: "clase",
        label: "Clase",
        defaultValue: "N/D",
        transform: (item) => item.DMA_CLASE,
      },
      {
        field: "tipo",
        label: "Tipo",
        defaultValue: "N/D",
        transform: (item) => item.DMA_TIPO,
      },
      {
        field: "viscosidadsae",
        label: "Viscosidad SAE",
        defaultValue: "N/D",
        transform: (item) => item.DMA_SAE,
      },
      {
        field: "viscosidadisovg",
        label: "Viscosidad ISOVG",
        defaultValue: "N/D",
        transform: (item) => item.DMA_ISOVG,
      },
      {
        field: "empaque",
        label: "Empaque",
        defaultValue: "N/D",
        transform: (item) => item.DMA_EMPAQUE,
      },
      // {
      //   field: "volumenuom",
      //   label: "Volumen (uom)",
      //   defaultValue: "N/D",
      //   transform: (item) =>
      //     `${item.DMA_UOM || ""} ${item.DMA_VOLUMEN_UOM || ""}`,
      // },
    ],
    categories: [
      {
        field: "DMA_APLICACION",
        transform: (value) => value.toLowerCase().replace(/ /g, "_"),
      },
      {
        field: "DMA_CLASE",
        transform: (value) => value?.toLowerCase().replace(/ /g, "_"),
      },
    ],
    nameTemplate: (item) =>
      item.DMA_NOMBREITEM ??
      `${item.DMA_MARCA || ""} ${item.DMA_VISCOSIDAD || ""} ${
        item.DMA_VOLUMEN || ""
      } ${item.DMA_UNIDADMEDIDA || ""}`,
    descriptionTemplate: (item) =>
      `${item.DMA_MARCA || ""} ${item.DMA_TIPO || ""} ${item.DMA_BASE || ""}`,
    categoryLabels: CATEGORY_TYPE_LABELS,
    categoryOrder: CATEGORY_TYPE_ORDER.LUBRICANTES,
  },

  LUCES: {
    specs: [
      {
        field: "potencia",
        label: "Potencia",
        defaultValue: "N/D",
        transform: (item) => `${item.DMA_POTENCIA || ""} W`,
      },
      {
        field: "voltaje",
        label: "Voltaje",
        defaultValue: "N/D",
        transform: (item) => `${item.DMA_VOLTAJE || ""} V`,
      },
      {
        field: "tipo",
        label: "Tipo",
        defaultValue: "N/D",
        transform: (item) => item.DMA_TIPO,
      },
      {
        field: "modelo",
        label: "Modelo",
        defaultValue: "N/D",
        transform: (item) => item.DMA_MODELO,
      },
    ],
    categories: [
      {
        field: "DMA_CATEGORIA",
        transform: (value) => value.toLowerCase().replace(/ /g, "_"),
      },
      {
        field: "DMA_TIPO",
        transform: (value) => value?.toLowerCase().replace(/ /g, "_"),
      },
    ],
    nameTemplate: (item) =>
      `${item.DMA_MARCA || ""} ${item.DMA_MODELO || ""} ${item.DMA_TIPO || ""}`,
    descriptionTemplate: (item) =>
      `${item.DMA_MARCA || ""} ${item.DMA_TIPO || ""} ${
        item.DMA_POTENCIA || ""
      } W`,
    categoryLabels: CATEGORY_TYPE_LABELS,
    categoryOrder: CATEGORY_TYPE_ORDER.LUCES,
  },

  // Configuración predeterminada para cualquier otra línea de negocio
  DEFAULT: {
    specs: [
      {
        field: "marca",
        label: "Marca",
        defaultValue: "N/D",
        transform: (item) => item.DMA_MARCA,
      },
    ],
    categories: [
      {
        field: "DMA_CATEGORIA",
        transform: (value) => value?.toLowerCase().replace(/ /g, "_"),
      },
    ],
    nameTemplate: (item) => item.DMA_NOMBREITEM || "Producto sin nombre",
    descriptionTemplate: (item) =>
      `${item.DMA_MARCA || ""} ${item.DMA_CODIGOBARRAS || ""}`,
    categoryLabels: CATEGORY_TYPE_LABELS,
    categoryOrder: CATEGORY_TYPE_ORDER.DEFAULT,
  },
};
