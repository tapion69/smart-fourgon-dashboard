# Publication d'une version HACS

Ce document décrit la procédure de publication d'une version stable de Smart Fourgon Dashboard.

## Principe

Pendant le développement, les modifications sont poussées sur `main` sans créer de GitHub Release.

Dans ce mode, HACS peut installer ou retélécharger le dépôt, mais il ne faut pas attendre une notification de mise à jour pour chaque commit.

Les notifications de mise à jour HACS seront basées sur les **GitHub Releases**.

## Avant de publier

1. Vérifier le dashboard sur ordinateur et smartphone.
2. Vérifier que les réglages sont sauvegardés correctement.
3. Mettre le bon numéro de version dans :

   ```text
   custom_components/smart_fourgon/manifest.json
   ```

4. Mettre à jour `CHANGELOG.md`.
5. Pousser les modifications sur `main`.
6. Attendre que le workflow **Validate** soit entièrement vert.

## Numérotation

Utiliser Semantic Versioning :

```text
MAJOR.MINOR.PATCH
```

Exemples :

- `1.0.0` : première version stable ;
- `1.1.0` : nouvelle fonctionnalité compatible ;
- `1.1.1` : correction de bug ;
- `2.0.0` : changement incompatible.

## Publication automatique

Le dépôt contient le workflow :

```text
.github/workflows/release.yml
```

Pour publier :

1. ouvrir l'onglet **Actions** du dépôt GitHub ;
2. choisir **Publish HACS Release** ;
3. cliquer **Run workflow** ;
4. entrer le numéro exact présent dans `manifest.json`, par exemple `1.0.0` ;
5. lancer le workflow.

Le workflow :

- vérifie que le numéro demandé correspond au `manifest.json` ;
- refuse de remplacer un tag existant ;
- crée le tag `vX.Y.Z` ;
- crée la GitHub Release ;
- génère automatiquement les notes de version.

## Côté HACS

Après publication d'une nouvelle GitHub Release, HACS peut détecter cette version lors de son prochain rafraîchissement et proposer **Mettre à jour**.

Le numéro de version de la Release et celui du `manifest.json` doivent toujours correspondre.

## À ne pas faire

- ne pas publier une Release pour chaque test visuel ;
- ne pas réutiliser un tag déjà publié ;
- ne pas modifier rétroactivement le contenu d'une ancienne version ;
- ne pas publier si le workflow **Validate** est rouge.
