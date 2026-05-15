import { Routes } from "@angular/router";
import { authGuard, loginGuard } from "./guards/auth";

export const routes: Routes = [
  {
    path: "",
    loadComponent: () => import("./pages/layout/layout.component"),
    children: [
      {
        path: "profile",
        loadComponent: () => import("./pages/profile/profile.component"),
        canActivate: [authGuard],
      },
      {
        path: "dashboard",
        loadComponent: () => import("./pages/dashboard/dashboard.component"),
        canActivate: [authGuard],
        data: { requiredRole: [1] },
      },
      {
        path: "settings",
        loadComponent: () => import("./pages/settings/settings.component"),
        canActivate: [authGuard],
      },
      {
        path: "home",
        loadComponent: () => import("./pages/home/home.component"),
      },
      {
        path: "explore",
        loadComponent: () =>
          import(
            "./features/testimony/components/testimony-feed/testimony-feed.component"
          ),
      },
      {
        path: "submit-testimony",
        loadComponent: () =>
          import(
            "./features/testimony/components/testimony-upload/testimony-upload.component"
          ),
        canActivate: [authGuard],
      },
      {
        path: "maps",
        loadComponent: () => import("./pages/maps/maps.component"),
      },
      {
        path: "collections",
        loadComponent: () =>
          import(
            "./features/collections/components/collection-list/collection-list.component"
          ),
        canActivate: [authGuard],
      },
      {
        path: "collections/:id",
        loadComponent: () =>
          import(
            "./features/collections/components/collection-detail/collection-detail.component"
          ),
        canActivate: [authGuard],
      },
      {
        path: "testimonies/:id",
        loadComponent: () =>
          import(
            "./features/testimony/components/testimony-detail/testimony-detail.component"
          ),
      },
      {
        path: "testimonies/:id/edit",
        loadComponent: () =>
          import(
            "./features/testimony/components/my-testimonies/components/testimony-edit/testimony-edit.component"
          ),
      },
      {
        path: "my-testimonies",
        loadComponent: () =>
          import(
            "./features/testimony/components/my-testimonies/my-testimonies.component"
          ),
        canActivate: [authGuard],
      },
      {
        path: "",
        redirectTo: "/home",
        pathMatch: "full",
      },
    ],
  },
  {
    path: "",
    loadComponent: () =>
      import("./pages/forum/forum-layout/forum-layout.component"),
    children: [
      {
        path: "forum",
        loadComponent: () => import("./pages/forum/forum.component"),
      },
      {
        path: "forum/create",
        loadComponent: () =>
          import(
            "./features/forum/components/forum-create-topic/forum-create-topic.component"
          ),
      },
      {
        path: "forum/post/:id",
        loadComponent: () =>
          import(
            "./features/forum/components/forum-post-detail/forum-post-detail.component"
          ),
      },
      {
        path: "forum/edit/:id",
        loadComponent: () =>
          import(
            "./features/forum/components/forum-edit-topic/forum-edit-topic.component"
          ),
      },
    ],
  },
  {
    path: "login",
    loadComponent: () =>
      import("./features/auth/components/login/login.component"),
    canActivate: [loginGuard],
  },
  {
    path: "register",
    loadComponent: () =>
      import("./features/auth/components/register/register.component"),
    canActivate: [loginGuard],
  },
  {
    path: "forgot-password",
    loadComponent: () =>
      import(
        "./features/auth/components/forgot-password/forgot-password.component"
      ),
    canActivate: [loginGuard],
  },
  {
    path: "reset-password",
    loadComponent: () =>
      import(
        "./features/auth/components/reset-password/reset-password.component"
      ),
    canActivate: [loginGuard],
  },
  {
    path: "2fa-verify",
    loadComponent: () =>
      import(
        "./features/auth/components/two-factor-verify/two-factor-verify.component"
      ),
    canActivate: [authGuard],
  },
  {
    path: "2fa-setup",
    loadComponent: () =>
      import(
        "./features/auth/components/two-factor-setup/two-factor-setup.component"
      ),
  },
];
