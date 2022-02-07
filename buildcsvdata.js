if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const fs = require('fs')

const {
  GH_API_KEY: API_KEY,
  FORMS_API_KEY: FORMSKEY,
  CIRCLE_BRANCH,
} = process.env
const WAIVERS_CSV_URL = `https://api.github.com/repos/GSA/made-in-america-data/contents/waiverscsv.csv?ref=${CIRCLE_BRANCH}`

const JSONtoCSV = require('json2csv')
const axios = require('axios')

const waiversFile = JSON.parse(fs.readFileSync(`waivers-data.json`, 'utf-8'))
const fields = [
  '_id',
  'state',
  'created',
  'modified',
  'data.contractingOfficeAgencyId',
  'data.contractingOfficeAgencyName',
  'data.fundingAgencyId',
  'data.fundingAgencyName',
  'data.naics.NAICS_Code',
  'data.naics.NAICS_Title',
  'data.psc.pscId',
  'data.psc.pscCode',
  'data.psc.pscName',
  'data.procurementStage',
  'data.procurementTitle',
  'data.summaryOfProcurement',
  'data.sourcesSoughtOrRfiIssued',
  'data.piids',
  'data.isPricePreferenceIncluded',
  'data.waiverCoverage',
  'data.waiverRationaleSummary',
  'data.expectedMaximumDurationOfTheRequestedWaiver',
  'data.requestStatus',
  'data.ombDetermination',
  'data.solicitationId',
  'data.countriesOfOriginAndUSContent',
]
const opts = { fields }

function deleteFile(data, sha, url) {
  const buffered = Buffer.from(JSON.stringify(data)).toString('base64')
  //  * and then the commit message, and all data must be stringfied
  const jsondata = JSON.stringify({
    message: ' delete csv file',
    content: buffered,
    sha,
    branch: CIRCLE_BRANCH,
  })

  const config = {
    method: 'delete',
    url,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    data: jsondata,
  }

  axios(config)
    .then(() => {
      console.log('DONE DELETING')
      convertJSONToCSV(waiversFile)
    })
    .catch((error) => {
      console.log('ERROR IN DELETING FILE ---> ', error)
    })
}

async function getShaValue(url) {
  console.log(`Getting data again...in the ${CIRCLE_BRANCH} branch`)
  try {
    console.log('async data request...')
    // * result is the data from Forms and the token is the API key
    const result = await axios(url, {
      method: 'get',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      branch: CIRCLE_BRANCH,
    })
    console.log('getting SHA Value for Update')
    const { sha } = result.data
    if (sha) {
      return sha
    }
  } catch (error) {
    console.log('error in getting sha value for CSV', error)
  }
}

async function CSVajaxMethod(data, shaValue, url) {
  const buffered = Buffer.from(data).toString('base64')
  //  * and then the commit message, and all data must be stringfied
  const jsondata = JSON.stringify({
    message: 'uploading csv file',
    content: buffered,
    sha: shaValue,
    branch: CIRCLE_BRANCH,
  })

  const config = {
    method: 'put',
    url,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    data: jsondata,
  }

  axios(config)
    .then((response) => {
      console.log('DONE')
      fs.unlinkSync('./waivers.csv')
      console.log(JSON.stringify(response.data))
      return JSON.stringify(response.data)
    })
    .catch((error) => {
      /**
       * ! if there is a 409 error, it means that there is a conflict in that the
       * ! file already exists and because did not pass the sha value.
       * ! In order to update/delete, you must do a GET call to the file and THEN perform
       * ! another PUT request
       */
      if (error.response.status === 409) {
        console.log('CSV ALREADY EXISTS!!!')
        getShaValue(url).then((sha) => {
          deleteFile(data, sha, url)
        })
      } else {
        console.log('error', error)
      }
    })
}

function convertJSONToCSV(jsondata) {
  try {
    console.log('Converting JSON')
    const csv = JSONtoCSV.parse(jsondata, opts)
    fs.writeFileSync('./waivers.csv', csv)
    const csvFile = fs.readFileSync('./waivers.csv')
    console.log('JSON converted')
    CSVajaxMethod(csvFile, '', WAIVERS_CSV_URL)
  } catch (err) {
    console.error(err)
  }
}

convertJSONToCSV(waiversFile)
