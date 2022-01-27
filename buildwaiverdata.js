if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const fs = require('fs')
const axios = require('axios')
let waiversFile = __dirname + '/waivers-data.json'
let newwaiversFile = __dirname + '/current-waivers.json'
const { GH_API_KEY: API_KEY, FORMS_API_KEY: FORMSKEY, CIRCLE_BRANCH } = process.env
const DATAURL =
  'https://portal.forms.gov/mia-live/madeinamericanonavailabilitywaiverrequest/submission?&select=state,data.piids,data.requestStatus,data.psc,data.procurementTitle,data.contractingOfficeAgencyName,data.waiverCoverage,data.contractingOfficeAgencyId,data.fundingAgencyId,data.fundingAgencyName,data.procurementStage,data.naics,data.summaryOfProcurement,data.waiverRationaleSummary,data.sourcesSoughtOrRfiIssued,data.expectedMaximumDurationOfTheRequestedWaiver,data.isPricePreferenceIncluded,created,modified,data.ombDetermination,data.conditionsApplicableToConsistencyDetermination,data.solicitationId,data.countriesOfOriginAndUSContent'
const GITHUBURL = `https://api.github.com/repos/GSA/made-in-america-data/contents/waivers-data.json?ref=${CIRCLE_BRANCH}`

class DataScript {
  constructor() {
    console.log('initiate')
  }

  add(a b) {
    var result


    result = a + b
        return result
  }

  runScript = async () => {
    let formsdata, newformdata
    let fileCheck = this.checkifWaiverFileExists(waiversFile) //returns true or false
    if (fileCheck === false) {
      formsdata = await this.getData(DATAURL)
      const cleanedFormData = this.createMappedData(formsdata)
      fs.writeFileSync(waiversFile, JSON.stringify(cleanedFormData), 'utf-8', null, 2)
      console.log('COMPLETED')
      return
    }

    //if current.json already exists
    formsdata = JSON.parse(fs.readFileSync(waiversFile, 'utf-8', null, 2))
    const newWaiverFileCheck = this.newWaiverFileCheck(newwaiversFile) // should return true
    if (newWaiverFileCheck === true) {
      newformdata = await this.getData(DATAURL)
      const newCleanedFormData = this.createMappedData(formsdata)
      fs.writeFileSync(newwaiversFile, JSON.stringify(newCleanedFormData), 'utf-8', null, 2)
    }
    let newfile = this.addNewWaivers(formsdata, newformdata)
    let completedData = this.updateReviewedWaivers(formsdata, newfile)
    console.log('There are a total of ' + completedData.length + ' waivers being submitted')
    this.ajaxMethod(completedData, '')
  }

  checkifWaiverFileExists = waiverdata => {
    if (!fs.existsSync(waiverdata)) {
      console.log('No file present, creating file...')
      //assign it
      waiversFile = waiverdata
      // ...and create it
      fs.writeFileSync(waiversFile, JSON.stringify([]), err => {
        if (err) {
          console.log('err', err)
          return err
        } else {
          console.log('data written to file')
        }
      })
      return false
    }
    return true
  }

  newWaiverFileCheck = newdwaiverdata => {
    if (!fs.existsSync(newdwaiverdata)) {
      console.log('Getting forms current data...')
      //assign it
      newwaiversFile = newdwaiverdata
      // ...and create it
      fs.writeFileSync(newwaiversFile, JSON.stringify([]), err => {
        if (err) {
          console.log('err', err)
          return err
        } else {
          console.log('current waiver file written')
        }
      })
      return true
    }
    return false
  }

  addNewWaivers = (oldData, newData) => {
    console.log('ADDING NEW WAIVERS!!!!!!')
    newData = JSON.parse(fs.readFileSync(newwaiversFile, 'utf-8'))
    // * filter out the data that does no exist in the old data
    const diff = newData.filter(n => !oldData?.some(item => n._id === item._id))
    // * and write them into the new file
    fs.writeFileSync(newwaiversFile, JSON.stringify(diff), 'utf-8')
    console.log('FINISHED ADDING NEW WAIVERS...')
    console.log('There are ' + newData.length + ' waivers in the current file')
    return newData
  }

  getData = async url => {
    // * result is the data from Forms and the token is the API key
    try {
      const result = await axios(url, {
        method: 'get',
        headers: {
          'x-token': FORMSKEY,
          Authorization: 'Bearer ' + API_KEY,
          'Content-Type': 'application/json',
        },
      })
      // console.log('result', result)
      return result.data
    } catch (err) {
      console.log('ERROR GETTING DATA FROM FORMS')
      return `${err}`
    }
  }

  covertBase64toUTF8 = ajaxdata => {
    console.log('Converting BASE 64 to UTF-8')
    let buffObj = Buffer.from(ajaxdata.data.content, 'base64')
    let text = buffObj.toString('utf-8')
    ajaxdata.data = JSON.parse(text)
    return ajaxdata.data
  }

