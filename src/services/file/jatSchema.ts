/* eslint-disable no-bitwise */
import { Box, Draw, FINAL, KNOCKOUT, Match, PlayerIn, QEMPTY } from "../../domain/draw";
import { Player, Sexe } from "../../domain/player";
import { TEvent, Tournament, TournamentInfo } from "../../domain/tournament";
import { ScoreString } from "../../domain/types";
import { atMidnight, atZeroHour } from "../../utils/date";
import { ASSERT } from "../../utils/tool";
import { drawLib } from "../draw/drawLib";
import { column, positionBottomCol, positionMax, positionMin, scanLeftBoxes } from "../draw/knockoutLib";
import { isMatch } from "../drawService";
import { ranksName } from "../tournamentService";
import { rank } from "../types";
import { byId, indexOf } from "../util/find";
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

const categoryFFT = [
    10, 17, 24, 30, 50, 60, 64, 70, 80, 90, 100,
    110,
    120, 125, 130, 140, 150, 160, 170, 180, 190
];

const optionalString = (s: string | undefined) => s?.trim() || undefined;

function rankFields<T extends string>(this: Serializer & { _curSexe?: number }, c: T): T {
    // _rankAccept: { version: 2, maxVersion: 7, type: "byte", reviver: (c, p) => { p.rankAccept = p.version < 6 ? c === -5 + 60 ? -6 * 60 : c === -6 * 60 ? 19 * 60 : c : c; } },
    if (!this.writing) {
        let c = this.byte;

        ASSERT(c === PAS_CLASSEMT || (MAXCLAST <= c && c <= NC));

        // TODO by types, using this._curSexe and this._type.name
        c = (c - 1) * 60;
        if (c === MAXCLAST - 60) {
            c = PAS_CLASSEMT;
        }
        const ranks = rank.list();
        return ranks[19 - c / 60] as T;

    } else {
        const ranks = rank.list();
        const r = ranks.indexOf(c);
        this.word = r;
        return '' as T;
    }
}

