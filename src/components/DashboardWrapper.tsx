import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {
    FilePlus2,
    ArrowLeft
} from "lucide-react";
import {InsuranceForm} from "@/components/InsuranceForm.tsx";
import {getAllInsuranceCases} from "@/services/api.ts";
import type {Caso} from "@/services/types.ts";
import Sidebar from "@/components/Sidebar.tsx";


function CasesDataTable({onAddNewCase, rowData}: { onAddNewCase: () => void; rowData: Caso[] }) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Casos de Siniestros</CardTitle>
                        <CardDescription>
                            Administra y revisa los casos de siniestros reportados.
                        </CardDescription>
                    </div>
                    <Button onClick={onAddNewCase} className="gap-2">
                        <FilePlus2 className="h-4 w-4"/>
                        Reportar Nuevo Caso
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID del Caso</TableHead>
                            <TableHead>Aseguradora</TableHead>
                            <TableHead>Fecha de Creación</TableHead>
                            <TableHead>Nombre del Asegurado</TableHead>
                            <TableHead>Estado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rowData.map((caseItem) => (
                            <TableRow key={caseItem.id}>
                                <TableCell className="font-medium">{caseItem.id}</TableCell>
                                <TableCell>{caseItem.aseguradora}</TableCell>
                                <TableCell>{caseItem.fecha_incidente.toString()}</TableCell>
                                <TableCell>{caseItem.vehiculos[0] == undefined ? "N/A" : caseItem.vehiculos[0].placa}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            caseItem.ya_reportado
                                                ? "default"
                                                : "secondary"
                                        }
                                    >
                                        {caseItem.ya_reportado ? "Resportado" : "No reportado"}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

export default function InsurancePageWrapper() {
    const [view, setView] = useState<"table" | "form">("table");
    const [cases, setCases] = useState<Caso[]>([]);

    useEffect(() => {
        const handleRefresh = () => {
            getAllInsuranceCases().then((cases) => {
                setCases(cases)
            })
        }

        handleRefresh();
    }, []);

    const handleShowForm = () => setView("form");
    const handleShowTable = () => setView("table");

    return (
        <div className="flex h-screen w-full bg-background">
            <Sidebar/>
            <main className="flex-1 overflow-y-auto p-6">
                {view === "table" ? (
                    <CasesDataTable onAddNewCase={handleShowForm} rowData={cases}/>
                ) : (
                    <div>
                        <Button
                            variant="outline"
                            onClick={handleShowTable}
                            className="mb-4 gap-2"
                        >
                            <ArrowLeft className="h-4 w-4"/>
                            Volver a la tabla
                        </Button>
                        <InsuranceForm onSubmissionSuccess={handleShowTable}/>
                    </div>
                )}
            </main>
        </div>
    );
}