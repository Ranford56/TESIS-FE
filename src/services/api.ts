import axios from 'axios';
import type {BlobResponse, Caso, Contratantes, CreateCaso, MarcaVehiculo} from './types';

const API_BASE_URL = 'https://pry-tesis-be.azurewebsites.net';

export const createInsuranceCase = async (formData: CreateCaso) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/casos/`, JSON.stringify( formData ), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating insurance case:', error);
    throw error;
  }
};

export const getAllInsuranceCases = async ():Promise<Caso[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/casos/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching insurance case:', error);
    throw error;
  }
}

export const getInsuranceCase = async (caseId: number) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/casos/${caseId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching insurance case:', error);
    throw error;
  }
};

export const getInsuranceCompanies = async (): Promise<Contratantes[]> => {
  try{
    const response = await axios.get(`${API_BASE_URL}/contratantes/`)
    return response.data
  } catch (error) {
    console.error('Error fetching info: ', error)
    throw error
  }
}

export const getVehicleBrands = async (): Promise<MarcaVehiculo[]> => {
  try{
    const response = await axios.get(`${API_BASE_URL}/vehiculos/`)
    return response.data
  } catch (error) {
    console.error('Error fetching info: ', error)
    throw error
  }
}

export const uploadBlob = async (data: {blob_name: string ; file: File}): Promise<BlobResponse> => {
  try{
    const response = await axios.post(`${API_BASE_URL}/blob/upload?blob_name=${data.blob_name}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data
  } catch (error) {
    console.error('Error fetching info: ', error)
    throw error
  }
}
