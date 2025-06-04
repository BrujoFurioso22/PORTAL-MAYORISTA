export const PRODUCT_LINE_CONFIG = {
  LLANTAS: {
    specs: [
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
        field: "rin",
        label: "Rin",
        defaultValue: "-",
        transform: (item) => item.DMA_RIN,
      },
      {
        field: "serie",
        label: "Serie",
        defaultValue: "",
        transform: (item) => item.DMA_SERIE,
      },
      {
        field: "ancho",
        label: "Ancho",
        defaultValue: "-",
        transform: (item) => item.DMA_ANCHO,
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
        field: "DMA_SEGMENTO",
        transform: (value) => value.toLowerCase().replace(/ /g, "_"),
      },
      {
        field: "DMA_APLICACION",
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
  },

  LUBRICANTES: {
    specs: [
      {
        field: "viscosidad",
        label: "Viscosidad",
        defaultValue: "N/D",
        transform: (item) => item.DMA_VISCOSIDAD,
      },
      {
        field: "base",
        label: "Base",
        defaultValue: "N/D",
        transform: (item) => item.DMA_BASE,
      },
      {
        field: "volumen",
        label: "Volumen",
        defaultValue: "N/D",
        transform: (item) =>
          `${item.DMA_VOLUMEN || ""} ${item.DMA_UNIDADMEDIDA || ""}`,
      },
      {
        field: "tipo",
        label: "Tipo",
        defaultValue: "N/D",
        transform: (item) => item.DMA_TIPO,
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
      `${item.DMA_MARCA || ""} ${item.DMA_VISCOSIDAD || ""} ${
        item.DMA_VOLUMEN || ""
      } ${item.DMA_UNIDADMEDIDA || ""}`,
    descriptionTemplate: (item) =>
      `${item.DMA_MARCA || ""} ${item.DMA_TIPO || ""} ${item.DMA_BASE || ""}`,
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
  },
};
