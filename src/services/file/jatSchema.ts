import { Box, Draw, Match, PlayerIn } from "../../domain/draw";
import { Player } from "../../domain/player";
import { TEvent, Tournament, TournamentInfo } from "../../domain/tournament";
import { Rank, Score } from "../../domain/types";
import { drawLib } from "../draw/drawLib";
import { isMatch } from "../drawService";
import { rank } from "../types";
import { array, arrayb, bstr, byte, customData, date, dword, Fields, float, generateId, i16, schema, word } from "./serializer";

const DAY = 24 * 3600 * 1000, YEAR = DAY * 365.25;
const MAX_JOUR = 42;
const MAX_JOUEUR = 1300;
const MAX_COURT = 16;
const MAX_MATCHJOUR = 16;

const EQUIPE_MASK = 4;
const DOUBLE_MASK_OLD = 8;
const MAXCLAST = -61 * 60;
const PAS_CLASSEMT = 98 * 60;
const NC = 19 * 60;
const TABLEAU_FINAL = 1;
const TABLEAU_POULE = 2;
const TABLEAU_POULE_AR = 3;

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

const rankFields: Fields = {
    // _rankAccept: { version: 2, maxVersion: 7, type: byte, reviver: (c, p) => { p.rankAccept = p.version < 6 ? c === -5 + 60 ? -6 * 60 : c === -6 * 60 ? 19 * 60 : c : c; } },
    _return: {
        type: byte,
        reviver(c, p) {
            // TODO by types, using this._curSexe
            c = (c - 1) * 60;
            if (c === MAXCLAST - 60) {
                c = PAS_CLASSEMT;
            }
            const ranks = rank.list();
            return  ranks[19 - c / 60];
        },
        valid: (c) => c === PAS_CLASSEMT || (MAXCLAST <= c && c <= NC),
    },
} as const;

const playerFields: Fields /* <Player> */ = {
    _schema: { type: schema, valid: (s) => s === 'CJoueur' },
    version: { type: byte, def: 10, valid: (v, p) => v <= 10 },
    sexe: { version: 4, type: byte }, //0=H 1=F	Equipe:4=HHH 5=FFF 6=HHFF
    teamMates: { predicate: ({ sexe }) => sexe & EQUIPE_MASK, type: arrayb, itemType: word, valid: (a) => a.length <= 4 },
    teamName: { predicate: ({ sexe }) => sexe & EQUIPE_MASK, type: bstr },
    licence: { predicate: ({ sexe }) => !(sexe & EQUIPE_MASK), type: dword }, // TODO by types
    name: { predicate: ({ sexe }) => !(sexe & EQUIPE_MASK), type: bstr },
    firstname: { predicate: ({ sexe }) => !(sexe & EQUIPE_MASK), type: bstr },
    adress1: { type: bstr },
    adress2: { type: bstr },
    zipCode: { type: bstr },
    city: { type: bstr },
    phone1: { type: bstr },
    phone2: { type: bstr },
    email: { version: 5, type: bstr, def: '' },
    birth: {
        type: date, reviver: (d, p) => {
            // TODO: compute Categorie from birthDate
            const age = d && Math.round(new Date().getFullYear() - (typeof d === 'string' ? +d : d.getFullYear()));
            p.category = age && `categ${age}`;
            return d;
        }
    },
    // solde: { maxVersion: 6, type(reader, _, { version }) { return (version < 7) ? float.call(this) : dword.call(this); } }, // decimal * 100
    solde: { version: 7, type: dword }, // decimal * 100
    _solde: { maxVersion: 6, type: float, reviver: (v, p) => { p.solde = v; } },
    soldeType: { version: 8, type: byte },
    soldeEspece: { version: 10, type: dword, def: 0 },
    soldeCheque: { version: 10, type: dword, def: 0 },
    rank: { type: rankFields },
    rank2: { type: rankFields },
    bfRank: { version: 9, type: byte },
    nationality: { version: 9, type: bstr },
    _sexe: { maxVersion: 3, type: byte, reviver: (sexe, p) => { p.sexe = sexe; } },
    club: { type: bstr },
    registration: { type: dword },
    _partenaire: { version: 2, type: word },
    avail: {
        version: 3, type(_, doc) {
            const result = [];
            const nDay = word.call(this);
            for (let i = 0; i < nDay && i < MAX_JOUR; i++) {
                let avail = dword.call(this);
                if (doc!.version! < 11) {
                    avail = 0xFFFFFFFF;	//always available
                }
                result[i] = avail;
            }
            return result;
        }
    },
    comment: { version: 3, type: bstr },
    dateMaj: { type: date },
    _: {
        type(_, p) {
            p!.sexe = ['H','F','H','F','M'][p!.sexe]; //0=H 1=F	Equipe:4=HHH 5=FFF 6=HHFF
        }
    }
} as const;

