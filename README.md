# Smart Fourgon Dashboard

[![Validate](https://github.com/tapion69/smart-fourgon-dashboard/actions/workflows/validate.yml/badge.svg)](https://github.com/tapion69/smart-fourgon-dashboard/actions/workflows/validate.yml)
[![HACS Custom](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://www.hacs.xyz/)
[![Home Assistant](https://img.shields.io/badge/Home%20Assistant-2026.5%2B-18BCF2.svg)](https://www.home-assistant.io/)
[![License](https://img.shields.io/github/license/tapion69/smart-fourgon-dashboard)](LICENSE)

**Smart Fourgon Dashboard** est un tableau de bord Home Assistant générique, configurable et responsive, pensé pour les fourgons aménagés, vans et camping-cars.

Le projet n'impose pas de matériel particulier : les informations affichées proviennent des entités déjà présentes dans Home Assistant.

> Le projet est encore en phase de finalisation. La branche `main` contient la version de développement. La première Release HACS stable sera publiée lorsque l'interface et les fonctions seront suffisamment proches du résultat final.

## Fonctionnalités

### Vue générale

La vue principale s'adapte automatiquement aux entités configurées.

Sur l'image du fourgon peuvent apparaître :

- **Solaire** : puissance, tension et courant ;
- **Consommation fourgon** : puissance instantanée ;
- **Batterie** : SOC, tension, courant, puissance, température et jauge 5 niveaux ;
- **Convertisseur 12/230 V** : puissance/état, tension, fréquence, courant et température ;
- **Eau propre** : litres, pourcentage et jauge par niveaux.

Une section disparaît automatiquement lorsqu'elle est désactivée ou qu'aucune entité utile n'est configurée.

### Compteurs énergie

La colonne de droite peut afficher des cartes par catégorie :

- production solaire : instantané, jour, mois, année ;
- consommation fourgon : instantané, jour, mois, année ;
- charge batterie : jour, mois, année ;
- décharge batterie : jour, mois, année ;
- eau consommée : jour, mois, année.

Les couleurs reprennent la logique visuelle de la vue principale.

### État rapide

**État rapide** est entièrement configurable. Chaque tuile peut recevoir une entité Home Assistant, un nom et une icône.

Un clic sur une valeur numérique ouvre son historique.

### Onglets personnalisés

Il est possible de créer autant d'onglets que nécessaire, par exemple Chauffage, Eau, MaxxFan, Réfrigérateur, Éclairage, Sécurité ou Truma.

Chaque onglet peut recevoir ses propres entités et être affiché dans le menu gauche. Il peut aussi être ajouté au menu de droite de la vue générale.

Types pris en charge :

- Auto ;
- Lecture seule / Sensor ;
- Binary Sensor ;
- Switch ;
- Number ;
- Select ;
- Button ;
- Climate ;
- Light ;
- Fan.

### Thermostats Home Assistant

Les entités `climate` utilisent les capacités réellement exposées par Home Assistant :

- température actuelle ;
- consigne ;
- mode HVAC ;
- mode de ventilation ;
- presets ;
- swing ;
- swing horizontal ;
- consigne basse/haute lorsque disponible.

### Températures dynamiques

| Type | Zone 1 | Zone 2 | Zone 3 |
| --- | --- | --- | --- |
| Batterie | 0–30 °C vert | 31–45 °C orange | >45 °C rouge |
| Convertisseur | 0–35 °C vert | 36–55 °C orange | >55 °C rouge |
| Eau | 0–30 °C bleu | 31–45 °C orange | >45 °C rouge |
| Ambiante | 0–15 °C bleu | 16–25 °C vert | >25 °C rouge |

### Historique

Un clic sur une valeur numérique ouvre un historique intégré sur 6 h, 24 h, 7 jours ou 30 jours.

### Jour / nuit

Trois modes sont disponibles : **Jour**, **Nuit** et **Automatique**. En automatique, le dashboard suit l'état de `sun.sun`.

### Responsive

L'interface est conçue pour ordinateur, tablette et smartphone. Sur smartphone, les informations principales restent positionnées sur l'image du fourgon et les cartes récapitulatives sont placées en dessous.

## Installation avec HACS

Smart Fourgon Dashboard est actuellement installé comme **dépôt personnalisé HACS**.

1. Ouvrir **HACS**.
2. Ouvrir **Dépôts personnalisés**.
3. Ajouter :

   ```text
   https://github.com/tapion69/smart-fourgon-dashboard
   ```

4. Sélectionner la catégorie **Integration**.
5. Installer **Smart Fourgon Dashboard**.
6. Redémarrer Home Assistant.
7. Aller dans **Paramètres → Appareils et services → Ajouter une intégration**.
8. Rechercher **Smart Fourgon Dashboard**.
9. Valider l'installation.

Le panneau **Smart Fourgon** apparaît ensuite dans la barre latérale Home Assistant.

### Prérequis

- Home Assistant **2026.5.0 ou plus récent** ;
- HACS pour l'installation simplifiée ;
- au moins une entité Home Assistant à afficher.

Aucune dépendance matérielle spécifique n'est imposée.

## Configuration

Ouvrir **Smart Fourgon → Réglages**.

Les réglages permettent notamment de définir la langue, le mode jour/nuit, l'entité de localisation, les sections principales, les compteurs jour/mois/année, État rapide et les onglets personnalisés.

La configuration est enregistrée côté Home Assistant et reste disponible sur les autres appareils utilisant la même instance.

## Mises à jour

### Pendant le développement

La branche `main` évolue fréquemment et **n'est pas publiée comme Release à chaque correction**.

Dans cette phase, HACS ne signale donc pas forcément une nouvelle version. Pour récupérer les derniers changements :

**HACS → Smart Fourgon Dashboard → Retélécharger**, puis redémarrer Home Assistant si nécessaire.

### Après la première Release stable

Les versions stables seront publiées sous forme de **GitHub Releases** avec un tag `vX.Y.Z`.

À partir de ce moment, HACS pourra détecter les nouvelles Releases et proposer normalement le bouton **Mettre à jour**.

La procédure est décrite dans [RELEASING.md](RELEASING.md).

## Validation automatique

Chaque modification de `main` et chaque Pull Request lance des contrôles GitHub Actions :

- validation JSON ;
- syntaxe Python ;
- syntaxe JavaScript ;
- validation HACS ;
- Hassfest Home Assistant.

Une version stable ne doit être publiée que lorsque ces contrôles sont verts.

## Structure du dépôt

```text
custom_components/
└── smart_fourgon/
    ├── frontend/
    │   ├── assets/
    │   ├── smart-fourgon-panel.js
    │   └── styles.css
    ├── translations/
    ├── __init__.py
    ├── config_flow.py
    ├── manifest.json
    ├── panel.py
    ├── storage.py
    └── websocket.py
```

## Données et confidentialité

Smart Fourgon Dashboard utilise les entités de l'instance Home Assistant locale et enregistre sa configuration dans le stockage Home Assistant. Le projet n'a pas besoin d'un service cloud externe pour fonctionner.

## Développement et contributions

Les propositions, rapports de bugs et améliorations sont bienvenus.

- [CONTRIBUTING.md](CONTRIBUTING.md)
- [CHANGELOG.md](CHANGELOG.md)
- [RELEASING.md](RELEASING.md)

## Licence

Distribué sous licence [MIT](LICENSE).

---

## English

Smart Fourgon Dashboard is a configurable Home Assistant dashboard for camper vans, motorhomes and RVs.

It uses existing Home Assistant entities and provides a responsive overview, energy summaries, configurable quick-status tiles, custom pages, native-style climate controls, history and day/night themes.

Installation is currently done through HACS as a **custom Integration repository**. Stable HACS updates will use GitHub Releases once the first public release is published.