const playerFields: Fields<Player & {version: number, dateMaj: Date}> = {
    _schema: { type: "schema", valid: (s) => s === 'CJoueur', replacer: () => 'CJoueur' },
    version: { type: "byte", def: 10, valid: (v) => v <= 10, replacer: () => 10 },
    id: { type() { return String(this._arrayIndex); } },
    sexe: { version: 4, type: "byte", replacer: (s, p) => "HFM".indexOf(p.sexe) | (p.teamIds ? EQUIPE_MASK : 0) }, //0=H 1=F	Equipe:4=HHH 5=FFF 6=HHFF
    teamIds: {
        predicate: ({ sexe }) => sexe & EQUIPE_MASK,
        type: "arrayb", itemType: "word", valid: (a) => a.length <= 4,
        reviver: (a: number[]) => {
            return a.map((playerId) => String(playerId)); // playerId is converted to Player below
        }
    },
    _teamName: { predicate: ({ sexe }) => sexe & EQUIPE_MASK, type: "bstr", reviver: (s: string, p) => p._teamName = s || undefined },
    licence: { predicate: ({ sexe }) => !(sexe & EQUIPE_MASK), type: "dword", reviver: (l) => l || undefined }, // TODO by types
    name: { predicate: ({ sexe }) => !(sexe & EQUIPE_MASK), type: "bstr" },
    firstname: { predicate: ({ sexe }) => !(sexe & EQUIPE_MASK), type: "bstr", reviver: optionalString },
    adress1: { type: "bstr", reviver: optionalString },
    adress2: { type: "bstr", reviver: optionalString },
    zipCode: { type: "bstr", reviver: optionalString },
    city: { type: "bstr", reviver: optionalString },
    phone1: { type: "bstr", reviver: optionalString },
    phone2: { type: "bstr", reviver: optionalString },
    email: { version: 5, type: "bstr", reviver: optionalString },
    birth: {
        type: "date", reviver: (d, p) => {
            // TODO: compute Categorie from birthDate
            const age = d && Math.round(new Date().getFullYear() - (typeof d === 'string' ? +d : d.getFullYear()));
            p.category = age && `categ${age}`;
            return d;
        }
    },
    // solde: { maxVersion: 6, type(value, _, { version }) { return (version < 7) ? this.float : this.dword; } }, // decimal * 100
    solde: { version: 7, type: "dword", reviver: (v) => v || undefined }, // decimal * 100
    _solde: { maxVersion: 6, type: "float", reviver: (v, p) => { if (v) { p.solde = v; } } },
    soldeType: { version: 8, type: "byte", reviver: (v) => v || undefined },
    soldeEspece: { version: 10, type: "dword", def: 0, reviver: (v) => v || undefined },
    soldeCheque: { version: 10, type: "dword", def: 0, reviver: (v) => v || undefined },
    rank: { type: rankFields },
    rank2: { type: rankFields },
    _bfRank: { version: 9, type: "byte", reviver: (v) => v || undefined },
    nationality: { version: 9, type: "bstr", reviver: optionalString },
    _sexe: { maxVersion: 3, type: "byte", reviver: (sexe, p) => { p.sexe = sexe; }, replacer: (s, p) => "HFM".indexOf(p.sexe) },
    club: { type: "bstr", reviver: optionalString },
    registration: { type: "dword" },
    _partenaire: { version: 2, type: "word" },
    avail: { version: 3, type(value, _, doc) { // TODO: { type: 'array', itemType: 'dword' }
        if (!this.writing) {
            const result = [];
            const nDay = this.word;
            for (let i = 0; i < nDay && i < MAX_JOUR; i++) {
                let avail = this.dword;
                if (doc!.version! < 11) {
                    avail = 0xFFFFFFFF;	//always available
                }
                result[i] = avail;
            }
            return result;
        } else {
            const nDay = value?.length ?? 0;
            this.word = nDay;
            for (let i = 0; i < nDay && i < MAX_JOUR; i++) {
                this.dword = value[i] ?? -1; // TODO
            }
        }
    }
    },
    comment: { version: 3, type: "bstr", reviver: optionalString },
    dateMaj: { type: "date" },
    _: {
        type(value, _, p) {
            if (p) {
                if (!this.writing) {
                    p.sexe = ['H', 'F', 'M'][p.sexe & ~EQUIPE_MASK]; //0=H 1=F	Equipe:4=HHH 5=FFF 6=HHFF
                } else {
                    // TODO?
                }
            }
        }
    }
    // TODO version:1 two additional "00 00" (pos 67 into jeu2test-3.jat) not read ?!?
} as const;

const scoreFields: FnType<ScoreString> = function(value: string) {
    if (!this.writing) {
        const games = Array(5).fill(0).map(() => {
            const b = this.byte;
            return [b & 0xf, (b >> 4) & 0xf]; // {j1:4, j2:4}
        }).filter(([g1,g2]) => g1 !== 0 || g2 !== 0)
            .map(([g1,g2]) => `${g1}/${g2}`)
            .join(' ');
        const flags = this.byte;
        return `${games}${flags & 1 ? 'WO' : ''}${flags & 4 ? ' VD' : ''}`;
    } else {
        const games = (value ?? '').replace(/WO|\s*VD/g, '').split(' ').map((game) => game.split('/').map((g) => parseInt(g,10)));
        for (let i=0; i< 5; i++) {
            const [g1,g2] = games[i] ?? [0,0];
            this.byte = g1 & 0xf | (g2 & 0xf) << 4;
        }
        const flags = (value?.match(/WO/) ? 1 : 0) | (value?.match(/VD/) ? 4 : 0)
        this.byte = flags;
        return '';
    }
};

