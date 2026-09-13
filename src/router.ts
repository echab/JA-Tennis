import { createRouter } from "@solidjs/router";
import { Home } from "./components/Home";
import { PaneDraw } from "./components/draw/PaneDraw";
import { Players } from "./components/player/Players";
import { Planning } from "./components/planning/Planning";
import { NotFound } from "./components/misc/NotFound";

export const Router = createRouter({
    routes: [
        { path: "/", component: Home },
        { path: "/draw/:eventId/:drawId?/:boxPos?", component: PaneDraw },
        { path: "/players/:playerId?", component: Players },
        { path: "/planning/:day?", component: Planning },
        { path: "*404", component: NotFound },
    ],
    //   preload: loadSession,
});

export const { paths } = Router;