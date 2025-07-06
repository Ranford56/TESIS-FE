import {useMsal} from "@azure/msal-react";
import {
    LayoutDashboard,
    LogOut
} from "lucide-react";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {ModeToggle} from "@/myComponents/ModeToggle";
import imgUrl from '/atsLogo.png'
import {Button} from "@/components/ui/button.tsx";


function Sidebar() {
    const { instance, accounts } = useMsal();
    return (
        <aside className="hidden w-64 flex-col border-r bg-muted/40 md:flex">
            <div className="flex h-full flex-col">
                <div className="flex-grow p-4">
                    <div className="mb-8 flex items-center gap-2 flex-col">
                        <img className="h-15" src={imgUrl} alt=""/>
                        <h1 className="text-xl font-bold">ATS Assist</h1>
                    </div>
                    <nav className="flex flex-col gap-2">
                        <Button variant="secondary" className="justify-start gap-2">
                            <LayoutDashboard className="h-4 w-4"/>
                            Dashboard
                        </Button>
                        {/* <Button variant="secondary" className="justify-start gap-2">
                            <FilePlus2 className="h-4 w-4"/>
                            Casos de Siniestros
                        </Button>
                        <Button variant="ghost" className="justify-start gap-2">
                            <Settings className="h-4 w-4"/>
                            Configuración
                        </Button> */}
                    </nav>
                </div>

                <div className="mt-auto border-t p-4">
                    <div className="mb-4">
                        <p className="text-xs font-semibold text-muted-foreground mb-2">Tema</p>
                        <ModeToggle/>
                    </div>
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src="" alt="User Avatar"/>
                            <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col gap-1 min-w-0"> {/* Added min-w-0 to enable truncation in flex children */}
                            <p className="text-sm font-medium leading-none truncate" title={accounts[0].name}>
                                {accounts[0].name}
                            </p>
                            <p className="text-xs leading-none text-muted-foreground truncate" title={accounts[0].username}>
                                {accounts[0].username}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-2 text-red-500 hover:text-red-700 hover:bg-red-100 mt-4"
                        onClick={() => {
                            instance.logoutRedirect({postLogoutRedirectUri: "/"}).then( r => console.log(r))
                        }}
                    >
                        <LogOut className="h-4 w-4"/>
                        Cerrar Sesión
                    </Button>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;