const boxFields: Fields<PlayerIn & Match & {version: number}> = {
    _schema: { type: "schema", valid: (s) => s === 'CBoite', replacer: () => 'CBoite' },
    version: { type: "byte", def: 4, valid: (v) => v <= 4, replacer: () => 4 },
    position: { type() { return this._arrayIndex; }},
    playerId: {
        type: "i16", reviver: (id) => id === -1 ? undefined : String(id)
    },
    score: { type: scoreFields },
    _flags: { type: "word", reviver: (f, p) => {
        if (f & 1) { p.hidden = true; }
        const qualif = (f >> 1) & 0b11; //0=no, 1=Entrant,	2=Sortant,	3=T�teS�rie
        const num = (f >> 3) & 0b11111;
        switch (qualif) {
            case 1: p.qualifIn = num || QEMPTY; break;
            case 2: p.qualifOut = num || QEMPTY; break;
            case 3: p.seeded = num || QEMPTY; break;
        }
        if (((f >> 8) & 0b1)) { p.receive = true; }

        const aware1 = (f >> 9) & 0b11;	//Le joueur1 est pr�venu (0=non, 1=r�p, 2=oui)
        const aware2 = (f >> 11) & 0b11;	//Le joueur2 est pr�venu (0=non, 1=r�p, 2=oui)

        p.fm = f >> 13; // formatMatch

        // return f & 0x1FFF;
        return undefined;
    }},
    date: { type: "date" },
    _hour: {
        type: "word", reviver: (h, p: FieldParent<{ date?: Date }>) => {
            if (p.date && h !== undefined) {
                p.date.setHours(Math.trunc(h / 60), Math.trunc(h % 60));
            }
            return undefined;
        }
    },
    order: {
        type: "i16", reviver: (o, p) => {
            if (o > 0) { // first appearance
                delete p.score;
            }
            return o;
        },
    },
    place: { version: 2, type: "i16", reviver: (c, p) => (c !== -1 && p.version > 2 ? c : undefined) },
    note: { version: 4, type: "bstr", reviver: optionalString },
} as const;

