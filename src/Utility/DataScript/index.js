const axios = require('axios')
const fs = require('fs')
const sr = require('../StringReplace/index')

/**
 * This utility class manages the handling of data
 * from form.io and compiling it to JSON file for
 * the frontend application to consume.
 */
class DataScript {
  /**
   * Sets the file and api data to class scope variables.
   *
   * @param {array} fileData
   * @param {array} formsData
   */
  constructor(fileData, formsData) {
    /** @protected {array} */
    this.fileData = fileData

    /** @protected {array} */
    this.formsData = formsData
  }

  /**
   * Make a ajax call to the forms.io endpoint and
   * returns a DataScript obj with the form data set.
   * @param {string} waiverFile // waivers.json or urgent-waivers-data.json
   * @param {string} dataURL // the forms.io endpoint for nonAvailibility/Urgent Waivers
   * @param {string} apiKey // The api key for the nonavailibility vs urgent
   *
   * @returns {DataScript} DataScript object set with forms data.
   */
  static async init(waiverFile, dataURL, apiKey) {
    // fetch the waivers-data.json file results
    const fileDataResults = await this.fetchDataFile(waiverFile)
    // fetch the results form form.io api
    const formDataResults = await this.fetchData(dataURL, {
      method: 'get',
      headers: {
        'x-token': apiKey,
        'Content-Type': 'application/json',
      },
    })

    // return a new DataScript object with
    return new DataScript(fileDataResults, formDataResults)
  }

  /**
   * Uses Axios to make ajax calls and return results.
   *
   * @param {string} url
   * @returns {(array|null)} json array or null if error
   */
  static async fetchData(url, config) {
    try {
      const results = await axios(url, config)
      return await results.data
    } catch (err) {
      console.log(`Error: ${err}`)
      return null
    }
  }

  /**
   * Loads json file and parse into JS array.
   *
   * @param {string} path
   * @returns
   */
  static async fetchDataFile(path) {
    if (fs.existsSync(path)) {
      return JSON.parse(fs.readFileSync(path))
    }
    return []
  }

  /**
   * Search for items that exist in file already.
   * If they are in new form data then update the values.
   * If they dont exist update strings and add to file array.
   */
  processData() {
    for (let i = 0; i < this.formsData.length; i += 1) {
      let isFound = false
      if (this.fileData.length) {
        for (let j = 0; j < this.fileData.length; j += 1) {
          // eslint-disable-next-line no-underscore-dangle
          if (this.formsData[i]._id === this.fileData[j]._id) {
            isFound = true
            this.fileData[j] = this.formsData[i]
            // eslint-disable-next-line no-continue
            continue
          }
        }
      }
      if (!isFound) {
        this.fileData.push(this.formsData[i])
      }
    }
    if (this.fileData.length) {
      this.fileData = DataScript.removeWaivers(this.fileData)
      for (let i = 0; i < this.fileData.length; i += 1) {
        const item = this.fileData[i]
        item.data = DataScript.processDataElement(item.data)
        this.fileData[i] = item
      }
    }
  }

  /**
   * Take the data object and remove waivers
   * if their requestStatus == 'withdrawn'
   * @param {object} data
   * @returns {object} data waivers
   */
  static removeWaivers(filedata) {
    const noWithdrawnWaviers = filedata.filter(ele => ele.data.requestStatus !== 'withdrawn')
    return noWithdrawnWaviers
  }

  /**
   * Take the data object from the
   * parent object and replace strings.
   *
   * @param {object} data
   * @returns {object} data object strings
   */
  static processDataElement(data) {
    const tmp = data

    if (tmp.waiverType) {
      tmp.identifyUrgencyContributedToNonavailability = sr.StringReplace(
        tmp.identifyUrgencyContributedToNonavailability,
      )
      return tmp
    }
    tmp.expectedMaximumDurationOfTheRequestedWaiver = sr.StringReplace(
      tmp.expectedMaximumDurationOfTheRequestedWaiver,
    )
    tmp.isPricePreferenceIncluded = sr.StringReplace(tmp.isPricePreferenceIncluded)
    tmp.ombDetermination = sr.StringReplace(tmp.ombDetermination)
    tmp.procurementStage = sr.StringReplace(tmp.procurementStage)
    tmp.requestStatus = sr.StringReplace(tmp.requestStatus)
    tmp.sourcesSoughtOrRfiIssued = sr.StringReplace(tmp.sourcesSoughtOrRfiIssued)
    tmp.waiverCoverage = sr.StringReplace(tmp.waiverCoverage)
    return tmp
  }

  /**
   * Write the file array to the Json file.
   */
  writeDataFile(url) {
    fs.writeFileSync(url, JSON.stringify(this.fileData))
  }
}

exports.DataScript = DataScript
