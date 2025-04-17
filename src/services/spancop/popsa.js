import api from "../../constants/api";

export const popsa_get_data_popsa = async () => {
  try {
    const response = await api.get("/b2b/datosPopsa");
    return {
      success: true,
      message: "Registros popsa obtenidos exitosamente",
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
export const popsa_get_data_popsa_by_id_spancop = async (id) => {
  try {
    const response = await api.get(`/b2b/datosPopsa/Spancop/${id}`);
    return {
      success: true,
      message: "Registros popsa obtenidos exitosamente",
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

export const popsa_insert_data_popsa = async (dataToInsert) => {
  try {
    const response = await api.post("/b2b/createDatosPopsa", dataToInsert);
    return {
      success: true,
      message: "Registro popsa insertado exitosamente",
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
export const popsa_update_data_popsa = async (dataToInsert) => {
  try {
    const response = await api.post("/b2b/updateDatosPopsa", dataToInsert);
    return {
      success: true,
      message: "Registro popsa actualizado exitosamente",
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