const drawFields: Fields<Draw & {version: number, dateMaj: Date}> = {
    _schema: { type: "schema", valid: (s) => s === 'CTableau', replacer: () => 'CTableau' },
    version: { type: "byte", def: 10, valid: (v) => v <= 10, replacer: () => 10},
    id: { version: 10, type: "word", def: generateId, reviver: (id) => id ? String(id) : generateId() },
    _name: { maxVersion: 2, type: "bstr", reviver: (s, p) => { p.name = s; } },
    name: { version: 5, type: "bstr", reviver: (s) => s?.trim() },
    nbColumn: { type: "byte", valid: (n) => MIN_COL <= n }, // MAX_COL depends on type
    nbOut: { type: "byte" },
    type: {
        type: "byte", reviver: (t, p) => {
            if (p.version < 6 && t === TABLEAU_POULE) { t = 0; }
            if (p.version < 9 && t & TABLEAU_POULE) { p.nbOut = 1; }
            return t;
        }, valid: (t, p) =>
            p.nbColumn <= (t & TABLEAU_POULE ? MAX_COL_POULE : MAX_COL),
    },
    dateMaj: { type: "date" },

    boxes: {
        type: "array", itemType: boxFields, reviver: (b, p) => {
            const posMin = positionMin(p.nbOut), posMax = positionMax(p.nbColumn, p.nbOut);
            return b.filter((o: Box) => !(p.type === KNOCKOUT || p.type === FINAL)
                || (posMin <= o.position && o.position <= posMax
                    && o.position >= positionBottomCol(column(o.position), p.nbOut))
            );
        }
    },
    lock: { version: 4, type: "byte", def: 0, reviver:(l) => l || undefined },
    _lock: { maxVersion: 1, type: "byte", reviver: (b, p) => { if (b) { p.lock = b; } } },
    orientation: { type: "byte" },
    _minRank: { maxVersion: 7, type: "byte" }, // TODO
    _maxRank: { maxVersion: 7, type: "byte" }, // TODO
    minRank: { version: 8, type: rankFields },
    maxRank: { version: 8, type: rankFields },
    cont: { version: 7, type: "byte", def: 0 },
    formatMatch: { version: 8, type: "byte" },
    _: {
        type(value, _, p) {
            const draw = p as Draw;
            if (!this.writing) {
                if (!draw.name) {
                    if (draw.type === FINAL) {
                        draw.name = "Final draw";
                    } else {
                        draw.name = ranksName(draw.minRank, draw.maxRank);
                    }
                }

                // hide boxes on left off entering players
                // const hideBox = (box: Box, b: number) => box.hidden = true;
                const deleteBox = (box: Box) => {
                    if (box.playerId) {
                        console.warn('cleanup draw', draw.id, draw.name, `box.pos=${box.position}`, 'player=', box.playerId);
                    } else {
                        const b = indexOf(draw.boxes, "position", box.position);
                        delete draw.boxes[b];
                    }
                }
                draw.boxes.forEach((box: PlayerIn) => {
                    if (box.order) {
                        scanLeftBoxes(draw, box.position, false, deleteBox);
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

const eventFields: Fields<TEvent & {version: number, dateMaj: Date}> = {
    _schema: { type: "schema", valid: (s) => s === 'CEpreuve', replacer: () => 'CEpreuve' },
    version: { type: "byte", def: 10, valid: (v) => v <= 10, replacer: () => 10 },
    id: { version: 9, type: "word", def: generateId, reviver: (id) => id ? String(id) : generateId() },
    _name: { maxVersion: 2, type: "bstr", reviver: (s, p) => { p.name = s; } },
    name: { version: 10, type: "bstr" },
    sexe: {
        type: "byte", reviver(this: Serializer & { _curSexe?: number }, b, p) {
            if (b & DOUBLE_MASK_OLD) {
                b = (b | EQUIPE_MASK) & (~DOUBLE_MASK_OLD);
            }

            if (b & EQUIPE_MASK) {
                p.typeDouble = true;
            }

            this._curSexe = b; // used by inner draws for rank
            return b;
        }, replacer: (s, p) => "HFM".indexOf(s ?? 'H') | (p.typeDouble ? EQUIPE_MASK : 0)
    },
    _categ3: { maxVersion: 3, type: "byte", reviver: (b) => [0, 1, 2, 3, 5, 7, 9, 11, 12, 13, 15, 17, 18][b], valid: () => false },
    _categ7: { maxVersion: 6, type: "byte", reviver: (b) => b * 10, valid: () => false },
    category: {
        version: 7, type: "byte", reviver(this: Serializer & { _type?: { name: string } }, b) {
            if (this._type?.name === "FFT") {
                return categoryFFT.indexOf(b);
            }
            // TODO, from .ini, by types
            return -1; // `category${b}`;
        }
    },
    _bDouble: { type: "byte" },
    _rankAccept: { version: 2, maxVersion: 7, type: "byte", reviver: (c, p) => { p.rankAccept = p.version < 6 ? c === -5 + 60 ? -6 * 60 : c === -6 * 60 ? 19 * 60 : c : c; } },
    maxRank: { version: 8, type: rankFields }, // TODO use version of FFT types instead of tableau.version
    consolation: { type: "byte" },
    start: { type: "date" },
    end: { type: "date" },
    dateMaj: { type: "date" },

    draws: { type: "array", itemType: drawFields, valid: (a) => a.length <= 63 },
    formatMatch: { version: 4, type: "byte", reviver: (f) => f }, // TODO
    color: { version: 5, type: "dword", def: 0xFFFFFF, reviver: (c: number) => `#${(c).toString(16).padStart(6,'0').replace(/^(\d\d)(\d\d)(\d\d)$/, '$3$2$1')}` },
    _: {
        type(this: Serializer & { _curSexe?: number }, value, _, evt) {
            if (!this.writing) {
                delete this._curSexe; // clean-up

                if (evt) {
                    const event = evt as TEvent;
                    event.sexe = ['H', 'F', 'M'][evt.sexe & ~EQUIPE_MASK] as Sexe; //0=H 1=F Equipe:4=HHH 5=FFF 6=HHFF

                    if (!event.name) {
                        event.name = `${event.typeDouble ? 'Double ': 'Simple '}${{ H:'Messieurs', F:'Dames', M:'Mixte' }[event.sexe]}${event.consolation ? ' consolation' : ''}`;
                    }

                    // cleanup draws.boxes
                    event.draws.forEach((draw: Draw) => {
                        const lib = drawLib(event as TEvent, draw);
                        draw.boxes.forEach((box) => {
                            if (isMatch(box)) {
                                const {player1, player2} = lib.boxesOpponents(box);
                                if (!player1 || !player2) {
                                    delete (box as Partial<Match>).score; // not a match
                                }
                            }
                        });
                    });
                }
            } else {
                // TODO
            }
        }
    }
} as const;

const infoFields: Fields<TournamentInfo & { version?: number }> = {
    // version: { type(value, _, p) { return p.version; } },
    name: { type: "bstr" },
    _bEpreuve: { type: "byte", maxVersion: 5 },
    homologation: { type: "bstr", reviver: optionalString },
    start: { maxVersion: 11, type: "date", reviver: (d) => atZeroHour(d) },
    end: { maxVersion: 11, type: "date", reviver: (d) => atMidnight(d) },
    _isPlanning: { version: 7, type: "byte" },
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
    _clubNo: { version: 3, maxVersion: 5, type: "dword" },
} as const;

export const docFields: Fields<Tournament> = {
    version: { type: "byte", def: 13, valid: (v) => v <= 13, replacer: () => 13 },
    id: { version: 13, type: "word", def: generateId, reviver: (id) => id ? String(id) : generateId() },
    types: {
        version: 9, type: {
            name: { version: 9, type: "bstr", def: 'FFT', valid: (t) => t === 'FFT' },
            versionTypes: { version: 9, type: "byte", def: 1, valid: (v) => v <= 5 },
            data: { version: 10, type: "customData" },
        }, def: { name: 'FFT', version: 1 },
        reviver(this: Serializer & { _type?: { name: string } }, t) {
            this._type = t;
            return t;
        },
    },
    _start: { version: 12, type: "date", reviver:(d,p) => { p._start = atZeroHour(d); } },
    _end: { version: 12, type: "date", reviver:(d,p) => { p._end = atMidnight(d); } },

    players: { type: "array", itemType: playerFields },

    events: { type: "array", itemType: eventFields },

    info: { version: 2, type: infoFields },

    places: {
        version: 4, type: "array", itemType: {
            name: { type: "bstr" },
            // _day: { type(value, f) {
            //     if (!this.writing) {
            //         return [];
            //     } else {
            //         // TODO
            //     }
            // } }, // [0..MAX_JOUR]
            avail: { type(value, f) {
                if (!this.writing) {
                    // TODO Array(p.info._nDay)
                    // this.dword; // TODO
                    return [];
                } else {
                    // TODO
                }
            } }, // [0..MAX_JOUR]
        }
    },
    _content: { version: 5, type: "byte", def: 0 }, // Contenu { tournoi = 1, epreuve = 2, tableau = 3, boites  = 4, joueurs = 5 }
    '_courts.avail': {
        version: 8, type(value, _, doc: Tournament & { _start?: Date, _end?: Date }) {
            if (!doc) { throw new Error("undefined doc"); }
            if (!this.writing) {
                if (doc._start && doc._end && doc.places?.length) {
                    const nDay = Math.floor((doc._end.getTime() - doc._start.getTime()) / DAY) + 1;
                    for (let i = 0; i < nDay; i++) {
                        for (const place of doc.places) {
                            let avail = this.dword;
                            if (doc.version! < 11) {
                                avail = 0xFFFFFFFF;	//always available
                            }
                            place.avail[i] = avail;
                        }
                    }
                }
            } else {
                // TODO
            }
        }
    },
    _: {
        type(value, _, p) {
            const doc = p as Tournament;

            if (!this.writing) {

                if (p && !p.info.start) {
                    p.info.start = atZeroHour(p._start);
                    p.info.end = atMidnight(p._end);
                    delete p._start;
                    delete p._end;
                }

                //convert players registration
                doc.players.forEach((p: Player & { _teamName?: string }) => {

                    // compute team name
                    if (p.teamIds) {
                        p.name = p._teamName ||
                            p.teamIds
                                // .map((playerId) => byId(doc.players, playerId, `team player #${playerId} not found`))
                                .map((playerId) => byId(doc.players, playerId) ?? { name: `#${playerId}` } as Player)
                                .map((player) => `${player.name} ${player?.firstname?.[0] ?? ''}`.trim())
                                .join(' - ');
                        delete p._teamName;
                    }

                    const dw = p.registration as unknown as number;
                    p.registration = doc.events.map((event, i) =>
                        (dw & (1 << i)) ? event.id : undefined
                    ).filter((id): id is string => !!id);
                })
            } else {
                // TODO
            }
        }
    }
} as const;
