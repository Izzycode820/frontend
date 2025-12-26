import { SidebarRoot } from '../sidebar/SidebarRoot';

export const puckOverrides = {
  // Replace entire left sidebar with our custom implementation
  sidebar: SidebarRoot,

  // Right sidebar will now render fields automatically using our custom field components
  // Custom fields are defined in puck.config.tsx using type: "custom"
};