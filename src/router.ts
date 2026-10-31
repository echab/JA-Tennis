import { createRouter } from "@solidjs/router";
import { Home } from "./components/Home";
import { PaneDraw } from "./components/draw/PaneDraw";
import { PanePlayers } from "./components/player/PanePlayers";
import { PanePlanning } from "./components/planning/PanePlanning";
import { NotFound } from "./components/misc/NotFound";

export const Router = createRouter({
    routes: [
        { path: "/", component: Home },
        { path: "/draw/:eventId/:drawId?/:boxPos?", component: PaneDraw },
        { path: "/players/:playerId?", component: PanePlayers },
        { path: "/planning/:day?", component: PanePlanning },
        { path: "*404", component: NotFound },
    ],
    //   preload: loadSession,
});

export const { paths } = Router;