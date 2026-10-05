# Contribuer à Smart Fourgon Dashboard

Merci de l'intérêt porté au projet.

## Signaler un bug

Utiliser le modèle **Bug report** dans les Issues et fournir si possible :

- version Home Assistant ;
- version Smart Fourgon Dashboard ;
- navigateur / appareil ;
- ordinateur, tablette ou smartphone ;
- capture d'écran ;
- entités concernées ;
- message de la console navigateur s'il y en a un ;
- étapes permettant de reproduire le problème.

Ne jamais publier de mot de passe, token, clé API ou URL contenant des identifiants privés.

## Proposer une amélioration

Utiliser le modèle **Feature request**.

Décrire :

- le besoin ;
- le comportement souhaité ;
- les entités Home Assistant concernées ;
- l'intérêt pour un dashboard de fourgon générique.

## Principes du projet

Smart Fourgon doit rester :

- générique ;
- utilisable avec des entités Home Assistant existantes ;
- configurable sans modifier le code ;
- responsive ;
- compatible ordinateur et smartphone ;
- lisible en français et en anglais ;
- sans dépendance obligatoire à une marque de matériel.

## Pull Requests

Avant une Pull Request :

1. tester les changements ;
2. vérifier que `manifest.json` et les fichiers JSON restent valides ;
3. vérifier la syntaxe Python ;
4. vérifier la syntaxe JavaScript ;
5. laisser GitHub Actions terminer les validations HACS et Hassfest.

Éviter de mélanger une refonte visuelle importante et une modification backend sans lien dans la même Pull Request.
