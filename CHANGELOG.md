# Changelog

Toutes les évolutions importantes de Smart Fourgon Dashboard sont documentées ici.

Le projet suit autant que possible le principe Semantic Versioning :

- **MAJOR** : changement incompatible ;
- **MINOR** : nouvelle fonctionnalité compatible ;
- **PATCH** : correction compatible.

## [Unreleased]

### Ajouté

- tableau de bord Home Assistant dédié au fourgon aménagé ;
- vue principale jour/nuit ;
- affichage Solaire, Conso fourgon, Batterie, Convertisseur et Eau propre ;
- compteurs énergie jour/mois/année ;
- État rapide entièrement configurable ;
- onglets personnalisés ;
- support des types Sensor, Binary Sensor, Switch, Number, Select, Button, Climate, Light et Fan ;
- contrôles `climate` dynamiques à partir des capacités Home Assistant ;
- historique intégré 6 h / 24 h / 7 jours / 30 jours ;
- jauges batterie et eau ;
- couleurs de température dynamiques ;
- interface responsive ordinateur/tablette/smartphone ;
- français et anglais ;
- mémorisation locale de l'état ouvert/fermé des sections de réglages ;
- cache des ressources frontend pour accélérer l'ouverture du dashboard.

### Modifié

- amélioration progressive de la lisibilité sur ordinateur ;
- adaptation spécifique de la vue principale aux smartphones ;
- couleurs distinctes pour Solaire, Conso fourgon, Batterie, Convertisseur et Eau ;
- optimisation du chargement initial des images jour/nuit.

### Publication

Aucune Release stable n'a encore été publiée. La branche `main` reste la branche de développement de la V1.
