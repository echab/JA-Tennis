/* eslint-disable no-bitwise */
import { Box, Draw, FINAL, KNOCKOUT, Match, PlayerIn, QEMPTY, ROUNDROBIN } from "../../domain/draw";
import { Player, SexeString, Team } from "../../domain/player";
import { TEvent, Tournament, TournamentInfo } from "../../domain/tournament";
import { ScoreString } from "../../domain/types";
import { atMidnight, atZeroHour } from "../../utils/date";
import { ASSERT } from "../../utils/tool";
import { drawLib } from "../draw/drawLib";
import { column, positionBottomCol, positionMax, positionMin, scanLeftBoxes } from "../draw/knockoutLib";
import { isMatch } from "../drawService";
import { defaultDrawName } from "../tournamentService";
import { category, licence, rank } from "../types";
import { by, byId, indexOf } from "../util/find";
import { FieldParent, Fields, FnType, generateId, Serializer } from "./serializer";

const DAY = 24 * 3600 * 1000; // YEAR = DAY * 365.25;
const MAX_JOUR = 42;
const MAX_JOUEUR = 1300;
const MAX_COURT = 16;
const MAX_MATCHJOUR = 16;

const EQUIPE_MASK = 4;
const DOUBLE_MASK_OLD = 8;
const MAXCLAST = -61 * 60;
const PAS_CLASSEMT = 98 * 60;
const NC = 19 * 60;
// const TABLEAU_FINAL = 1;
const TABLEAU_POULE = 2;
// const TABLEAU_POULE_AR = 3;

const MAX_EPREUVE = 15;
const MAX_TABLEAU = 15;
const MAX_BOITE = 511;
const MIN_COL = 2;
const MAX_COL = 9;
const MAX_COL_POULE = 22;

export const jatFileType = {
    description: 'JA-Tennis document',
    accept: { 'binary/x-jat': ['.jat'] }
};

const optionalString = (s: string | undefined) => s?.trim() || undefined;
// const optionalString = (s: string | undefined) => s || undefined; // TODO just for exact matching with .jat

function buildTeamName(teamIds: string[], players: Player[]): string {
    return teamIds.map((id) => byId(players, id) ?? { name: `#${id}` } as Player)
        .map((p) => `${p.name} ${p?.firstname?.[0] ?? ''}`.trim())
        .join(' / ');
}

function rankFields<T extends string>(this: Serializer & { _curSexe?: number }, s: T): T {
    // _rankAccept: { version: 2, maxVersion: 7, type: "u8", reviver: (c, p) => { p.rankAccept = p.version < 6 ? c === -5 + 60 ? -6 * 60 : c === -6 * 60 ? 19 * 60 : c : c; } },
    if (!this.writing) {
        const b = this.i8;

        ASSERT(b === PAS_CLASSEMT || (MAXCLAST <= b && b <= NC));

        // TODO by types, using this._curSexe and this._type.name
        let c = (b - 1) * 60;
        if (c === MAXCLAST - 60) {
            c = PAS_CLASSEMT;
        }
        const ranks = rank.list();
        return ranks[19 - c / 60] as T;

    } else {
        const ranks = rank.list();
        const r = ranks.indexOf(s);
        const cc = s === undefined ? PAS_CLASSEMT : (19 - r) * 60;
        const b = cc / 60 + 1;
        this.i8 = b;
        return '' as T; // unused
    }
}

