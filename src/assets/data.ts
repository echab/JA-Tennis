import { DrawType } from "../domain/draw";
import { Tournament } from "../domain/tournament";

export const mockTournament: Tournament = {
  id: "1",
  info: {
    name: "Test1",
    slotLength: 90 // minutes
  },
  players: [
    { id: "J0", name: "Albert", firstname:"René", sexe: "H", rank: "NC", registration: ["E0"], club:'TROC' },
    { id: "J1", name: "Bernard", firstname:"et Bianca", sexe: "H", rank: "NC", registration: ["E0"] },
    { id: "J2", name: "Claude", firstname:"Mickaël", sexe: "H", rank: "30/4", registration: [] },
    { id: "J4", name: "Daniel", sexe: "H", rank: "30/3", registration: ["E0"] },
    { id: "J5", name: "Eloïse", sexe: "F", rank: "30/2", registration: ["E0"] },
  ],
  events: [
    {
      id: "E0",
      name: "Messieurs - 4e série",
      sexe: "H",
      category: "Senior",
      maxRank: "30/1",
      color: "#dadaf9",
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
            { position: 6, playerId: "J0", qualifIn:1, order:2 },
              { position: 2, date: new Date("2022-10-09T16:30"), qualifOut: 1, score: '' },
            { position: 5, playerId: "J1", order:3 },
            { position: 4, qualifIn:2, order:4 },
              { position: 1, score:'', qualifOut:2 },
            { position: 3, playerId: "J2", seeded:1, order:1 },
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
              { position: 2 , score:''},
            { position: 5, playerId: "J4", order:3 },
                { position: 0 , qualifOut: 1, score:''},
              { position: 1, playerId: "J5", seeded:1, order:1 },
          ],
        },
      ],
    },
    {
      id: "E1",
      name: "Dames",
      sexe: "F",
      category: "Senior",
      maxRank: "30/1",
      color: "#f9dada",
      draws: [
      ]
    }
  ],
};