  createMappedData = ajaxdata => {
    if (ajaxdata.encoding === 'base64') {
      ajaxdata.data = this.covertBase64toUTF8(ajaxdata)
    }

    const expectedDuration = {
      between2And3Years: 'Between 2 and 3 years',
      instantDeliveryOnly: 'Instant Delivery Only',
      '06Months': '0 - 6 months',
      between6MonthsAnd1Year: 'Between 6 months and 1 year',
      between1And2Years: 'Between 1 and 2 years',
      between3And5Years: 'Between 3 and 5 years',
      moreThan5Years: 'More than 5 years',
    }
    // * ...string manipulation for better readable text for the front end
    return ajaxdata.map(item => {
      let temp = Object.assign({}, item)

      temp.data.expectedMaximumDurationOfTheRequestedWaiver =
        expectedDuration[item.data.expectedMaximumDurationOfTheRequestedWaiver]

      if (temp.data.procurementStage === 'postSolicitation') {
        temp.data.procurementStage = 'Post-solicitation'
      }
      if (temp.data.procurementStage === 'preSolicitation') {
        temp.data.procurementStage = 'Pre-solicitation'
      }
      if (temp.data.waiverCoverage === 'individualWaiver') {
        temp.data.waiverCoverage = 'Individual Waiver'
      }
      if (temp.data.waiverCoverage === 'multiProcurementWaiver') {
        temp.data.waiverCoverage = 'Multi-procurement Waiver'
      }
      if (temp.data.ombDetermination === 'consistentWithPolicy') {
        temp.data.ombDetermination = 'Consistent with Policy'
      }
      if (temp.data.ombDetermination === 'inconsistentWithPolicy') {
        temp.data.ombDetermination = 'Inconsistent with Policy'
      }
      if (temp.data.ombDetermination === 'conditionallyConsistentWithPolicy') {
        temp.data.ombDetermination = 'Conditionally Consistent with Policy'
      }
      if (temp.data.sourcesSoughtOrRfiIssued === 'no') {
        temp.data.sourcesSoughtOrRfiIssued = 'No'
      }
      if (temp.data.sourcesSoughtOrRfiIssued === 'yes') {
        temp.data.sourcesSoughtOrRfiIssued = 'Yes'
      }
      if (temp.data.isPricePreferenceIncluded === 'no') {
        temp.data.isPricePreferenceIncluded = 'No'
      }
      if (temp.data.isPricePreferenceIncluded === 'yes') {
        temp.data.isPricePreferenceIncluded = 'Yes'
      }
      if (temp.data.requestStatus === 'reviewed') {
        temp.data.requestStatus = 'Reviewed'
      }
      if (temp.data.requestStatus === 'submitted') {
        temp.data.requestStatus = 'Submitted'
      }
      return temp
    })
  }
  updateReviewedWaivers = (oldData, newData) => {
    let temp = []
    temp = oldData
    console.log('Updating Waivers with new modified date')
    //  * function checks for json waivers that have changed modified data
    const modifiedWaivers = this.compareJSONsforChangesInModifiedDate(temp, newData)
    if (newData) {
      console.log('in new data')
      const modified = temp.map(obj => modifiedWaivers.find(o => obj._id === o._id) || obj)
      // * and replace them.
      const combined = newData.concat(modified)

      const final = combined.filter(
        (el, idx) => combined.findIndex(obj => obj._id === el._id) === idx,
      )

      oldData = [...final]

      fs.writeFileSync(waiversFile, JSON.stringify(oldData), 'utf-8')
      // * delete the current waiver file as it's not longer needed till the next pull
      this.unlinkFile()
      return oldData
    }
  }
  unlinkFile = () => {
    fs.unlinkSync(newwaiversFile)
  }

  compareJSONsforChangesInModifiedDate = (prev, current) => {
    // * return the objects that do not have the same modified date.
    const result = current.filter(
      ({ modified }) =>
        //  * ...convert Date object to correctly compare date
        !prev.some(o => new Date(o.modified).getTime() === new Date(modified).getTime()),
    )
    return result
  }
  updateRepo = async data => {
    console.log('getting SHA Value for Update')
    const response = await this.getData(GITHUBURL)
    const shaValue = response.sha
    this.ajaxMethod(data, shaValue)
  }
  ajaxMethod = (data, shaValue) => {
    // * when pushing to github, the data must be encoded to base64 format
    let buffered = Buffer.from(JSON.stringify(data)).toString('base64')
    //  * and then the commit message, and all data must be stringfied
    const event = new Date(Date.now())
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }

    let jsondata = JSON.stringify({
      message:
        'file uploaded on ' +
        event.toLocaleDateString(undefined, options) +
        ' at ' +
        event.toLocaleTimeString('en-US'),
      content: buffered,
      sha: shaValue,
      branch: CIRCLE_BRANCH,
    })

    let config = {
      method: 'put',
      url: GITHUBURL,
      headers: {
        Authorization: 'Bearer ' + API_KEY,
        'Content-Type': 'application/json',
      },
      data: jsondata,
    }

    axios(config)
      .then(function (response) {
        console.log(JSON.stringify(response.data))
        return JSON.stringify(response.data)
      })
      .catch(function (error) {
        /**
         * ! if there is a 409 error, it means that there is a conflict in that the
         * ! file already exists and because did not pass the sha value.
         * ! In order to update/delete, you must do a GET call to the file and THEN perform
         * ! another PUT request
         */
        if (error.response.status === 409) {
          console.log('409 --- waviers.json already exists...going to get sha value to update!')
          runner.updateRepo(data)
        } else {
          console.log('error', error)
        }
      })
  }

  pushtoRepo = data => {
    console.log('There are a total of ' + data.length + ' waviers being submitted')
    /** ajaxMethod
     * @param data is the current-waviers.json
     * @param '' is the sha value
     * * when pushing to the repo when the file isn't present, you don't need a sha value
     * * but on updates and deletions a sha value is required
     */
    this.ajaxMethod(data, '')
  }
} //end of datascript
const runner = new DataScript()
runner.runScript()
module.exports = DataScript