const playerFields: Fields<Player & { version: number, dateMaj: Date }> = {
    _schema: { type: "schema", valid: (s) => s === 'CJoueur', replacer: () => 'CJoueur' },
    version: { type: "u8", def: 10, valid: (v) => v <= 10, replacer: () => 10 },
    id: { type() { return String(this._arrayIndex); } },
    sexe: {
        version: 4, type: "u8", // 0=H 1=F	Equipe:4=HHH 5=FFF 6=HHFF
        reviver: (b: number, p: Player & { _sexe: number }) => {
            p._sexe = b;
            return "HFM"[b & ~EQUIPE_MASK] as SexeString;
        },
        replacer: (s, p: Player & { _sexe: number }) => {
            p._sexe = "HFM".indexOf(p.sexe) | (p.teamIds ? EQUIPE_MASK : 0);
            return p._sexe;
        },
    },
    teamIds: {
        predicate: ({ _sexe }: { _sexe: number }) => _sexe & EQUIPE_MASK,
        type: "arrayb", itemType: "u16", valid: (a) => a.length <= 4,
        reviver: (a: number[]) => a.map((playerId) => String(playerId)),
        replacer: (a?: string[]) => a?.map((playerId) => parseInt(playerId, 10))
    },
    _teamName: {
        predicate: ({ _sexe }: { _sexe: number }) => _sexe & EQUIPE_MASK, type: "bstr",
        reviver: (s: string, p: Player & { _teamName?: string }) => p._teamName = s || undefined,
        replacer(
            this: Serializer & { _playerRegs?: Record<string, number>, _teamNames?: Record<string, string | undefined> },
            s: string, p: Player) {
            return p.teamIds && this._teamNames?.[p.id];
        },
    },
    licence: {
        predicate: ({ _sexe }: { _sexe: number }) => !(_sexe & EQUIPE_MASK), type: "u32",
        reviver: (l) => l ? `${String(l).padStart(7, '0')}${licence.getKey(String(l).padStart(7, '0')) ?? ''}` : undefined,
        replacer: (s) => s ? parseInt(s, 10) : 0
    },
    name: { predicate: ({ _sexe }: { _sexe: number }) => !(_sexe & EQUIPE_MASK), type: "bstr" },
    firstname: { predicate: ({ _sexe }: { _sexe: number }) => !(_sexe & EQUIPE_MASK), type: "bstr", reviver: optionalString },
    adress1: { type: "bstr", reviver: optionalString },
    adress2: { type: "bstr", reviver: optionalString },
    zipCode: { type: "bstr", reviver: optionalString },
    city: { type: "bstr", reviver: optionalString },
    phone1: { type: "bstr", reviver: optionalString },
    phone2: { type: "bstr", reviver: optionalString },
    email: { version: 5, type: "bstr", reviver: optionalString },
    birth: {
        type: "date", reviver: (d: Date | number | undefined, p: Player) => {
            // TODO: compute Categorie from birthDate
            // const age = d && Math.round(new Date().getFullYear() - (typeof d === 'string' ? +d : d.getFullYear()));
            // p.category = age && `categ${age}`;
            p.category = d ? category.ofDate(d).id : undefined;
            return d;
        }
    },
    // solde: { maxVersion: 6, type(value, _, { version }) { return (version < 7) ? this.f32 : this.u32; } }, // decimal * 100
    solde: { version: 7, type: "u32", reviver: (v) => v || undefined }, // decimal * 100
    _solde: { maxVersion: 6, type: "f32", reviver: (v, p: Player) => { if (v) { p.solde = v; } } },
    soldeType: { version: 8, type: "u8", reviver: (v) => v || undefined },
    soldeEspece: { version: 10, type: "u32", def: 0, reviver: (v) => v || undefined },
    soldeCheque: { version: 10, type: "u32", def: 0, reviver: (v) => v || undefined },
    rank: { type: rankFields },
    rank2: { type: rankFields }, //, replacer: (v, p: Player) => p.teamIds ? -1 : v },
    _bfRank: {
        version: 9, type: "u8", // 1=Etranger 2=Assimilé
        reviver: (v: number, p: Player) => {
            if (v & 1) { p.foreign = true; }
            if (v & 2) { p.assimilated = true; }
        },
        replacer: (_, p: Player) => (p.foreign ? 1 : 0) | (p.assimilated ? 2 : 0)
    },
    nationality: { version: 9, type: "bstr", reviver: optionalString },
    _sexe: {
        maxVersion: 3, type: "u8",
        reviver: (b: number, p: Player & { _sexe: number }) => { p.sexe = 'HFM'[b & ~EQUIPE_MASK] as SexeString; return b; },
        replacer: (_, p) => "HFM".indexOf(p.sexe)
    },
    club: { type: "bstr", reviver: optionalString },
    registration: {
        type: "u32", replacer(
            this: Serializer & { _playerRegs?: Record<string, number> },
            reg, p: Player
        ) {
            return this._playerRegs?.[p.id];
        }
    },
    _partenaire: { version: 2, type: "u16", replacer: () => 0xffff },
    avail: { version: 3, type: 'array', itemType: 'u32', replacer: (v) => v?.slice(0, MAX_JOUR) },
    comment: { version: 3, type: "bstr", reviver: optionalString },
    dateMaj: { type: "date" },
    _: {
        type(value, _, p: Player & { _sexe?: number }) {
            if (!this.writing) {
                delete p._sexe;
            } else {
                // TODO?
            }
        }
    }
    // TODO version:1 two additional "00 00" (pos 67 into jeu2test-3.jat) not read ?!?
} as const;