const scoreFields: Fields = {
    game: {
        type(reader, _, parent) {
            return Array(5).fill(0).map(() => {
                const b = byte.call(this);
                return [b & 0xf, (b >> 4) & 0xf]; // {j1:4, j2:4}
            });
        }, reviver: (game, p) => {
            const r = [];
            for (let [a, b] of game) {
                if (a === 0 && b === 0) {
                    break;
                }
                r.push(`${a}/${b}`);
            }
            p.score = r.join(' ');
            return game;
        }
    },
    flag: {
        type: byte, reviver: (f, p) => {  // WO = 1, PREVENU = 2, VAINQDEF = 4, PREVENU1 = 8, PREVENU2 = 16
            if (f & 1) {
                p.score += 'WO';
            }
            if (f & 4) {
                p.score += ' VD';
            }
            return f;
        }
    },
} as const;

const boxFields: Fields /* <PlayerIn & Match> */ = {
    _schema: { type: schema, valid: (s) => s === 'CBoite' },
    version: { type: byte, def: 4, valid: (v, p) => v <= 4 },
    playerId: {
        type: i16, reviver: (id) => id === -1 ? undefined : id
    },
    score: {
        type: scoreFields, reviver: (s, p) => {
            p._score = s;
            return s.score;
        }
    },
    flags: {
        type: word, reviver: (f, p) => {
            if (f & 1) { p.hidden = true; }
            const qualif = (f >> 1) & 0b11; //0=no, 1=Entrant,	2=Sortant,	3=T�teS�rie
            const num = (f >> 3) & 0b11111;
            switch (qualif) {
                case 1: p.qualifIn = num; break;
                case 2: p.qualifOut = num; break;
                case 3: p.seeded = num; break;
            }
            if (((f >> 8) & 0b1)) { p.receive = true; }

            const aware1 = (f >> 9) & 0b11;	//Le joueur1 est pr�venu (0=non, 1=r�p, 2=oui)
            const aware2 = (f >> 11) & 0b11;	//Le joueur2 est pr�venu (0=non, 1=r�p, 2=oui)

            p.fm = f >> 13; // formatMatch

            // return f & 0x1FFF;
            return undefined;
        }
    },
    date: { type: date },
    hour: {
        type: word, reviver: (h, p) => {
            if (p.date && h) {
                p.date.setHours(h % 60);
                p.date.setMinutes(h / 60);
            }
            return undefined;
        }
    },
    order: {
        type: word, reviver: (o, p) => {
            if (o > 0) {
                delete p.score;
            }
            return o > 0 ? o : undefined;
        }
    },
    place: { version: 2, type: i16, reviver: (c, p) => (c !== -1 && p.version > 2 ? c : undefined) },
    note: { version: 4, type: bstr, reviver: (s, p) => (s || undefined) },
} as const;

const drawFields: Fields /* <Draw> */ = {
    _schema: { type: schema, valid: (s) => s === 'CTableau' },
    version: { type: byte, def: 10, valid: (v, p) => v <= 10 },
    id: { version: 10, type: word, def: generateId },
    _name: { maxVersion: 2, type: bstr, reviver: (s, p) => { p.name = s; } },
    name: { version: 5, type: bstr },
    nbColumn: { type: byte, valid: (n) => MIN_COL <= n }, // MAX_COL depends on type
    nbOut: { type: byte },
    type: {
        type: byte, reviver: (t, p) => {
            if (p.version < 6 && t === TABLEAU_POULE) { t = 0; }
            if (p.version < 9 && t & TABLEAU_POULE) { p.nbOut = 1; }
            return t;
        }, valid: (t, p) =>
            p.nbColumn <= (t & TABLEAU_POULE ? MAX_COL_POULE : MAX_COL),
    },
    dateMaj: { type: date },

    boxes: {
        type: array, itemType: boxFields, reviver: (b, p) => {
            return b.map((o: Box, i: number) => {
                o.position = i;
                return o;
            });
        }
    },
    lock: { version: 4, type: byte, def: 0 },
    _lock: { maxVersion: 1, type: byte, reviver: (b, p) => { p.lock = b; } },
    orientation: { type: byte },
    _rankMin: { maxVersion: 7, type: byte }, // TODO
    _rankMax: { maxVersion: 7, type: byte }, // TODO
    rankMin: { version: 8, type: rankFields },
    rankMax: { version: 8, type: rankFields },
    suite: { version: 7, type: byte, def: 0 },
    formatMatch: { version: 8, type: byte },
    _: {
        type(_, draw) {
            if (draw && !draw.name) {
                draw!.name = draw.rankMin === draw.rankMax ? draw.rankMin : `${draw.rankMin} - ${draw.rankMax}`;
            }
            // TODO init joueur QS
            // if (draw.type & TABLEAU_POULE) {
            //     for(let i=iHautCol( iColMin()); i>=0; i--){
            //         if( m_pBoite[ iDiagonale( i)]->isQualifieSortant()){
            //             m_pBoite[ iDiagonale( i)]->m_iJoueur = m_pBoite[ ADVERSAIRE1( i)]->m_iJoueur;
            //         }
            //     }
            // }
        }
    },
} as const;

