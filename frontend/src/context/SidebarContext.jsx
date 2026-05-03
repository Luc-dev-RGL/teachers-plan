import { createContext, useContext, useState } from 'react';

const SidebarContext = createContext(null);

export function SidebarProvider({ children }) {
  const [ouvert, setOuvert] = useState(true);
  const [mobileOuvert, setMobileOuvert] = useState(false);

  const basculer = () => setOuvert((prev) => !prev);
  const fermerMobile = () => setMobileOuvert(false);
  const ouvrirMobile = () => setMobileOuvert(true);

  return (
    <SidebarContext.Provider value={{ ouvert, basculer, mobileOuvert, ouvrirMobile, fermerMobile }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function utiliserSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('utiliserSidebar doit être utilisé dans un SidebarProvider');
  }
  return context;
}

export default SidebarContext;