const scoreFields: FnType<ScoreString> = function(value: string, f, p: PlayerIn & Match) {
    if (!this.writing) {
        const games = Array(5).fill(0).map(() => {
            const b = this.u8;
            return [b & 0xf, (b >> 4) & 0xf]; // {j1:4, j2:4}
        }).filter(([g1, g2]) => g1 !== 0 || g2 !== 0)
            .map(([g1, g2]) => `${g1}/${g2}`)
            .join(' ');
        const flags = this.u8;
        if (flags & 1) { p.wo = true; }
        if (flags & 4) { p.vainqDef = true; }
        return games; // `${games}${flags & 1 ? 'WO' : ''}${flags & 4 ? ' VD' : ''}`;
    } else {
        const games = (value ?? '').replace(/WO|\s*VD/g, '').split(' ').map((game) => game.split('/').map((g) => parseInt(g, 10)));
        for (let i = 0; i < 5; i++) {
            const [g1, g2] = games[i] ?? [0, 0];
            this.u8 = g1 & 0xf | (g2 & 0xf) << 4;
        }
        // const flags = (value?.match(/WO/) ? 1 : 0) | (value?.match(/VD/) ? 4 : 0)
        const flags = (p.wo ? 1 : 0) | (p.vainqDef ? 4 : 0)
        this.u8 = flags;
        return '';
    }
};

