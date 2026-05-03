import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, utiliserAuth } from './context/AuthContext.jsx';
import { SidebarProvider } from './context/SidebarContext.jsx';

import Connexion from "./pages/auth/Connexion.jsx";
import TableauDeBord from "./pages/dashboard/TableauDeBord.jsx";
import Enseignants from "./pages/enseignants/Enseignants.jsx";
import Departements from "./pages/departements/Departements.jsx";
import Filieres from "./pages/Filieres.jsx";
import Niveaux from "./pages/Niveaux.jsx";
import Classes from "./pages/Classes.jsx";
import Salles from "./pages/Salles.jsx";
import Matieres from "./pages/matieres/Matieres.jsx";
import Seances from "./pages/seances/Seances.jsx";
import Heures from "./pages/heures/Heures.jsx";
import EmploiDuTemps from "./pages/emploi-du-temps/EmploiDuTemps.jsx";
import Parametres from "./pages/parametres/Parametres.jsx";
import Exports from "./pages/exports/Exports.jsx";
import MonProfil from "./pages/profil/MonProfil.jsx";
import Layout from "./components/layout/Layout.jsx";

function RoutePrivee({ children }) {
  const { utilisateur, chargement } = utiliserAuth();
  if (chargement) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }
  return utilisateur ? children : <Navigate to="/connexion" />;
}

export default function App() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <Routes>
          <Route path="/connexion" element={<Connexion />} />
          <Route element={<RoutePrivee><Layout /></RoutePrivee>}>
            <Route path="/" element={<TableauDeBord />} />
            <Route path="enseignants" element={<Enseignants />} />
            <Route path="departements" element={<Departements />} />
            <Route path="filieres" element={<Filieres />} />
            <Route path="niveaux" element={<Niveaux />} />
            <Route path="classes" element={<Classes />} />
            <Route path="salles" element={<Salles />} />
            <Route path="matieres" element={<Matieres />} />
            <Route path="seances" element={<Seances />} />
            <Route path="heures" element={<Heures />} />
            <Route path="emploi-du-temps" element={<EmploiDuTemps />} />
            <Route path="parametres" element={<Parametres />} />
            <Route path="exports" element={<Exports />} />
            <Route path="profil" element={<MonProfil />} />
          </Route>
        </Routes>
      </SidebarProvider>
    </AuthProvider>
  );
}