import api from "../../constants/api";

export const spancop_get_data_dropdowns = async () => {
  try {
    const response = await api.get("/b2b/catalogos");
    return {
      success: true,
      message: "Registros SPANCOP dropdowns obtenidos exitosamente",
      data: response.data,
    };
  } catch (error) {
    // Extraer mensaje si existe en la respuesta
    const message =
      error.response?.data?.message || "Ocurrió un error al obtener los datos";
    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};
export const spancop_get_data_spancop = async () => {
  try {
    const response = await api.get("/b2b/datosSpancop");
    return {
      success: true,
      message: "Registros SPANCOP obtenidos exitosamente",
      data: response.data,
    };
  } catch (error) {
    // Extraer mensaje si existe en la respuesta
    const message =
      error.response?.data?.message || "Ocurrió un error al obtener los datos";
    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};
export const spancop_insert_data_spancop = async (dataToInsert) => {
  try {
    const response = await api.post("/b2b/createDatosSpanCop", dataToInsert);
    return {
      success: true,
      message: "Registro SPANCOP insertado exitosamente",
      data: response.data,
    };
  } catch (error) {
    // Extraer mensaje si existe en la respuesta
    const message =
      error.response?.data?.message || "Ocurrió un error al insertar los datos";
    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};
export const spancop_update_data_spancop = async (dataToInsert) => {
  try {
    const response = await api.post("/b2b/updateDatosSpanCop", dataToInsert);
    return {
      success: true,
      message: "Registro SPANCOP actualizado exitosamente",
      data: response.data,
    };
  } catch (error) {
    // Extraer mensaje si existe en la respuesta
    const message =
      error.response?.data?.message ||
      "Ocurrió un error al actualizar los datos";
    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};

/* ------------------------------- Observaciones ------------------------------- */

export const spancop_get_data_observaciones = async () => {
  try {
    const response = await api.get("/b2b/observaciones");
    return {
      success: true,
      message: "Registros SPANCOP Observaciones obtenidos exitosamente",
      data: response.data,
    };
  } catch (error) {
    // Extraer mensaje si existe en la respuesta
    const message =
      error.response?.data?.message ||
      "Ocurrió un error al obtener los datos de observaciones";
    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};

export const spancop_get_data_observaciones_by_id = async (id) => {
  try {
    const response = await api.get(`/b2b/observaciones/${id}`);
    return {
      success: true,
      message: "Registros SPANCOP Observaciones por ID obtenidos exitosamente",
      data: response.data,
    };
  } catch (error) {
    // Extraer mensaje si existe en la respuesta
    const message =
      error.response?.data?.message ||
      "Ocurrió un error al obtener los datos de observaciones por ID";
    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};

export const spancop_get_data_observaciones_by_id_spancop = async (id) => {
  try {
    const response = await api.get(`/b2b/observaciones/Spancop/${id}`);
    return {
      success: true,
      message: "Registros SPANCOP Observaciones por ID obtenidos exitosamente",
      data: response.data,
    };
  } catch (error) {
    // Extraer mensaje si existe en la respuesta
    const message =
      error.response?.data?.message ||
      "Ocurrió un error al obtener los datos de observaciones por ID";
    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};

export const spancop_insert_data_observaciones = async (dataToInsert) => {
  try {
    const response = await api.post("/b2b/createObservaciones", dataToInsert);
    return {
      success: true,
      message: "Registro SPANCOP Observaciones insertado exitosamente",
      data: response.data,
    };
  } catch (error) {
    // Extraer mensaje si existe en la respuesta
    const message =
      error.response?.data?.message ||
      "Ocurrió un error al insertar los datos de observaciones";
    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};

export const spancop_update_data_observaciones = async (dataToInsert) => {
  try {
    const response = await api.post("/b2b/updateObservaciones", dataToInsert);
    return {
      success: true,
      message: "Registro SPANCOP Observaciones actualizado exitosamente",
      data: response.data,
    };
  } catch (error) {
    // Extraer mensaje si existe en la respuesta
    const message =
      error.response?.data?.message ||
      "Ocurrió un error al actualizar los datos de observaciones";
    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};
