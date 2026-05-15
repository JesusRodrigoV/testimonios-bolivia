export interface SidenavItem {
  routerLink: string;
  icon: string;
  text: string;
  exact?: boolean;
  tooltip: string;
  requiredAuth?: boolean;
  requiredRole?: number[];
  dividerBefore?: boolean;
}
