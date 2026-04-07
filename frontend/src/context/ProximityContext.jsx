import { createContext, useContext } from "react";

const ProximityContainerContext = createContext(null);

export function ProximityContainerProvider({ children, containerRef }) {
  return (
    <ProximityContainerContext.Provider value={containerRef}>
      {children}
    </ProximityContainerContext.Provider>
  );
}

export function useProximityContainer() {
  return useContext(ProximityContainerContext);
}
