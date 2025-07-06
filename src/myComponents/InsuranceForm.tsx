import { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  getInsuranceCompanies,
  getVehicleBrands,
  createInsuranceCase,
  uploadBlob,
} from "@/services/api";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import type { Contratantes, CreateCaso, MarcaVehiculo } from "@/services/types";
import { dateToDateFormat } from "@/services/helpers";
import { es } from "date-fns/locale";
import {LogOut} from "lucide-react";
import {useMsal} from "@azure/msal-react";

// Types
interface ClientData {
  identificationType: string;
  identificationNumber: string;
  contractorName: string;
  insuredName: string;
  policyNumber: string;
  insurerId: string;
  residence: string;
}

interface VehicleData {
  plate: string;
  brandId: string;
  year: string;
}

interface IncidentData {
  date: Date | null;
  details: string;
  visibleDamage: string;
  alreadyReported: boolean;
}

interface DocumentFiles {
  idFile: File | null;
  registrationFile: File | null;
  licenseFile: File | null;
}

interface FormData {
  client: ClientData;
  vehicle: VehicleData;
  incident: IncidentData;
  documents: DocumentFiles;
}

// Form validation schema
const validationSchema = Yup.object().shape({
  client: Yup.object().shape({
    identificationType: Yup.string().required("Requerido"),
    identificationNumber: Yup.string()
        .min(9, "Mínimo 9 caracteres")
        .required("Requerido")
        .test('todoNumero', 'Todos los valores deben ser numericos', function (item) { return !isNaN(Number(item)); }  ),
    contractorName: Yup.string()
        .min(3, "Mínimo 3 caracteres")
        .required("Requerido"),
    insuredName: Yup.string()
        .min(3, "Mínimo 3 caracteres")
        .required("Requerido"),
    policyNumber: Yup.string()
        .min(3, "Mínimo 3 caracteres"),
    insurerId: Yup.string().required("Requerido"), // Changed to string to match select value
    residence: Yup.string()
        .min(3, "Mínimo 3 caracteres")
        .required("Requerido"),
  }),
  vehicle: Yup.object().shape({
    plate: Yup.string().min(6, "Mínimo 6 caracteres").required("Requerido"),
    brandId: Yup.string().required("Requerido"), // Changed to string to match select value
    year: Yup.string()
        .matches(/^\d{4}$/, "Año inválido")
        .required("Requerido"),
  }),
  incident: Yup.object().shape({
    date: Yup.date().required("Requerido").nullable(),
    details: Yup.string()
        .min(10, "Mínimo 10 caracteres")
        .required("Requerido"),
    visibleDamage: Yup.string()
        .min(5, "Mínimo 5 caracteres")
        .required("Requerido"),
    alreadyReported: Yup.boolean(),
  }),
  documents: Yup.object().shape({
    idFile: Yup.mixed().required("Requerido"),
    registrationFile: Yup.mixed().required("Requerido"),
    licenseFile: Yup.mixed().required("Requerido"),
  }),
});