const boxFields: Fields<PlayerIn & Match & { version: number }> = {
    _schema: { type: "schema", valid: (s) => s === 'CBoite', replacer: () => 'CBoite' },
    version: { type: "u8", def: 4, valid: (v) => v <= 4, replacer: () => 4 },
    position: { type() { return this._arrayIndex; } },
    playerId: {
        type: "i16",
        reviver: (id: number) => id === -1 ? undefined : String(id),
        replacer: (id?: string) => id === undefined ? -1 : parseInt(id, 10),
    },
    score: { type: scoreFields },
    _flags: {
        type: "u16",
        reviver: (f: number, p: PlayerIn & Match) => {
            if (f & 1) { p.hidden = true; }
            const qualif = (f >> 1) & 0b11; //0=no, 1=Entrant,	2=Sortant,	3=T�teS�rie
            const num = (f >> 3) & 0b11111;
            switch (qualif) {
                case 1: p.qualifIn = num || QEMPTY; break;
                case 2: p.qualifOut = num || QEMPTY; break;
                case 3: p.seeded = num || QEMPTY; break;
            }
            p.receive = ((f >> 8) & 0b1) ? 1 : 0;

            p.aware1 = ((f >> 9) & 0b11) as (0 | 1 | 2);	//Le joueur1 est pr�venu (0=non, 1=r�p, 2=oui)
            p.aware2 = ((f >> 11) & 0b11) as (0 | 1 | 2);	//Le joueur2 est pr�venu (0=non, 1=r�p, 2=oui)

            p.matchFormat = f >> 13;

            // cleanup default values
            if (p.receive === 0) { delete p.receive; }
            if (p.aware1 === 0) { delete p.aware1; }
            if (p.aware2 === 0) { delete p.aware2; }
            if (p.matchFormat === 0) { delete p.matchFormat; }
        },
        replacer: (f: number, p: PlayerIn & Match) => {
            let result = f;
            if (p.hidden) { result |= 1; }
            if (p.qualifIn !== undefined) { result |= (1 << 1) | (p.qualifIn << 3); }
            if (p.qualifOut !== undefined) { result |= (2 << 1) | (p.qualifOut << 3); }
            if (p.seeded !== undefined) { result |= (3 << 1) | (p.seeded << 3); }
            if (p.receive) { result |= (1 << 8); }
            if (p.aware1) { result |= (p.aware1 << 9); }
            if (p.aware2) { result |= (p.aware2 << 11); }
            if (p.matchFormat !== undefined) { result |= p.matchFormat << 13; }
            return result;
        }
    },
    date: { type: "date" },
    _hour: {
        type: "u16",
        reviver: (h: number | undefined, p: FieldParent<Match>) => {
            if (p.date && h !== undefined) {
                p.date.setHours(Math.trunc(h / 60), Math.trunc(h % 60));
            }
            return undefined;
        },
        replacer: (h: number | undefined, p: FieldParent<Match>) => {
            return p.date ? p.date.getHours() * 60 + p.date.getMinutes() : 0;
        }
    },
    order: {
        type: "i16", reviver: (o, p: PlayerIn) => {
            if (o > 0) { // first appearance
                delete (p as Partial<Match>).score; // it's not a match
            }
            return o;
        },
    },
    place: {
        version: 2, type: "i16",
        reviver: (c: number) => c !== -1 ? c : undefined,
        replacer: (c: number | undefined) => c === undefined ? -1 : c
    },
    note: { version: 4, type: "bstr", reviver: optionalString },
} as const;

