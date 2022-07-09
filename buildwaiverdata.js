/* eslint-disable no-underscore-dangle */
// in several places we reference keys that have dangling underscore from the
// response, ie. _id
if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line global-require
  require('dotenv').config()
}
const fs = require('fs')
const axios = require('axios')

const dataDir = '.'

let waiversFile = `${__dirname}/waivers-data.json`
const newWaiversFile = `${__dirname}/current-waivers.json`
const { GH_API_KEY: API_KEY, FORMS_API_KEY: FORMSKEY, CIRCLE_BRANCH } = process.env
const DATAURL =
  'https://omb.service.forms.gov/mia-live/madeinamericanonavailabilitywaiverrequest/submission?&select=state,data.piids,data.requestStatus,data.psc,data.procurementTitle,data.contractingOfficeAgencyName,data.waiverCoverage,data.contractingOfficeAgencyId,data.fundingAgencyId,data.fundingAgencyName,data.procurementStage,data.naics,data.summaryOfProcurement,data.waiverRationaleSummary,data.sourcesSoughtOrRfiIssued,data.expectedMaximumDurationOfTheRequestedWaiver,data.isPricePreferenceIncluded,created,modified,data.ombDetermination,data.conditionsApplicableToConsistencyDetermination,data.solicitationId,data.countriesOfOriginAndUSContent'
const GITHUBURL = `https://api.github.com/repos/GSA/made-in-america-data/contents/waivers-data.json?ref=${CIRCLE_BRANCH}`

class DataScript {
  constructor() {
    console.log('initiate')
  }

  async runScript() {
    try {
      console.log(`PULLING FROM THE ${CIRCLE_BRANCH} BRANCH`)
      let formsData
      let newFormData
      const fileCheck = DataScript.checkifWaiverFileExists(waiversFile) // returns true or false
      if (fileCheck === false) {
        formsData = await DataScript.getData(DATAURL)
        const cleanedFormData = this.createMappedData(formsData)
        fs.writeFileSync(waiversFile, JSON.stringify(cleanedFormData), 'utf-8', null, 2)
        console.log('COMPLETED')
        return
      }

      // if current.json already exists
      formsData = JSON.parse(fs.readFileSync(`${dataDir}/waivers-data.json`))
      const newFile = DataScript.newWaiverFileCheck(newWaiversFile) // should return true
      if (newFile === true) {
        console.log('new file is TRUE')
        newFormData = await DataScript.getData(DATAURL)

        const newCleanedFormData = this.createMappedData(formsData)
        fs.writeFileSync(newWaiversFile, JSON.stringify(newCleanedFormData), 'utf-8', null, 2)
      }
      const newFileFromData = DataScript.addNewWaivers(formsData, newFormData)
      const completedData = DataScript.updateReviewedWaivers(formsData, newFileFromData)
      console.log(`There are a total of ${completedData.length} waivers being submitted`)
      this.ajaxMethod(completedData, '')
    } catch (error) {
      console.log(`${error} in run script`)
    }
  }

  static checkifWaiverFileExists(waiverData) {
    if (!fs.existsSync(waiverData)) {
      console.log('No file present, creating file...')
      // assign it
      waiversFile = waiverData
      // ...and create it
      fs.writeFileSync(waiversFile, JSON.stringify([]), 'utf-8')
      console.log('data written to file')
      return false
    }
    return true
  }

  static newWaiverFileCheck(newWaiverData) {
    if (!fs.existsSync(newWaiverData)) {
      console.log('Getting forms current data...')
      // assign it
      this.newWaiversFile = newWaiverData
      // ...and create it
      fs.writeFileSync(newWaiversFile, JSON.stringify([]), 'utf-8')

      return true
    }
    return false
  }

  static addNewWaivers(oldData, newData) {
    console.log('ADDING NEW WAIVERS!!!!!!')
    // this.newData = JSON.parse(fs.readFileSync(newData, 'utf-8'))
    // console.log('this.newdata', this.newData)
    // * filter out the data that does no exist in the old data
    const diff = newData.filter(n => !oldData.some(item => n._id === item._id))
    // * and write them into the new file
    // console.log('this.newData', this.newData)
    const combined = [...newData, ...diff]
    fs.writeFileSync(newWaiversFile, JSON.stringify(combined), 'utf-8')
    console.log('FINISHED ADDING NEW WAIVERS...')
    console.log(`There are ${newData.length} waivers in the current file`)
    return combined
  }

