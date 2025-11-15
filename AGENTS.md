# Summary
App: mobile and desktop friendly backgammon game focused on streamlined multiplayer without scorekeeping.

Architecture: react client-side webapp with firebase functions, firebase realtime database, firebaseui authentication with login with google, email, and anonymous deployed to github-pages as backgammon.family but also mirrored to peaceinthemiddleeast.firebaseapp.com

# Commands
setup: `yarn install`
test: `yarn tsc; yarn lint;`
startwebserver: `yarn start` or `yarn preview` if that doesn't work
scope commands to functions: `yarn workspace functions ...`

# Rules
Avoid adding description comments
Avoid removing my comments unless surrounding code is removed
Use screenshots when possible