export function InsuranceForm({onSubmissionSuccess}: { onSubmissionSuccess: () => void }) {
  const [step, setStep] = useState(1);
  const [insuranceCompanies, setInsuranceCompanies] = useState<Contratantes[]>(
      []
  );
  const [vehicleBrands, setVehicleBrands] = useState<MarcaVehiculo[]>([]);
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch data for selects
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companies, brands] = await Promise.all([
          getInsuranceCompanies(),
          getVehicleBrands(),
        ]);
        setInsuranceCompanies(companies);
        setVehicleBrands(brands);
      } catch (error) {
        console.error(
            "Error desconocido consiguiendo la informacion de los select: ",
            error
        );
        toast.error("No se pudieron cargar los datos iniciales");
      }
    };

    fetchData();
  }, []);

  const initialValues: FormData = {
    client: {
      identificationType: "Cedula",
      identificationNumber: "",
      contractorName: "",
      insuredName: "",
      policyNumber: "",
      insurerId: "",
      residence: "",
    },
    vehicle: {
      plate: "",
      brandId: "",
      year: "",
    },
    incident: {
      date: null,
      details: "",
      visibleDamage: "",
      alreadyReported: false,
    },
    documents: {
      idFile: null,
      registrationFile: null,
      licenseFile: null,
    },
  };

  const handleSubmit = async (values: FormData) => {
    setIsSubmitting(true);
    try {
      // Ensure date is not null before formatting
      if (!values.incident.date) {
        toast.error("La fecha del incidente es requerida.");
        setIsSubmitting(false);
        return;
      }

      const uploadFilesData = [];

      // Append documents
      if (values.documents.idFile) {
        const file = values.documents.idFile;
        const data = {
          blob_name: "id_" + file.name,
          file: file,
        };
        uploadFilesData.unshift(data);
      }
      if (values.documents.registrationFile) {
        const file = values.documents.registrationFile;
        const data = {
          blob_name: "reg_" + file.name,
          file: file,
        };
        uploadFilesData.unshift(data);
      }
      if (values.documents.licenseFile) {
        const file = values.documents.licenseFile;
        const data = {
          blob_name: "lic_" + file.name,
          file: file,
        };
        uploadFilesData.unshift(data);
      }

      const data: CreateCaso = {
        fecha_incidente: dateToDateFormat(values.incident.date),
        detalles_incidente: values.incident.details,
        danos_visibles: values.incident.visibleDamage,
        ya_reportado: values.incident.alreadyReported,
        numero_poliza: values.client.policyNumber,
        aseguradora: values.client.contractorName,
        contratantes: [
          {
            nombre_contratante: values.client.contractorName,
            numero_identificacion: values.client.identificationNumber,
            residencia: values.client.residence,
            tipo_identificacion: values.client.identificationType,
          },
        ],
        vehiculos: [
          {
            anio: values.vehicle.year,
            marca: values.vehicle.brandId,
            modelo: values.vehicle.brandId,
            placa: values.vehicle.plate,
          },
        ],
        asegurados: [
          {
            nombre_asegurado: values.client.insuredName, // Using insuredName here
            numero_identificacion: values.client.identificationNumber,
            residencia: values.client.residence,
            tipo_identificacion: values.client.identificationType,
          },
        ],
      };

      const createInsuranceResponse = await createInsuranceCase(data);

      uploadFilesData.map((fileData) => {
        fileData.blob_name =
            createInsuranceResponse.id + "_" + fileData.blob_name;
        uploadBlob(fileData);
      });

      toast.success("El caso de seguro ha sido creado correctamente");
      onSubmissionSuccess();
      setStep(5); // Show success step
    } catch (error) {
      console.error(error);
      toast.error("Hubo un problema al crear el caso");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const { instance } = useMsal();

  return (
      <div className="flex h-screen w-full bg-background">
        {/* <Sidebar/> */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto p-4 md:p-6">
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
              {({values, setFieldValue, validateForm, setTouched, resetForm}) => {
                // This function validates the current step before proceeding
                const validateAndGoNext = async () => {
                  // Mark all fields in the current step as touched to trigger validation errors
                  if (step === 1) {
                    await setTouched({
                      client: {
                        identificationType: true,
                        identificationNumber: true,
                        contractorName: true,
                        insuredName: true,
                        policyNumber: true,
                        insurerId: true,
                        residence: true,
                      },
                    });
                  } else if (step === 2) {
                    await setTouched({
                      vehicle: {
                        plate: true,
                        brandId: true,
                        year: true,
                      },
                    });
                  } else if (step === 3) {
                    await setTouched({
                      incident: {
                        date: true,
                        details: true,
                        visibleDamage: true,
                      },
                    });
                  }

                  // Run validation
                  const errors = await validateForm();

                  // Check if there are errors in the current step's data
                  let hasErrors = false;
                  if (step === 1 && errors.client) {
                    hasErrors = true;
                  } else if (step === 2 && errors.vehicle) {
                    hasErrors = true;
                  } else if (step === 3 && errors.incident) {
                    hasErrors = true;
                  }

                  // If no errors, proceed to the next step
                  if (!hasErrors) {
                    nextStep();
                  }
                };

                return (
                    <Form className="space-y-6">
                      {/* Step indicator */}
                      <div className="flex justify-between items-center mb-6">
                        {[1, 2, 3, 4].map((stepNumber) => (
                            <div
                                key={stepNumber}
                                className={`flex flex-col items-center ${
                                    stepNumber < step
                                        ? "text-primary"
                                        : stepNumber === step
                                            ? "font-bold"
                                            : "text-muted-foreground"
                                }`}
                            >
                              <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                      stepNumber <= step
                                          ? "bg-primary text-white"
                                          : "bg-muted"
                                  }`}
                              >
                                {stepNumber}
                              </div>
                              <span className="text-xs mt-1">
                      {
                        ["Cliente", "Vehículo", "Siniestro", "Documentos"][
                        stepNumber - 1
                            ]
                      }
                    </span>
                            </div>
                        ))}
                      </div>

                      {/* Step 1: Client Information */}
                      {step === 1 && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-xl">
                                Información del Cliente
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label
                                    htmlFor="client.identificationType"
                                    className="block text-sm font-medium"
                                >
                                  Tipo de Identificación
                                </label>
                                <Field
                                    as="select"
                                    name="client.identificationType"
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                  <option value="Cedula">Cédula</option>
                                  <option value="RUC">RUC</option>
                                  <option value="Pasaporte">Pasaporte</option>
                                </Field>
                                <ErrorMessage
                                    name="client.identificationType"
                                    component="div"
                                    className="text-sm text-destructive"
                                />
                              </div>

                              <div className="space-y-2">
                                <label
                                    htmlFor="client.identificationNumber"
                                    className="block text-sm font-medium"
                                >
                                  Número de Identificación
                                </label>
                                <Field
                                    as={Input}
                                    name="client.identificationNumber"
                                    placeholder="Ej: 1234567890"
                                />
                                <ErrorMessage
                                    name="client.identificationNumber"
                                    component="div"
                                    className="text-sm text-destructive"
                                />
                              </div>

                              <div className="space-y-2">
                                <label
                                    htmlFor="client.contractorName"
                                    className="block text-sm font-medium"
                                >
                                  Nombre del Contratante
                                </label>
                                <Field
                                    as={Input}
                                    name="client.contractorName"
                                    placeholder="Ej: Juan Pérez"
                                />
                                <ErrorMessage
                                    name="client.contractorName"
                                    component="div"
                                    className="text-sm text-destructive"
                                />
                              </div>

                                <div className="space-y-2">
                                <label
                                    htmlFor="client.insuredName"
                                    className="block text-sm font-medium"
                                >
                                  Nombre del Asegurado
                                </label>
                                  <div className="flex w-full max-w-sm items-center gap-2">
                                  <Field
                                    as={Input}
                                    name="client.insuredName"
                                    placeholder="Ej: Juan Perez"
                                    className="pr-8" // Space for the button
                                />
                                {/*<Button
                                    type="button"
                                    variant={values.client.insuredName == values.client.contractorName && values.client.insuredName !== "" && values.client.contractorName !== "" ? "secondary" : "outline"}
                                    onClick={()=>{
                                      setFieldValue("client.insuredName", values.client.contractorName)
                                    }}
                                >
                                  <UserCheck/>
                                </Button>*/}
                                  </div>

                                <ErrorMessage
                                    name="client.insuredName"
                                    component="div"
                                    className="text-sm text-destructive"
                                />
                              </div>

                              <div className="space-y-2">
                                <label
                                    htmlFor="client.policyNumber"
                                    className="block text-sm font-medium"
                                >
                                  Número de Póliza
                                </label>
                                <Field
                                    as={Input}
                                    name="client.policyNumber"
                                    placeholder="Ej: POL123456"
                                />
                                <ErrorMessage
                                    name="client.policyNumber"
                                    component="div"
                                    className="text-sm text-destructive"
                                />
                              </div>

                              <div className="space-y-2">
                                <label
                                    htmlFor="client.insurerId"
                                    className="block text-sm font-medium"
                                >
                                  Aseguradora
                                </label>
                                <Select
                                    onValueChange={(value) =>
                                        setFieldValue("client.insurerId", value)
                                    }
                                    value={values.client.insurerId}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccione una aseguradora"/>
                                  </SelectTrigger>
                                  <SelectContent>
                                    {insuranceCompanies.map((company) => (
                                        <SelectItem
                                            key={company.id}
                                            value={company.id.toString()}
                                        >
                                          {company.nombre_contratante}
                                        </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <ErrorMessage
                                    name="client.insurerId"
                                    component="div"
                                    className="text-sm text-destructive"
                                />
                              </div>

                              <div className="md:col-span-2 space-y-2">
                                <label
                                    htmlFor="client.residence"
                                    className="block text-sm font-medium"
                                >
                                  Residencia
                                </label>
                                <Field
                                    as={Input}
                                    name="client.residence"
                                    placeholder="Ej: Guayaquil, Ecuador"
                                />
                                <ErrorMessage
                                    name="client.residence"
                                    component="div"
                                    className="text-sm text-destructive"
                                />
                              </div>
                            </CardContent>
                            <CardFooter className="flex justify-end">
                              <Button type="button" onClick={validateAndGoNext}>
                                Siguiente
                              </Button>
                            </CardFooter>
                          </Card>
                      )}

                      {/* Step 2: Vehicle Information */}
                      {step === 2 && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-xl">
                                Información del Vehículo
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label
                                    htmlFor="vehicle.plate"
                                    className="block text-sm font-medium"
                                >
                                  Placa
                                </label>
                                <Field
                                    as={Input}
                                    name="vehicle.plate"
                                    placeholder="Ej: ABC1234"
                                />
                                <ErrorMessage
                                    name="vehicle.plate"
                                    component="div"
                                    className="text-sm text-destructive"
                                />
                              </div>

                              <div className="space-y-2">
                                <label
                                    htmlFor="vehicle.brandId"
                                    className="block text-sm font-medium"
                                >
                                  Marca
                                </label>
                            {isOtherSelected ? (
                              <Input
                                placeholder="Especifique la marca"
                                value={values.vehicle.brandId}
                                onChange={(e) => setFieldValue("vehicle.brandId", e.target.value)}
                                onBlur={() => {
                                  if (!values.vehicle.brandId) {
                                    setIsOtherSelected(false);
                                  }
                                }}
                              />
                            ) : (
                              <Select
                                onValueChange={(value) => {
                                  if (value === "others") {
                                    setIsOtherSelected(true);
                                    setFieldValue("vehicle.brandId", "");
                                  } else {
                                    setFieldValue("vehicle.brandId", value);
                                  }
                                }}
                                value={values.vehicle.brandId}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccione una marca" />
                                </SelectTrigger>
                                <SelectContent>
                                  {vehicleBrands.map((brand) => (
                                    <SelectItem key={brand.id} value={brand.id.toString()}>
                                      {brand.marca}
                                    </SelectItem>
                                  ))}
                                  <SelectItem value="others">Otros</SelectItem>
                                </SelectContent>
                              </Select>
                            )} 
                                <ErrorMessage
                                    name="vehicle.brandId"
                                    component="div"
                                    className="text-sm text-destructive"
                                />
                              </div>

                              <div className="space-y-2">
                                <label
                                    htmlFor="vehicle.year"
                                    className="block text-sm font-medium"
                                >
                                  Año
                                </label>
                                <Field
                                    as={Input}
                                    name="vehicle.year"
                                    placeholder="Ej: 2020"
                                />
                                <ErrorMessage
                                    name="vehicle.year"
                                    component="div"
                                    className="text-sm text-destructive"
                                />
                              </div>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                              <Button type="button" variant="outline" onClick={prevStep}>
                                Anterior
                              </Button>
                              <Button type="button" onClick={validateAndGoNext}>
                                Siguiente
                              </Button>
                            </CardFooter>
                          </Card>
                      )}

                      {/* Step 3: Incident Information */}
                      {step === 3 && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-xl">
                                Información del Siniestro
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="space-y-2">
                                <label
                                    htmlFor="incident.date"
                                    className="block text-sm font-medium"
                                >
                                  Fecha del Siniestro
                                </label>
                                <Popover>
                                  <PopoverTrigger>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !values.incident.date && "text-muted-foreground"
                                        )}
                                    >
                                      {values.incident.date ? (
                                          format(values.incident.date, "PPP", { locale: es })
                                      ) : (
                                          <span>Seleccione una fecha</span>
                                      )}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        //@ts-expect-error parse de fecha
                                        selected={values.incident.date}
                                        onSelect={(date) =>
                                            setFieldValue("incident.date", date)
                                        }
                                        initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                <ErrorMessage
                                    name="incident.date"
                                    component="div"
                                    className="text-sm text-destructive"
                                />
                              </div>

                              <div className="space-y-2">
                                <label
                                    htmlFor="incident.details"
                                    className="block text-sm font-medium"
                                >
                                  Detalles del Siniestro
                                </label>
                                <Field
                                    as={Textarea}
                                    name="incident.details"
                                    placeholder="Describa lo ocurrido..."
                                    className="min-h-[120px]"
                                />
                                <ErrorMessage
                                    name="incident.details"
                                    component="div"
                                    className="text-sm text-destructive"
                                />
                              </div>

                              <div className="space-y-2">
                                <label
                                    htmlFor="incident.visibleDamage"
                                    className="block text-sm font-medium"
                                >
                                  Daños Visibles
                                </label>
                                <Field
                                    as={Textarea}
                                    name="incident.visibleDamage"
                                    placeholder="Describa los daños..."
                                    className="min-h-[120px]"
                                />
                                <ErrorMessage
                                    name="incident.visibleDamage"
                                    component="div"
                                    className="text-sm text-destructive"
                                />
                              </div>

                              <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="alreadyReported"
                                    checked={values.incident.alreadyReported}
                                    onCheckedChange={(checked) =>
                                        setFieldValue("incident.alreadyReported", checked)
                                    }
                                />
                                <label
                                    htmlFor="alreadyReported"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  Reportado a la compañìa de seguros
                                </label>
                              </div>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                              <Button type="button" variant="outline" onClick={prevStep}>
                                Anterior
                              </Button>
                              <Button type="button" onClick={validateAndGoNext}>
                                Siguiente
                              </Button>
                            </CardFooter>
                          </Card>
                      )}

                      {/* Step 4: Documents */}
                      {step === 4 && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-xl">
                                Documentos Adjuntos
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="space-y-2">
                                <label
                                    htmlFor="documents.idFile"
                                    className="block text-sm font-medium"
                                >
                                  Cédula de Identidad
                                </label>
                                <Input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) =>
                                        setFieldValue(
                                            "documents.idFile",
                                            e.currentTarget.files && e.currentTarget.files[0]
                                                ? e.currentTarget.files[0]
                                                : null
                                        )
                                    }
                                />
                                <ErrorMessage
                                    name="documents.idFile"
                                    component="div"
                                    className="text-sm text-destructive"
                                />
                              </div>

                              <div className="space-y-2">
                                <label
                                    htmlFor="documents.registrationFile"
                                    className="block text-sm font-medium"
                                >
                                  Matrícula del Vehículo
                                </label>
                                <Input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) =>
                                        setFieldValue(
                                            "documents.registrationFile",
                                            e.currentTarget.files && e.currentTarget.files[0]
                                                ? e.currentTarget.files[0]
                                                : null
                                        )
                                    }
                                />
                                <ErrorMessage
                                    name="documents.registrationFile"
                                    component="div"
                                    className="text-sm text-destructive"
                                />
                              </div>

                              <div className="space-y-2">
                                <label
                                    htmlFor="documents.licenseFile"
                                    className="block text-sm font-medium"
                                >
                                  Licencia de Conducir
                                </label>
                                <Input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) =>
                                        setFieldValue(
                                            "documents.licenseFile",
                                            e.currentTarget.files && e.currentTarget.files[0]
                                                ? e.currentTarget.files[0]
                                                : null
                                        )
                                    }
                                />
                                <ErrorMessage
                                    name="documents.licenseFile"
                                    component="div"
                                    className="text-sm text-destructive"
                                />
                              </div>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                              <Button type="button" variant="outline" onClick={prevStep}>
                                Anterior
                              </Button>
                              <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Enviando..." : "Enviar Solicitud"}
                              </Button>
                            </CardFooter>
                          </Card>
                      )}

                      {/* Step 5: Success */}
                      {step === 5 && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-xl text-center">
                                Solicitud Completada
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="text-center py-8">
                              <div
                                  className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                                <svg
                                    className="h-6 w-6 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                  <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </div>
                              <h3 className="mt-3 text-lg font-medium">
                                ¡Siniestro registrado exitosamente!
                              </h3>
                              <p className="mt-2 text-sm text-muted-foreground">
                                Hemos recibido tu solicitud. Nos pondremos en contacto
                                contigo pronto.
                              </p>
                            </CardContent>
                            <CardFooter className="flex justify-center gap-2">
                              <Button
                                  type="button"
                                  onClick={() => {
                                    resetForm()
                                    setStep(1);
                                  }}
                              >
                                Crear Nuevo Caso
                              </Button>
                              <Button
                                  variant="ghost"
                                  className="gap-2 text-red-500 hover:text-red-700 hover:bg-red-100 "
                                  onClick={() => {
                                    instance.logoutRedirect({postLogoutRedirectUri: "/"}).then( r => console.log(r))
                                  }}
                              >
                                <LogOut className="h-4 w-4"/>
                                Cerrar Sesión
                              </Button>
                            </CardFooter>
                          </Card>
                      )}
                    </Form>
                );
              }}
            </Formik>
          </div>
        </main>
      </div>
  );
}
