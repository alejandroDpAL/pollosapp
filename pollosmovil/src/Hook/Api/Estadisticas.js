import api from "./apiConnection";

export const GetReporteLoteId_Usario = async (Id_usario) => {
  try {
    const response = await api.get(`/reporte-lote/reportes/negocio/${Id_usario}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener reporte general del negocio:", error);
    throw error;
  }
};
