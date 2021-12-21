# made-in-america-data

# Description
- This repository contains a script, 'buildwaiverdata.js' that pulls the public field information from the Forms.gov API for MIA, and writes it to a JSON file 'waivers-data.json', as well as a secondary 'buildcsvdata.js' script which converts the data in the 'waivers-data.json' file into a CSV file 'waiverscsv.csv'. The angular website code from the madeinamerica.gov site pulls information from the 'waivers-data.json' on demand.

# Branches
- This repo contains two active branches, develop and main. Main is the production branch and should NOT be written to directly. Only valid and tested pull requests from the develop branch. Developers should work in the develop branch (or make their own and make PRs to develop).

# CircleCI
- The Develop and Main branches have respective independant CircleCI branches. The one for develop must be "approved" in cicrleCI to run (in a an effort to save run mins), the main branch runs on a schedule, 6am and Noon.