const eventFields: Fields /* <TEvent> */ = {
    _schema: { type: schema, valid: (s) => s === 'CEpreuve' },
    version: { type: byte, def: 10, valid: (v, p) => v <= 10 },
    id: { version: 9, type: word, def: generateId },
    _name: { maxVersion: 2, type: bstr, reviver: (s, p) => { p.name = s; } },
    name: { version: 10, type: bstr },
    sexe: {
        type: byte, reviver(b, p) {
            if (b & DOUBLE_MASK_OLD) {
                b = (b | EQUIPE_MASK) & (~DOUBLE_MASK_OLD);
            }
            //@ts-ignore
            this._curSexe = b; // used by inner draws for rank
            return b;
        }
    },
    _categ3: { maxVersion: 3, type: byte, reviver: (b) => [0, 1, 2, 3, 5, 7, 9, 11, 12, 13, 15, 17, 18][b], valid: () => false },
    _categ7: { maxVersion: 6, type: byte, reviver: (b) => b * 10, valid: () => false },
    category: { version: 7, type: byte, reviver: (b) => `categorie${b}` }, // TODO, from .ini, by types
    _bDouble: { type: byte },
    _rankAccept: { version: 2, maxVersion: 7, type: byte, reviver: (c, p) => { p.rankAccept = p.version < 6 ? c === -5 + 60 ? -6 * 60 : c === -6 * 60 ? 19 * 60 : c : c; } },
    rankMax: { version: 8, type: rankFields }, // TODO use version of FFT types instead of tableau.version
    consolation: { type: byte },
    start: { type: date },
    end: { type: date },
    dateMaj: { type: date },

    draws: { type: array, itemType: drawFields, valid: (a) => a.length <= 63 },
    formatMatch: { version: 4, type: byte, reviver: (f) => f }, // TODO
    color: { version: 5, type: dword, def: 0xFFFFFF },
    _: {
        type(_, event) {
            // @ts-ignore
            delete this._curSexe; // clean-up

            // cleanup draws.boxes
            if (event) {
                event.draws.forEach((draw: Draw) => {
                    const lib = drawLib(event as TEvent, draw);
                    draw.boxes.forEach((box) => {
                        if (isMatch(box)) {
                            const opp = lib.boxesOpponents(box);
                            if (!opp.box1 || !opp.box2) {
                                delete (box as Partial<Match>).score; // not a match
                            }
                        }
                    });
                });
            }
        }
    }
} as const;

const infoFields: Fields /* <TournamentInfo> */ = {
    // version: { type(r, _, p) { return p.version; } },
    name: { type: bstr },
    _bEpreuve: { type: byte, maxVersion: 5 },
    homologation: { type: bstr },
    _start: { maxVersion: 11, type: date },
    _end: { maxVersion: 11, type: date },
    _isPlanning: { version: 7, type: byte },
    club: {
        type: {
            name: { type: bstr },
            adress1: { type: bstr },
            adress2: { version: 6, type: bstr },
            ligue: { type: bstr },
        }
    },
    referee: {
        type: {
            name: { type: bstr },
            adress1: { type: bstr },
            adress2: { version: 6, type: bstr },
        }
    },
    clubNo: { version: 3, maxVersion: 5, type: dword },
} as const;

export const docFields: Fields /* <Tournament> */ = {
    version: { type: byte, def: 13, valid: (v, p) => v <= 13 },
    id: { version: 13, type: word, def: generateId },
    types: {
        version: 9, type: {
            name: { version: 9, type: bstr, def: 'FFT', valid: (t) => t === 'FFT' },
            versionTypes: { version: 9, type: byte, def: 1, valid: (v) => v <= 5 },
            data: { version: 10, type: customData },
        }, def: { name: 'FFT', version: 1 },
    },
    start: { version: 12, type: date },
    end: { version: 12, type: date },

    players: { type: array, itemType: playerFields },

    events: { type: array, itemType: eventFields },

    info: { version: 2, type: infoFields },

    places: {
        version: 4, type: array, itemType: {
            name: { type: bstr },
            day: { type(f, p) { return []; } }, // [0..MAX_JOUR]
            avail: { type(f, p) { return []; } }, // [0..MAX_JOUR]
        }
    },
    content: { version: 5, type: byte, def: 0 }, // Contenu { tournoi = 1, epreuve = 2, tableau = 3, boites  = 4, joueurs = 5 }
    '_courts.avail': {
        version: 8, type: function (_, doc) {
            if (!doc) { throw new Error("undefined doc"); }
            doc._nDay = Math.floor((doc.end.getTime() - doc.start.getTime()) / DAY) + 1;
            for (let i = 0; i < doc._nDay; i++) {
                for (let b = 0; b < doc.places.length; b++) {
                    let avail = dword.call(this);
                    if (doc.version! < 11) {
                        avail = 0xFFFFFFFF;	//always available
                    }
                    doc.places[b].avail[i] = avail;
                }
            }
        }
    },
    _: { type(_, p) {
        const doc = p as Tournament;
        //convert players registration
        doc.players.forEach((p) => {
            const dw = p.registration as unknown as number;
            p.registration = doc.events.map((event, i) => 
                (dw & (1 << i)) ? event.id : undefined
            ).filter((id): id is string => !!id);
        })
    }}
} as const;

export function convert(docJat: any): Tournament {
    return docJat as unknown as Tournament;
}