export interface Contratantes {
    tipo_identificacion:   string;
    numero_identificacion: string;
    nombre_contratante:    string;
    residencia:            string;
    id:                    number;
}

export interface MarcaVehiculo {
    placa:  string;
    marca:  string;
    modelo: string;
    anio:   string;
    id:     number;
}

export interface CreateCaso {
    fecha_incidente:    string;
    detalles_incidente: string;
    danos_visibles:     string;
    ya_reportado:       boolean;
    numero_poliza:      string;
    aseguradora:        string;
    contratantes:       ContratanteBase[];
    asegurados:         AseguradoBase[];
    vehiculos:          VehiculoBase[];
    // documentos:         DocumentoBase[];
}

interface ContratanteBase {
    tipo_identificacion: string;
    numero_identificacion: string;
    nombre_contratante: string;
    residencia: string;
}

interface AseguradoBase {
    tipo_identificacion: string;
    numero_identificacion: string;
    nombre_asegurado: string;
    residencia: string;
}

interface VehiculoBase {
    placa: string;
    marca: string;
    modelo: string;
    anio: string;
}

export interface BlobResponse {
    blob_name: string;
    data: string
}