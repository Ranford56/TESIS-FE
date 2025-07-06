import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider, AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';
import { ThemeProvider } from "@/myComponents/ThemeProvider";
import { MainContent } from "@/pages/MainContent";

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
                                <h1 className="text-4xl font-extrabold mb-4">Reporta tu siniestro</h1>
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