import api from "../../constants/api";

export const callReport_get_data_callReport = async () => {
  try {
    const response = await api.get("/b2b/callReport");
    return {
      success: true,
      message: "Registros callReport obtenidos exitosamente",
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

export const callReport_get_data_callReport_by_id_popsa = async (id) => {
  try {
    const response = await api.get(`/b2b/callReport/Popsa/${id}`);
    return {
      success: true,
      message: "Registros callReport obtenidos exitosamente",
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
export const callReport_insert_data_callReport = async (dataToInsert) => {
  try {
    const response = await api.post("/b2b/createCallReport", dataToInsert);
    return {
      success: true,
      message: "Registro callReport insertado exitosamente",
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
export const callReport_update_data_callReport = async (dataToInsert) => {
  try {
    const response = await api.post("/b2b/updateCallReport", dataToInsert);
    return {
      success: true,
      message: "Registro callReport actualizado exitosamente",
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
