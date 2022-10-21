import { DrawType } from "../domain/draw";
import { Tournament } from "../domain/tournament";
import { MINUTES } from "../utils/date";

export const mockTournament: Tournament = {
  id: "1",
  info: {
    name: "Test1",
    slotLength: 90 // minutes
  },
  players: [
    { id: "J0", name: "Albert", sexe: "H", rank: "NC", registration: ["E0"], club:'TROC' },
    { id: "J1", name: "Bernard", sexe: "H", rank: "NC", registration: ["E0"] },
    { id: "J2", name: "Claude", sexe: "H", rank: "30/4", registration: [] },
    { id: "J4", name: "Daniel", sexe: "H", rank: "30/3", registration: ["E0"] },
    { id: "J5", name: "Etienne", sexe: "H", rank: "30/2", registration: ["E0"] },
  ],
  events: [
    {
      id: "E0",
      name: "Messieurs - 4e série",
      sexe: "H",
      category: "Senior",
      maxRank: "30/1",
      draws: [
        {
          id: "T00",
          name: "NC",
          minRank: "NC",
          maxRank: "NC",
          type: DrawType.Normal,
          nbColumn: 2,
          nbOut: 2,
          boxes: [
            { playerId: "J0", position: 6, qualifIn:1, order:2 },
            {
              date: new Date("2022-10-09T16:30"),
              qualifOut: 1,
              position: 2,
              // playerId: "J0",
              // score: "6/4 6/1",
            },
            { playerId: "J1", position: 5, order:3 },
            { position: 4, qualifIn:2, order:3 },
            { position: 1, qualifOut:2 },
            { playerId: "J2", seeded:1, position: 3, order:1 },
          ],
        },
        {
          id: "T01",
          name: "4e série",
          minRank: "40",
          maxRank: "30/1",
          type: DrawType.Final,
          nbColumn: 3,
          nbOut: 1,
          boxes: [
            { position: 6, qualifIn:1, order:2 },
            { position: 5, playerId: "J4", order:3 },
            { playerId: "J5", seeded:1, position: 3, order:1 },
          ],
        },
      ],
    },
  ],
};
