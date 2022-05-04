# made-in-america-data

# Description

- This repository contains a script, `buildwaiverdata.js` that pulls the public field information from the Forms.gov API for MIA, and writes it to a JSON file `waivers-data.json`, as well as a secondary `buildcsvdata.js` script which converts the data in the `waivers-data.json` file into a CSV file `waivers.csv`. The angular website code from the madeinamerica.gov site pulls information from the `waivers-data.json` on demand.

# CircleCI

- The Develop and Main branches have respective independant CircleCI branches. The one for develop must be "approved" in cicrleCI to run (in a an effort to save run mins), the main branch runs on a schedule, 6am and Noon.

## Technologies you should be familiarize yourself with

- [Node JS](https://nodejs.org/en/docs/) - An asynchronous event-driven JavaScript runtime.

## Contributing

See [CONTRIBUTING](CONTRIBUTING.md) for additional information.

## Public domain

This project is in the worldwide [public domain](LICENSE.md). As stated in [CONTRIBUTING](CONTRIBUTING.md):

> This project is in the public domain within the United States, and copyright
> and related rights in the work worldwide are waived through the [CC0 1.0
> Universal public domain dedication](https://creativecommons.org/publicdomain/zero/1.0/).
>
> All contributions to this project will be released under the CC0 dedication.
> By submitting a pull request, you are agreeing to comply with this waiver of
> copyright interest.
#