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

const classementFields: Fields = {
    // _clastAccept: { version: 2, maxVersion: 7, type: byte, reviver: (c, p) => { p.clastAccept = p.version < 6 ? c === -5 + 60 ? -6 * 60 : c === -6 * 60 ? 19 * 60 : c : c; } },
    _return: {
        type: byte,
        reviver: (c, p) => {
            // TODO by types, using reader._curSexe
            c = (c - 1) * 60;
            if (c === MAXCLAST - 60) {
                c = PAS_CLASSEMT;
            }
            return c;
        },
        valid: (c) => c === PAS_CLASSEMT || (MAXCLAST <= c && c <= NC),
    },
} as const;

const joueurFields: Fields = {
    _schema: { type: schema, valid: (s) => s === 'CJoueur' },
    version: { type: byte, def: 10, valid: (v, p) => v <= 10 },
    sexe: { version: 4, type: byte },
    equipiers: { predicate: ({ sexe }) => sexe & EQUIPE_MASK, type: arrayb, itemType: word, valid: (a) => a.length <= 4 },
    nomEquipe: { predicate: ({ sexe }) => sexe & EQUIPE_MASK, type: bstr },
    licence: { predicate: ({ sexe }) => !(sexe & EQUIPE_MASK), type: dword }, // TODO by types
    nom: { predicate: ({ sexe }) => !(sexe & EQUIPE_MASK), type: bstr },
    prenom: { predicate: ({ sexe }) => !(sexe & EQUIPE_MASK), type: bstr },
    adresse1: { type: bstr },
    adresse2: { type: bstr },
    codePostal: { type: bstr },
    ville: { type: bstr },
    telephone1: { type: bstr },
    telephone2: { type: bstr },
    email: { version: 5, type: bstr, def: '' },
    dateNais: {
        type: date, reviver: (d, p) => {
            // TODO: compute Categorie from dateNais
            const age = d && Math.round(new Date().getFullYear() - (typeof d === 'string' ? +d : d.getFullYear()));
            p.categorie = age && `categ${age}`;
            return d;
        }
    },
    // solde: { maxVersion: 6, type: (reader, _, { version }) => (version < 7) ? float.call(this) : dword.call(this) }, // decimal * 100
    solde: { version: 7, type: dword }, // decimal * 100
    _solde: { maxVersion: 6, type: float, reviver: (v, p) => { p.solde = v; } },
    soldeType: { version: 8, type: byte },
    soldeEspece: { version: 10, type: dword, def: 0 },
    soldeCheque: { version: 10, type: dword, def: 0 },
    // classSimple: { type: byte, reviver: (c) => (c - 1) * 60 },
    // classDouble: { type: byte, reviver: (c) => (c - 1) * 60 },
    classSimple: { type: classementFields },
    classDouble: { type: classementFields },
    bfClast: { version: 9, type: byte },
    nationalite: { version: 9, type: bstr },
    _sexe: { maxVersion: 3, type: byte, reviver: (sexe, p) => { p.sexe = sexe; } },
    club: { type: bstr },
    inscription: { type: dword },
    _partenaire: { version: 2, type: word },
    dispo: {
        version: 3, type: function (_, doc) {
            const result = [];
            const nJour = word.call(this);
            for (let i = 0; i < nJour && i < MAX_JOUR; i++) {
                let dispo = dword.call(this);
                if (doc!.version! < 11) {
                    dispo = 0xFFFFFFFF;	//toujours dispo
                }
                result[i] = dispo;
            }
            return result;
        }
    },
    comment: { version: 3, type: bstr },
    dateMaj: { type: date },
} as const;

const scoreFields: Fields = {
    jeu: {
        type: function (reader, _, parent) {
            return Array(5).fill(0).map(() => {
                const b = byte.call(this);
                return [b & 0xf, (b >> 4) & 0xf]; // {j1:4, j2:4}
            });
        }, reviver: (jeu, p) => {
            const r = [];
            for (let [a, b] of jeu) {
                if (a === 0 && b === 0) {
                    break;
                }
                r.push(`${a}/${b}`);
            }
            p.score = r.join(' ');
            return jeu;
        }
    },
    flag: { type: byte }, // WO = 1, PREVENU = 2, VAINQDEF = 4, PREVENU1 = 8, PREVENU2 = 16
} as const;

const boiteFields: Fields = {
    _schema: { type: schema, valid: (s) => s === 'CBoite' },
    version: { type: byte, def: 4, valid: (v, p) => v <= 4 },
    joueur: { type: i16 },
    score: { type: scoreFields },
    flags: {
        type: word, reviver: (f, p) => {
            p.fm = f >> 13; // formatMatch
            return f & 0x1FFF;
        }
    },
    date: { type: date },
    heure: { type: word },
    ordre: { type: word },
    court: { version: 2, type: i16, reviver: (c, p) => { if (p.version <= 2) { c = -1; } return c }, def: -1 },
    note: { version: 4, type: bstr },
} as const;

