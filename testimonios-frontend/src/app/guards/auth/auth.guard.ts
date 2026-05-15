import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthStore } from "@app/auth.store";

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authStore = inject(AuthStore);
  const requiredRole = route.data["requiredRole"] as number[];

  if (route.routeConfig?.path === "2fa-verify" && authStore.tempToken()) {
    return true;
  }

  if (!authStore.isAuthenticated()) {
    router.navigate(["/login"], { queryParams: { returnUrl: state.url } });
    return false;
  }

  if (requiredRole?.length > 0) {
    const userRole = authStore.userRole();
    if (!userRole || !requiredRole.includes(userRole)) {
      router.navigate(["/home"]);
      return false;
    }
  }

  return true;
};

export const loginGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authStore = inject(AuthStore);

  if (authStore.isAuthenticated()) {
    router.navigate(["/home"]);
    return false;
  }

  return true;
};
