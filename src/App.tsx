import { useEffect, useState } from "react";
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider, AuthenticatedTemplate, UnauthenticatedTemplate, useMsal, useIsAuthenticated } from '@azure/msal-react';
import { Client } from '@microsoft/microsoft-graph-client';
import InsurancePageWrapper from "@/components/DashboardWrapper.tsx";
import {InsuranceForm} from "@/components/InsuranceForm.tsx";
import { ThemeProvider } from "@/components/ThemeProvider.tsx";

const msalConfig = {
    auth: {
        clientId: '4b722c87-9c66-4d80-9b68-6e280b4fdb8b',
        authority: 'https://login.microsoftonline.com/d4c10805-e112-4e84-afe6-012f03b68a84',
        redirectUri: window.location.origin,
    },
    cache: {
        cacheLocation: 'sessionStorage',
        storeAuthStateInCookie: false,
    },
};

const msalInstance = new PublicClientApplication(msalConfig);

async function getUserType(accessToken:string, userId:string) {
    const client = Client.init({
        authProvider: (done) => done(null, accessToken),
    });

    try {
        const user = await client
            .api(`/users/${userId}`)
            .select("userType")
            .get();

        return user.userType;
    } catch (error) {
        console.error("Error fetching user type:", error);
        return "Member";
    }
}

function MainContent() {
    const { instance, accounts } = useMsal();
    const isAuthenticated = useIsAuthenticated();
    const [userType, setUserType] = useState<string | null>(null);

    useEffect(() => {
        if (isAuthenticated && accounts.length > 0) {
            const account = accounts[0];
            const accessTokenRequest = {
                scopes: ["User.Read"],
                account: account,
            };

            instance.acquireTokenSilent(accessTokenRequest)
                .then((response) => {
                    return getUserType(response.accessToken, account.localAccountId);
                })
                .then((type) => {
                    setUserType(type);
                })
                .catch((error) => {
                    console.error(error)
                    setUserType("Member"); // Fallback
                });
        }
    }, [isAuthenticated, accounts, instance]);


    if (!isAuthenticated || accounts.length === 0) {
        return <p>Por favor, inicia sesión.</p>;
    }

    if (userType === null) {
        return <p>Cargando información del usuario...</p>;
    }

    const isAdmin = userType === "Member";

    return isAdmin
        ? <InsurancePageWrapper/>
        : <InsuranceForm onSubmissionSuccess={()=>{}}/>
}

function App() {
    const handleLogin = (instance:PublicClientApplication) => {
        instance.loginPopup({
            scopes: ["User.Read"],
        }).catch(e => {
            console.error("Error during login:", e);
        });
    };

    return (
        <ThemeProvider>
            <MsalProvider instance={msalInstance}>
                <AuthenticatedTemplate>
                    <MainContent />
                </AuthenticatedTemplate>
                <UnauthenticatedTemplate>
                    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white p-4">
                        <div className="w-full max-w-4xl mx-auto text-center">

                            <div className="bg-gray-800 p-10 rounded-xl shadow-2xl">
                                <h1 className="text-4xl font-extrabold mb-4">Bienvenido al Portal de Seguros</h1>
                                <p className="text-gray-400 mb-8 text-lg">Por favor, inicia sesión con tu cuenta de
                                    Microsoft
                                    para
                                    continuar.</p>
                                <button
                                    onClick={() => handleLogin(msalInstance)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition-transform transform hover:scale-105 duration-300"
                                >
                                    Iniciar Sesión con Microsoft 365
                                </button>
                            </div>
                        </div>
                    </div>
                </UnauthenticatedTemplate>
            </MsalProvider>
        </ThemeProvider>
    );
}

export default App;