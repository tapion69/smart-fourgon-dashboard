# Smart Fourgon Dashboard

Dashboard générique et entièrement configurable pour fourgon aménagé / camping-car dans Home Assistant.

## V1 — 0.1.0

- panneau **Smart Fourgon** dans la barre latérale Home Assistant ;
- responsive ordinateur / tablette / smartphone ;
- français / anglais ;
- thème Jour / Nuit / Automatique via `sun.sun` ;
- image jour et nuit personnalisable ;
- sections principales affichées uniquement lorsqu'au moins une entité est configurée ;
- Solaire : puissance, tension, courant, énergie jour/mois/année ;
- Batterie : SOC, puissance, tension, courant ;
- Eau propre : pourcentage et litres restants ;
- Chauffage : état, consigne et température actuelle ;
- Chauffe-eau : état et température ;
- Convertisseur : état, puissance, tension, fréquence et courant ;
- Climatisation / ventilation : état, température actuelle, consigne, puissance et vitesse ;
- compteurs journaliers configurables ;
- création dynamique d'onglets dans **Réglages** ;
- chaque onglet accepte autant d'entités Home Assistant que nécessaire ;
- types : Auto, Lecture seule, Sensor, Binary Sensor, Switch, Number, Select, Button, Climate, Light ;
- choix du nom, de l'icône MDI, d'une image personnalisée, de l'entité d'état et des couleurs actif/inactif ;
- clic sur une valeur numérique pour ouvrir l'historique ;
- historique 6 h / 24 h / 7 jours / 30 jours ;
- échelle basée sur les attributs `min` / `max` du capteur lorsqu'ils existent, sinon sur le min/max de l'historique ;
- configuration sauvegardée côté Home Assistant et partagée entre PC et smartphone.

## Installation HACS — dépôt personnalisé

1. Dans HACS, ouvrir **Dépôts personnalisés**.
2. Ajouter :
   `https://github.com/tapion69/smart-fourgon-dashboard`
3. Catégorie : **Integration**.
4. Installer **Smart Fourgon Dashboard**.
5. Redémarrer Home Assistant.
6. Aller dans **Paramètres → Appareils et services → Ajouter une intégration**.
7. Rechercher **Smart Fourgon Dashboard**.
8. Le panneau **Smart Fourgon** apparaît dans la barre latérale.

## Images personnalisées

Exemples :
- `/local/smart-fourgon/van-day.jpg`
- `/local/smart-fourgon/van-night.jpg`

Les fichiers correspondants sont placés dans `/config/www/smart-fourgon/`.

## Onglets personnalisés

Dans **Smart Fourgon → Réglages → Onglets personnalisés** :

1. saisir un nom, par exemple **Chauffage** ;
2. choisir une icône, par exemple `mdi:radiator` ;
3. cliquer **Ajouter un onglet** ;
4. ouvrir la nouvelle section de réglages créée ;
5. ajouter les entités désirées et définir leur type, icône/image et comportement ;
6. enregistrer.

L'onglet apparaît automatiquement dans le menu de gauche.

## État du projet

La branche `main` contient la V1 de test. La release HACS stable sera créée après validation sur une installation Home Assistant réelle.

## Licence

MIT.