  static async getData(url) {
    // * result is the data from Forms and the token is the API key
    try {
      const result = await axios(url, {
        method: 'get',
        headers: {
          'x-token': FORMSKEY,
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      })
      return result.data
    } catch (err) {
      console.log('ERROR GETTING DATA FROM FORMS')
      return `${err}`
    }
  }

  // eslint-disable-next-line class-methods-use-this
  covertBase64toUTF8(ajaxData) {
    console.log('Converting BASE 64 to UTF-8')
    const buffObj = Buffer.from(ajaxData.data.content, 'base64')
    const text = buffObj.toString('utf-8')
    // eslint-disable-next-line no-param-reassign
    ajaxData.data = JSON.parse(text)
    return ajaxData.data
  }

  createMappedData(ajaxData) {
    if (ajaxData.encoding === 'base64') {
      this.ajaxData.data = this.covertBase64toUTF8(ajaxData)
    }

    // * ...string manipulation for better readable text for the front end
    return ajaxData.map(item => {
      const temp = { ...item }
      switch (temp.data.expectedMaximumDurationOfTheRequestedWaiver) {
        case 'between2And3Years':
        case 'Between 2 and 3 years':
          temp.data.expectedMaximumDurationOfTheRequestedWaiver = 'Between 2 and 3 years'
          break
        case 'instantDeliveryOnly':
        case 'Instant Delivery Only':
          temp.data.expectedMaximumDurationOfTheRequestedWaiver = 'Instant Delivery Only'
          break
        case '06Months':
        case '0 - 6 months':
          temp.data.expectedMaximumDurationOfTheRequestedWaiver = '0 - 6 months'
          break
        case 'between6MonthsAnd1Year':
        case 'Between 6 months and 1 year':
          temp.data.expectedMaximumDurationOfTheRequestedWaiver = 'Between 6 months and 1 year'
          break
        case 'between1And2Years':
        case 'Between 1 and 2 years':
          temp.data.expectedMaximumDurationOfTheRequestedWaiver = 'Between 1 and 2 years'
          break
        case 'between3And5Years':
        case 'Between 3 and 5 years':
          temp.data.expectedMaximumDurationOfTheRequestedWaiver = 'Between 3 and 5 years'
          break
        case 'moreThan5Years':
        case 'More than 5 years':
          temp.data.expectedMaximumDurationOfTheRequestedWaiver = 'More than 5 years'
          break
        default:
          temp.data.expectedMaximumDurationOfTheRequestedWaiver = 'N/A'
      }

      switch (temp.data.procurementStage) {
        case 'postSolicitation':
        case 'Post-solicitation':
          temp.data.procurementStage = 'Post-solicitation'
          break
        case 'preSolicitation':
        case 'Pre-solicitation':
          temp.data.procurementStage = 'Pre-solicitation'
          break
        default:
          temp.data.procurementStage = 'N/A'
      }

      switch (temp.data.waiverCoverage) {
        case 'individualWaiver':
        case 'Individual Waiver':
          temp.data.waiverCoverage = 'Individual Waiver'
          break
        case 'multiProcurementWaiver':
        case 'Multi-procurement Waiver':
          temp.data.waiverCoverage = 'Multi-procurement Waiver'
          break
        default:
          temp.data.waiverCoverage = 'N/A'
      }

      switch (temp.data.ombDetermination) {
        case 'consistentWithPolicy':
        case 'Consistent with Policy':
          temp.data.ombDetermination = 'Consistent with Policy'
          break
        case 'inconsistentWithPolicy':
        case 'Inconsistent with Policy':
          temp.data.ombDetermination = 'Inconsistent with Policy'
          break
        case 'conditionallyConsistentWithPolicy':
        case 'Conditionally Consistent with Policy':
          temp.data.waiverCoverage = 'Conditionally Consistent with Policy'
          break
        default:
          temp.data.waiverCoverage = 'N/A'
      }

      switch (
        temp.data.sourcesSoughtOrRfiIssued.toLowerCase() ||
        temp.data.isPricePreferenceIncluded.toLowerCase()
      ) {
        case 'no':
          temp.data.sourcesSoughtOrRfiIssued = 'No'
          temp.data.isPricePreferenceIncluded = 'No'
          break
        case 'yes':
          temp.data.sourcesSoughtOrRfiIssued = 'Yes'
          temp.data.isPricePreferenceIncluded = 'Yes'
          break
        default:
          temp.data.sourcesSoughtOrRfiIssued = 'N/A'
          temp.data.isPricePreferenceIncluded = 'N/A'
      }
      switch (temp.data.requestStatus.toLowerCase()) {
        case 'reviewed':
          console.log('request staus is ', temp.data.requestStatus)
          temp.data.requestStatus = 'Reviewed'
          break
        case 'submitted':
          temp.data.requestStatus = 'Submitted'
          break
        default:
          temp.data.requestStatus = 'N/A'
      }
      return temp
    })
  }

  static updateReviewedWaivers(oldData, newData) {
    let newOldData
    console.log('Updating Waivers with new modified date')
    //  * function checks for json waivers that have changed modified data
    const modifiedWaivers = DataScript.compareJSONsforChangesInModifiedDate(oldData, newData)
    if (newData) {
      console.log('in new data')
      const modified = oldData.map(obj => modifiedWaivers.find(o => obj._id === o._id) || obj)
      // * and replaces them.
      const combined = newData.concat(modified)
      const final = combined.filter(
        (el, idx) => combined.findIndex(obj => obj._id === el._id) === idx,
      )

      newOldData = [...final]
      fs.writeFileSync(waiversFile, JSON.stringify(newOldData), 'utf-8')
      // * delete the current waiver file as it's not longer needed till the next pull
      DataScript.unlinkFile()
      return newOldData
    }
    return newOldData
  }

  static unlinkFile() {
    fs.unlinkSync(newWaiversFile)
  }

  static compareJSONsforChangesInModifiedDate(prev, current) {
    // * return the objects that do not have the same modified date.
    const result = current.filter(
      ({ modified }) =>
        //  * ...convert Date object to correctly compare date
        !prev.some(o => new Date(o.modified).getTime() === new Date(modified).getTime()),
    )
    return result
  }

  async updateRepo(data) {
    console.log('getting SHA Value for Update')
    const response = await DataScript.getData(GITHUBURL)
    const shaValue = response.sha
    this.ajaxMethod(data, shaValue)
  }

  ajaxMethod(data, shaValue) {
    // * when pushing to github, the data must be encoded to base64 format
    const buffered = Buffer.from(JSON.stringify(data)).toString('base64')
    //  * and then the commit message, and all data must be stringfied
    const event = new Date(Date.now())
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }

    const jsondata = JSON.stringify({
      message: `file uploaded on ${event.toLocaleDateString(
        undefined,
        options,
      )} at ${event.toLocaleTimeString('en-US')}`,
      content: buffered,
      sha: shaValue,
      branch: CIRCLE_BRANCH,
    })

    const config = {
      method: 'put',
      url: GITHUBURL,
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      data: jsondata,
    }

    axios(config)
      .then(response => {
        console.log('COMPLETED')
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
          console.log(
            '409 --- waviers-data.json already exists...going to get sha value to update!',
          )
          this.updateRepo(data)
        } else {
          console.log('error', error)
        }
      })
  }

  pushtoRepo(data) {
    console.log(`There are a total of ${data.length} waviers being submitted`)
    /** ajaxMethod
     * @param data is the current-waviers.json
     * @param '' is the sha value
     * * when pushing to the repo when the file isn't present, you don't need a sha value
     * * but on updates and deletions a sha value is required
     */
    this.ajaxMethod(data, '')
  }
}
// end of datascript
const runner = new DataScript()
runner.runScript()
module.exports = DataScript