const tableauFields: Fields = {
    _schema: { type: schema, valid: (s) => s === 'CTableau' },
    version: { type: byte, def: 10, valid: (v, p) => v <= 10 },
    id: { version: 10, type: word, def: generateId },
    _nom: { maxVersion: 2, type: bstr, reviver: (s, p) => { p.nom = s; } },
    nom: { version: 5, type: bstr },
    nCol: { type: byte, valid: (n) => MIN_COL <= n }, // MAX_COL depends on iType
    nQua: { type: byte },
    iType: {
        type: byte, reviver: (t, p) => {
            if (p.version < 6 && t === TABLEAU_POULE) { t = 0; }
            if (p.version < 9 && t & TABLEAU_POULE) { p.nQua = 1; }
            return t;
        }, valid: (t, p) =>
            p.nCol <= (t & TABLEAU_POULE ? MAX_COL_POULE : MAX_COL),
    },
    dateMaj: { type: date },

    boites: { type: array, itemType: boiteFields },
    lock: { version: 4, type: byte, def: 0 },
    _lock: { maxVersion: 1, type: byte, reviver: (b, p) => { p.lock = b; } },
    orientation: { type: byte },
    _class1: { maxVersion: 7, type: byte }, // TODO
    _class2: { maxVersion: 7, type: byte }, // TODO
    class1: { version: 8, type: classementFields },
    class2: { version: 8, type: classementFields },
    suite: { version: 7, type: byte, def: 0 },
    formatMatch: { version: 8, type: byte },
    _: {
        type: (r, _, d) => {
            // TODO init joueur QS
            // if (d.iType & TABLEAU_POULE) {
            //     for(let i=iHautCol( iColMin()); i>=0; i--){
            //         if( m_pBoite[ iDiagonale( i)]->isQualifieSortant()){
            //             m_pBoite[ iDiagonale( i)]->m_iJoueur = m_pBoite[ ADVERSAIRE1( i)]->m_iJoueur;
            //         }
            //     }
            // }
        }
    },
} as const;

const epreuveFields: Fields = {
    _schema: { type: schema, valid: (s) => s === 'CEpreuve' },
    version: { type: byte, def: 10, valid: (v, p) => v <= 10 },
    id: { version: 9, type: word, def: generateId },
    _nom: { maxVersion: 2, type: bstr, reviver: (s, p) => { p.nom = s; } },
    nom: { version: 10, type: bstr },
    sexe: {
        type: byte, reviver: function (b, p) {
            if (b & DOUBLE_MASK_OLD) {
                b = (b | EQUIPE_MASK) & (~DOUBLE_MASK_OLD);
            }
            //@ts-ignore
            this._curSexe = b; // used by inner tableaux for classement
            return b;
        }
    },
    _categ3: { maxVersion: 3, type: byte, reviver: (b) => [0, 1, 2, 3, 5, 7, 9, 11, 12, 13, 15, 17, 18][b], valid: () => false },
    _categ7: { maxVersion: 6, type: byte, reviver: (b) => b * 10, valid: () => false },
    categorie: { version: 7, type: byte, reviver: (b) => `categorie${b}` }, // TODO, from .ini, by types
    _bDouble: { type: byte },
    _clastAccept: { version: 2, maxVersion: 7, type: byte, reviver: (c, p) => { p.clastAccept = p.version < 6 ? c === -5 + 60 ? -6 * 60 : c === -6 * 60 ? 19 * 60 : c : c; } },
    clastAccept: { version: 8, type: classementFields }, // TODO use version of FFT types instead of tableau.version
    consolation: { type: byte },
    debut: { type: date },
    fin: { type: date },
    dateMaj: { type: date },

    tableaux: { type: array, itemType: tableauFields, valid: (a) => a.length <= 63 },
    formatMatch: { version: 4, type: byte, reviver: (f) => f }, // TODO
    couleur: { version: 5, type: dword, def: 0xFFFFFF },
    _: {
        type: (r, _, p) => {
            // @ts-ignore
            delete r._curSexe; // clean-up
        }
    }
} as const;

const infoFields: Fields = {
    // version: { type: (r, _, p) => p.version },
    name: { type: bstr },
    _bEpreuve: { type: byte, maxVersion: 5 },
    homologation: { type: bstr },
    _debut: { maxVersion: 11, type: date },
    _fin: { maxVersion: 11, type: date },
    _isPlanning: { version: 7, type: byte },
    club: {
        type: {
            nom: { type: bstr },
            adresse1: { type: bstr },
            adresse2: { version: 6, type: bstr },
            ligue: { type: bstr },
        }
    },
    arbitre: {
        type: {
            nom: { type: bstr },
            adresse1: { type: bstr },
            adresse2: { version: 6, type: bstr },
        }
    },
    clubNo: { version: 3, maxVersion: 5, type: dword },
} as const;

export const docFields: Fields = {
    version: { type: byte, def: 13, valid: (v, p) => v <= 13 },
    id: { version: 13, type: word, def: generateId },
    types: {
        version: 9, type: {
            name: { version: 9, type: bstr, def: 'FFT', valid: (t) => t === 'FFT' },
            versionTypes: { version: 9, type: byte, def: 1, valid: (v) => v <= 5 },
            data: { version: 10, type: customData },
        }, def: { name: 'FFT', version: 1 },
    },
    debut: { version: 12, type: date },
    fin: { version: 12, type: date },

    joueurs: { type: array, itemType: joueurFields },

    epreuves: { type: array, itemType: epreuveFields },

    info: { version: 2, type: infoFields },

    courts: {
        version: 4, type: array, itemType: {
            nom: { type: bstr },
            jour: { type: (r, f, p) => [] }, // [0..MAX_JOUR]
            dispo: { type: (r, f, p) => [] }, // [0..MAX_JOUR]
        }
    },
    contenu: { version: 5, type: byte, def: 0 }, // Contenu { tournoi = 1, epreuve = 2, tableau = 3, boites  = 4, joueurs = 5 }
    '_courts.dispo': {
        version: 8, type: function (_, doc) {
            if (!doc) { throw new Error("undefined doc"); }
            doc._nJour = Math.floor((doc.debut.getTime() - doc.fin.getTime()) / DAY) + 1;
            for (let i = 0; i < doc._nJour; i++) {
                for (let b = 0; b < doc.courts.length; b++) {
                    let dispo = dword.call(this);
                    if (doc.version! < 11) {
                        dispo = 0xFFFFFFFF;	//toujours dispo
                    }
                    doc.courts[b].dispo[i] = dispo;
                }
            }
        }
    },
} as const;
