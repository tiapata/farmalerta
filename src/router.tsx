import { createRouter, createHashHistory } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const hashHistory = createHashHistory();

  const router = createRouter({
    routeTree,
    history: hashHistory,
    scrollRestoration: true,
    defaultPreload: false,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