const drawFields: Fields<Draw & { version: number, dateMaj: Date }> = {
    _schema: { type: "schema", valid: (s) => s === 'CTableau', replacer: () => 'CTableau' },
    version: { type: "u8", def: 10, valid: (v) => v <= 10, replacer: () => 10 },
    id: { version: 10, type: "u16", def: generateId, reviver: (id: number) => id ? String(id) : generateId() },
    _name: { maxVersion: 2, type: "bstr", reviver: (s, p: Draw) => { p.name = s; } },
    name: { version: 5, type: "bstr",
        reviver: (s: string) => s.trim(),
        replacer: (s: string | undefined, p: Draw) => s !== defaultDrawName(p) ? s : undefined
    },
    nbColumn: { type: "u8", valid: (n) => MIN_COL <= n }, // MAX_COL depends on type
    nbOut: { type: "u8" },
    type: {
        type: "u8", reviver: (t, p: FieldParent<Draw>) => {
            if (p.version) {
                if (p.version < 6 && t === TABLEAU_POULE) { t = 0; }
                if (p.version < 9 && t & TABLEAU_POULE) { p.nbOut = 1; }
            }
            return t;
        }, valid: (t, p) =>
            p.nbColumn <= (t & TABLEAU_POULE ? MAX_COL_POULE : MAX_COL),
    },
    dateMaj: { type: "date" },

    boxes: {
        type: "array", itemType: boxFields,
        reviver: (b: Array<PlayerIn | Match>, p: Draw) => {
            const posMin = positionMin(p.nbOut), posMax = positionMax(p.nbColumn, p.nbOut);
            return b.filter((o) => !(p.type === KNOCKOUT || p.type === FINAL)
                || (posMin <= o.position && o.position <= posMax
                    && o.position >= positionBottomCol(column(o.position), p.nbOut))
            );
        },
        replacer: (b: Array<PlayerIn | Match> | undefined, p: Draw) => {
            const nBox = p.type & ROUNDROBIN ? p.nbColumn * (p.nbColumn + 1) : positionMax(p.nbColumn, p.nbOut) + 1;
            return Array(nBox).fill(0).map((_, i) => {
                const box = b && by(b, 'position', i);
                return box ?? { position: i };
            });
        },
    },
    lock: { version: 4, type: "u8", def: 0, reviver: (l) => l || undefined },
    _lock: { maxVersion: 1, type: "u8", reviver: (b, p: Box) => { if (b) { p.locked = b; } } },
    orientation: { type: "u8" },
    _minRank: { maxVersion: 7, type: "u8" }, // TODO
    _maxRank: { maxVersion: 7, type: "u8" }, // TODO
    minRank: { version: 8, type: rankFields },
    maxRank: { version: 8, type: rankFields },
    cont: { version: 7, type: "u8", def: 0 },
    formatMatch: { version: 8, type: "u8" },
    _: {
        type(value, _, p: Draw) {
            if (!this.writing) {
                if (!p.name) {
                    p.name = defaultDrawName(p);
                }

                // hide boxes on left off entering players
                // const hideBox = (box: Box, b: number) => box.hidden = true;
                const deleteBox = (box: Box) => {
                    if (box.playerId) {
                        console.warn('cleanup draw', p.id, p.name, `box.pos=${box.position}`, 'player=', box.playerId);
                    } else {
                        const b = indexOf(p.boxes, "position", box.position);
                        delete p.boxes[b];
                    }
                }
                p.boxes.forEach((box: PlayerIn) => {
                    if (box.order) {
                        scanLeftBoxes(p, box.position, false, deleteBox);
                    }
                });

                // TODO init joueur QS
                // if (draw.type & TABLEAU_POULE) {
                //     for(let i=iHautCol( iColMin()); i>=0; i--){
                //         if( m_pBoite[ iDiagonale( i)]->isQualifieSortant()){
                //             m_pBoite[ iDiagonale( i)]->m_iJoueur = m_pBoite[ ADVERSAIRE1( i)]->m_iJoueur;
                //         }
                //     }
                // }
            } else {
                // TODO?
            }
        }
    },
} as const;

