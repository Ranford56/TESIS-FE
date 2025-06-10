import {useEffect, useState} from "react";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import {
    LayoutDashboard,
    FilePlus2,
    Settings,
    ArrowLeft,
} from "lucide-react";
import {InsuranceForm} from "@/components/InsuranceForm.tsx";
import {getAllInsuranceCases} from "@/services/api.ts";
import type {Caso} from "@/services/types.ts";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {ModeToggle} from "@/components/ModeToggle.tsx";

function Sidebar() {
    return (
        <aside className="hidden w-64 flex-col border-r bg-muted/40 md:flex">
            {/* Use flex-col and h-full to enable pushing content to the bottom */}
            <div className="flex h-full flex-col">

                {/* Top Section: Logo and Navigation (grows to fill available space) */}
                <div className="flex-grow p-4">
                    <div className="mb-8 flex items-center gap-2">
                        <FilePlus2 className="h-6 w-6"/>
                        <h1 className="text-xl font-bold">ATS Assist</h1>
                    </div>
                    <nav className="flex flex-col gap-2">
                        <Button variant="ghost" className="justify-start gap-2">
                            <LayoutDashboard className="h-4 w-4"/>
                            Dashboard
                        </Button>
                        <Button variant="secondary" className="justify-start gap-2">
                            <FilePlus2 className="h-4 w-4"/>
                            Casos de Siniestros
                        </Button>
                        <Button variant="ghost" className="justify-start gap-2">
                            <Settings className="h-4 w-4"/>
                            Configuración
                        </Button>
                    </nav>
                </div>

                {/* Bottom Section: User Info and Theme Toggle */}
                <div className="mt-auto border-t p-4">
                    <div className="mb-4">
                        <p className="text-xs font-semibold text-muted-foreground mb-2">Tema</p>
                        <ModeToggle/>
                    </div>
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                            {/* Add user's avatar image URL here */}
                            <AvatarImage src="https://instagram.fgye4-1.fna.fbcdn.net/v/t51.2885-19/472248571_1135244071651124_7092175178623355615_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=instagram.fgye4-1.fna.fbcdn.net&_nc_cat=108&_nc_oc=Q6cZ2QGi2bFqmlPCppzenQjdIX5ZM4UgJo7FpSdnJObgyzoKmDtDV14XSTba1OwlBk5YdnM&_nc_ohc=yyqwa9Cg-AgQ7kNvwEYuFpO&_nc_gid=SIzorMcK-Bn4Hh3KNzWiqA&edm=ALGbJPMBAAAA&ccb=7-5&oh=00_AfMV2TUATG7VAHoJnnkh8nywWFdanA-z1vQoCikhItFfiw&oe=684E61EF&_nc_sid=7d3ac5" alt="User Avatar"/>
                            <AvatarFallback>LM</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col gap-1">
                            <p className="text-sm font-medium leading-none">Lorem Ipsum</p>
                            <p className="text-xs leading-none text-muted-foreground">
                                lorem@ipsum.dev
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}

function CasesDataTable({ onAddNewCase, rowData }: { onAddNewCase: () => void; rowData: Caso[] }) {
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
                        <FilePlus2 className="h-4 w-4" />
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
            <Sidebar />
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
                            <ArrowLeft className="h-4 w-4" />
                            Volver a la tabla
                        </Button>
                        {/* Pass the `handleShowTable` function to your form.
              Your form should call this function upon successful submission
              to return to the table view.
            */}
                        <InsuranceForm onSubmissionSuccess={handleShowTable} />
                    </div>
                )}
            </main>
        </div>
    );
}