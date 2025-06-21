export interface Contratantes {
    tipo_identificacion:   string;
    numero_identificacion: string;
    nombre_contratante:    string;
    // residencia:            string;
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

export interface Caso {
    fecha_incidente:    Date;
    detalles_incidente: string;
    danos_visibles:     string;
    ya_reportado:       boolean;
    numero_poliza:      string;
    aseguradora:        string;
    id:                 number;
    contratantes:       Asegurado[];
    asegurados:         Asegurado[];
    vehiculos:          Vehiculo[];
    documentos:         Documento[];
}

export interface Asegurado {
    tipo_identificacion:   string;
    numero_identificacion: string;
    nombre_asegurado?:     string;
    // residencia:            string;
    id:                    number;
    nombre_contratante?:   string;
}

export interface Documento {
    tipo_documento: string;
    ruta_archivo:   string;
    id_caso:        number;
    id:             number;
}

export interface Vehiculo {
    placa:  string;
    marca:  string;
    modelo: string;
    anio:   string;
    id:     number;
}