const eventFields: Fields<TEvent & { version: number, dateMaj: Date }> = {
    _schema: { type: "schema", valid: (s) => s === 'CEpreuve', replacer: () => 'CEpreuve' },
    version: { type: "u8", def: 10, valid: (v) => v <= 10, replacer: () => 10 },
    id: { version: 9, type: "u16", def: generateId, reviver: (id: number) => id ? String(id) : generateId() },
    _name: { maxVersion: 2, type: "bstr", reviver: (s, p: TEvent) => { p.name = s; } },
    name: { version: 10, type: "bstr" },
    sexe: {
        type: "u8",
        reviver(this: Serializer & { _curSexe?: number }, b: number, p: TEvent) {
            if (b & DOUBLE_MASK_OLD) {
                b = (b | EQUIPE_MASK) & (~DOUBLE_MASK_OLD);
            }

            if (b & EQUIPE_MASK) {
                p.typeDouble = true;
            }

            this._curSexe = b; // used by inner draws for rank
            return 'HFM'[b & ~EQUIPE_MASK] as SexeString; //0=H 1=F Equipe:4=HHH 5=FFF 6=HHFF
        }, replacer: (s, p) => "HFM".indexOf(s ?? 'H') | (p.typeDouble ? EQUIPE_MASK : 0)
    },
    _categ3: { maxVersion: 3, type: "u8", reviver: (b) => [0, 1, 2, 3, 5, 7, 9, 11, 12, 13, 15, 17, 18][b], valid: () => false },
    _categ7: { maxVersion: 6, type: "u8", reviver: (b) => b * 10, valid: () => false },
    category: { version: 7, type: "u8" },
    // category: {
    //     version: 7, type: "u8", reviver(this: Serializer & { _type?: { name: string } }, b) {
    //         if (this._type?.name === "FFT") {
    //             return categoryFFT.indexOf(b);
    //         }
    //         // TODO, from .ini, by types
    //         return -1; // `category${b}`;
    //     }
    // },
    _bDouble: { type: "u8" },
    _rankAccept: { version: 2, maxVersion: 7, type: "u8", reviver: (c, p: FieldParent<TEvent>) => { p.maxRank = p.version && p.version < 6 ? c === -5 + 60 ? -6 * 60 : c === -6 * 60 ? 19 * 60 : c : c; } },
    maxRank: { version: 8, type: rankFields }, // TODO use version of FFT types instead of tableau.version
    consolation: { type: "u8" },
    start: { type: "date" },
    end: { type: "date" },
    dateMaj: { type: "date" },

    draws: { type: "array", itemType: drawFields, valid: (a) => a.length <= 63 },
    matchFormat: { version: 4, type: "u8", reviver: (f) => f },
    color: { version: 5, type: "u32", def: 0xFFFFFF,
        reviver: (c: number) => `#${(c).toString(16).padStart(6, '0').replace(/^(\d\d)(\d\d)(\d\d)$/, '$3$2$1')}`,
        replacer: (c?: string) => parseInt(c?.substring(1) ?? 'ffffff', 16),
    },
    _: {
        type(this: Serializer & { _curSexe?: number }, value, _, event: TEvent) {
            if (!this.writing) {
                delete this._curSexe; // clean-up

                if (!event.name) {
                    event.name = `${event.typeDouble ? 'Double ' : 'Simple '}${{ H: 'Messieurs', F: 'Dames', M: 'Mixte' }[event.sexe]}${event.consolation ? ' consolation' : ''}`;
                }

                // cleanup draws.boxes
                event.draws.forEach((draw: Draw) => {
                    const lib = drawLib(event as TEvent, draw);
                    draw.boxes.forEach((box) => {
                        if (isMatch(box)) {
                            const { player1, player2 } = lib.boxesOpponents(box);
                            if (!player1 || !player2) {
                                delete (box as Partial<Match>).score; // not a match
                            }
                        }
                    });
                });
            } else {
                // TODO
            }
        }
    }
} as const;

const infoFields: Fields<TournamentInfo & { version?: number }> = {
    // version: { type(value, _, p) { return p.version; } },
    name: { type: "bstr" },
    _bEpreuve: { type: "u8", maxVersion: 5 },
    homologation: { type: "bstr", reviver: optionalString },
    start: { maxVersion: 11, type: "date", reviver: (d: Date | undefined) => d ? atZeroHour(d) : undefined },
    end: { maxVersion: 11, type: "date", reviver: (d: Date | undefined) => d ? atMidnight(d) : undefined },
    _isPlanning: { version: 7, type: "u8" },
    slotLength: { type: () => 90 }, // TODO
    club: {
        type: {
            name: { type: "bstr" },
            adress1: { type: "bstr", reviver: optionalString },
            adress2: { version: 6, type: "bstr", reviver: optionalString },
            ligue: { type: "bstr", reviver: optionalString },
        }
    },
    referee: {
        type: {
            name: { type: "bstr" },
            adress1: { type: "bstr", reviver: optionalString },
            adress2: { version: 6, type: "bstr", reviver: optionalString },
        }
    },
    _clubNo: { version: 3, maxVersion: 5, type: "u32" },
} as const;

