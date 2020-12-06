export const AuthScopes = [
    'biometrics:read',
    'biometrics:write',
    'chat',
    'connections:read',
    'connections:write',
    'connections:invite',
    'meals:read',
    'meals:write',
    'notes:read',
    'notes:write',
    'notifications',
    'predictions:new',
    'predictions:settings',
    'profile:read',
    'profile:write',
    'recipe:read',
    'recipe:write',
    'user:delete',
];

export const AuthScopesImplicit = [
    'profile:read',
];

const readWrite = {
    'read': 'Lire',
    'write': 'Modifier',
};

// Keys order = display order
export const AuthScopesData = {
    'profile': {
        _: {
            text: 'Votre profil utilisateur et celui de vos connexions',
            icon: 'account_circle'
        },
        ...readWrite,
    },
    'user': {
        _: {
            text: 'Votre compte Diabetips',
            icon: 'security'
        },
        'delete': 'Désactiver votre compte',
    },
    'connections': {
        _: {
            text: 'Votre liste de connexions',
            icon: 'people',
        },
        ...readWrite,
        'invite': 'Envoyer une demande de connexion',
    },
    'notifications': {
        _: {
            text: 'Vos notifications',
            icon: 'notifications'
        },
        '': '',
    },
    'chat': {
        _: {
            text: 'Votre messagerie interne Diabetips',
            icon: 'chat',
        },
        '': '',
    },
    'biometrics': {
        _: {
            text: 'Vos informations médicales et celles de vos connexions',
            icon: 'insert_chart',
        },
        ...readWrite,
    },
    'predictions': {
        _: {
            text: 'Vos prédictions d\'insuline IA (Diaby) et celles de vos connexions',
            icon: 'insights'
        },
        'new': 'Demander une nouvelle prédiction',
        'settings': 'Contrôle des paramètres',
    },
    'notes': {
        _: {
            text: 'Vos notes et évènements et ceux de vos connexions',
            icon: 'sticky_note_2',
        },
        ...readWrite,
    },
    'meals': {
        _: {
            text: 'Vos informations nutritionnelles et celles de vos connexions',
            icon: 'restaurant',
        },
        ...readWrite,
    },
    'recipe': {
        _: {
            text: 'Vos recettes et celles de vos connexions',
            icon: 'menu_book',
        },
        ...readWrite,
    },
};
