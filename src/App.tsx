// import { InsuranceForm } from "./components/InsuranceForm";
import InsurancePageWrapper from "@/components/DashboardWrapper.tsx";
import {ThemeProvider} from "@/components/ThemeProvider.tsx";

function App() {
  return (
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <InsurancePageWrapper/>
      </ThemeProvider>
  );
}

export default App;