import { useEffect, useState } from "react";
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { Client } from '@microsoft/microsoft-graph-client';
import InsurancePageWrapper from "@/myComponents/DashboardWrapper";
import { InsuranceForm } from "@/myComponents/InsuranceForm";

async function getUserType(accessToken: string, userId: string) {
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

export function MainContent() {
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
        ? <InsurancePageWrapper />
        : <InsuranceForm onSubmissionSuccess={() => { }} />
}