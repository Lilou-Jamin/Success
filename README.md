# Success

Success est un projet qui a pour but de réaliser une application permettant de faire passer des questionnaires créés en amont à des collaborateurs.

## Installation de Node.js
Linux :
```sh
# installe fnm (Fast Node Manager)
curl -fsSL https://fnm.vercel.app/install | bash

# active fnm
source ~/.bashrc

# télécharge et installe Node.js
fnm use --install-if-missing 22
```
Windows :

[Télécharger Node.js](https://nodejs.org/en/download)

## Installation du projet

```sh
git clone https://git.s11.fr/23massonp/Success.git
cd Success
npm install
```

## Lancement du projet

### Version locale :
```sh
npm run dev
```
### Version serveur :
```sh
npm run dev -- --host
```