export const docFields: Fields<Tournament> = {
    _init: {
        type(
            this: Serializer & { _playerRegs?: Record<string, number>, _teamNames?: Record<string, string | undefined> },
            value, _,
            doc: Tournament & { _start?: Date, _end?: Date }
        ) {
            if (this.writing) {
                // compute team name
                this._teamNames = Object.fromEntries(doc.players.filter((p): p is Team => !!p.teamIds)
                    .map(({ id, teamIds, name }) => [id, name !== buildTeamName(teamIds, doc.players) ? name : undefined]));

                // compute registration
                const eventBits = Object.fromEntries(doc.events.map(({ id }, i) => [id, 1 << i]));
                this._playerRegs = Object.fromEntries(doc.players.map(({ id, registration }) =>
                    [id, registration.reduce((a, eventId) => a + eventBits[eventId], 0)]
                ));
            }
        }
    },
    version: { type: "u8", def: 13, valid: (v) => v <= 13, replacer: () => 13 },
    id: { version: 13, type: "u16", def: generateId, reviver: (id: number) => id ? String(id) : generateId() },
    types: {
        version: 9, type: {
            name: { version: 9, type: "bstr", def: 'FFT', valid: (t) => t === 'FFT' },
            versionTypes: { version: 9, type: "u8", def: 1, valid: (v) => v <= 5 },
            data: { version: 10, type: "customData" },
        }, def: { name: 'FFT', version: 1 },
        reviver(this: Serializer & { _type?: { name: string } }, t) {
            this._type = t;
            return t;
        },
    },
    _start: {
        version: 12, type: "date",
        reviver: (d: Date | undefined, p: Tournament & { _start?: Date }) => { p._start = d ? atZeroHour(d) : undefined; },
        replacer: (_, p: Tournament) => p.info.start
    },
    _end: {
        version: 12, type: "date",
        reviver: (d: Date | undefined, p: Tournament & { _end?: Date }) => { p._end = d ? atMidnight(d) : undefined; },
        replacer: (_, p: Tournament) => p.info.end
    },

    players: { type: "array", itemType: playerFields },

    events: { type: "array", itemType: eventFields },

    info: { version: 2, type: infoFields },

    places: { version: 4, type: "array", itemType: {
        name: { type: "bstr" },
        avail: { type: () => [] },
    }},

    _content: { version: 5, type: "u8", def: 1, replacer: () => 1 }, // Contenu { tournoi = 1, epreuve = 2, tableau = 3, boites  = 4, joueurs = 5 }

    '_places.avail': {
        version: 8, type(value, _, doc: Tournament & { _start?: Date, _end?: Date }) {
            if (!this.writing) {
                if (doc._start && doc._end && doc.places?.length) {
                    const nDay = Math.floor((doc._end.getTime() - doc._start.getTime()) / DAY) + 1;
                    for (let i = 0; i < nDay; i++) {
                        for (const place of doc.places) {
                            let avail = this.u32;
                            if (doc.version < 11) {
                                avail = 0xFFFFFFFF;	//always available
                            }
                            place.avail[i] = avail;
                        }
                    }
                }
            } else {
                if (doc.info.start && doc.info.end && doc.places?.length) {
                    const nDay = Math.floor((doc.info.end.getTime() - doc.info.start.getTime()) / DAY) + 1;
                    for (let i = 0; i < nDay; i++) {
                        for (const place of doc.places) {
                            this.u32 = place.avail[i];
                        }
                    }
                }
            }
        }
    },
    _: {
        type(
            this: Serializer & { _playerRegs?: Record<string, number> },
            value, _,
            doc: Tournament & { _start?: Date, _end?: Date }
        ) {
            if (!this.writing) {

                if (!doc.info.start && doc._start) {
                    doc.info.start = atZeroHour(doc._start);
                    delete doc._start;
                }
                if (!doc.info.end && doc._end) {
                    doc.info.end = atMidnight(doc._end);
                    delete doc._end;
                }

                // once all players and events are loaded
                doc.players.forEach((player: Player & { _teamName?: string }) => {

                    // compute team name
                    if (player.teamIds) {
                        player.name = player._teamName || buildTeamName(player.teamIds, doc.players) || '';
                        delete player._teamName;
                    }

                    // convert players registration
                    const dw = player.registration as unknown as number;
                    player.registration = doc.events.map((event, i) =>
                        (dw & (1 << i)) ? event.id : undefined
                    ).filter((id): id is string => !!id);
                })
            }
        }
    }
} as const;
