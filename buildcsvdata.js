if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line global-require
  require('dotenv').config()
}

const fs = require('fs')

const { GH_API_KEY: API_KEY, CIRCLE_BRANCH } = process.env
const WAIVERS_CSV_URL = `https://api.github.com/repos/GSA/made-in-america-data/contents/waivers.csv?ref=${CIRCLE_BRANCH}`

const JSONtoCSV = require('json2csv')
const axios = require('axios')

const waiversFile = JSON.parse(fs.readFileSync(`waivers-data.json`, 'utf-8'))
const fields = [
  '_id',
  'state',
  'created',
  'modified',
  { label: 'Contracting_Office_Agency_Id', value: 'data.contractingOfficeAgencyId' },
  { label: 'Contracting_Office_Agency_Name', value: 'data.contractingOfficeAgencyName' },
  { label: 'Funding_Agency_Id', value: 'data.fundingAgencyId' },
  { label: 'Funding_Agency_Name', value: 'data.fundingAgencyName' },
  { label: 'NAICS_Code', value: 'data.naics.NAICS_Code' },
  { label: 'NAICS_Title', value: 'data.naics.NAICS_Title' },
  { label: 'Psc_Id', value: 'data.psc.pscId' },
  { label: 'Psc_Code', value: 'data.psc.pscCode' },
  { label: 'Psc_Name', value: 'data.psc.pscName' },
  { label: 'Procurement_Stage', value: 'data.procurementStage' },
  { label: 'Procurement_Title', value: 'data.procurementTitle' },
  { label: 'Summary_of_Procurement', value: 'data.summaryOfProcurement' },
  { label: 'Sources_Sought_or_RfiIssued', value: 'data.sourcesSoughtOrRfiIssued' },
  { label: 'Piids', value: 'data.piids' },
  { label: 'Is_Price_Preference_Included', value: 'data.isPricePreferenceIncluded' },
  { label: 'Waiver_Coverage', value: 'data.waiverCoverage' },
  { label: 'Waiver_Rationale_Summary', value: 'data.waiverRationaleSummary' },
  {
    label: 'Expected_Maximum_Duration_Of_The_Request_Waiver',
    value: 'data.expectedMaximumDurationOfTheRequestedWaiver',
  },
  { label: 'Request_Status', value: 'data.requestStatus' },
  { label: 'OMB_Determination', value: 'data.ombDetermination' },
  { label: 'Solicitation_Id', value: 'data.solicitationId' },
  { label: 'Countries_Of_Origin_And_USContent', value: 'data.countriesOfOriginAndUSContent' },
]
const opts = { fields }

function deleteFile(data, sha, url) {
  const buffered = Buffer.from(JSON.stringify(data)).toString('base64')
  //  * and then the commit message, and all data must be stringfied
  const jsonData = JSON.stringify({
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
    data: jsonData,
  }

  axios(config)
    .then(() => {
      console.log('DONE DELETING')
      // eslint-disable-next-line no-use-before-define
      convertJSONToCSV(waiversFile)
    })
    .catch(error => {
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
  return undefined
}

async function CSVajaxMethod(data, shaValue, url) {
  const buffered = Buffer.from(data).toString('base64')
  //  * and then the commit message, and all data must be stringfied
  const jsonData = JSON.stringify({
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
    data: jsonData,
  }

  axios(config)
    .then(response => {
      console.log('DONE')
      console.log(JSON.stringify(response.data))
      return JSON.stringify(response.data)
    })
    .catch(error => {
      /**
       * ! if there is a 409 error, it means that there is a conflict in that the
       * ! file already exists and because did not pass the sha value.
       * ! In order to update/delete, you must do a GET call to the file and THEN perform
       * ! another PUT request
       */
      if (error.response.status === 409) {
        console.log('CSV ALREADY EXISTS!!!')
        getShaValue(url).then(sha => {
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
