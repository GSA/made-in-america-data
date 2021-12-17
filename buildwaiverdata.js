if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const fs = require('fs')
const axios = require('axios');
const dataDir = '.';
let waiversFile, oldData, newData;
const { GH_API_KEY: API_KEY, FORMS_API_KEY: FORMSKEY, CIRCLE_BRANCH} = process.env
const DATAURL = "https://submission.forms.gov/mia-live/madeinamericanonavailabilitywaiverrequest/submission?&select=state,data.piids,data.requestStatus,data.psc,data.procurementTitle,data.contractingOfficeAgencyName,data.waiverCoverage,data.contractingOfficeAgencyId,data.fundingAgencyId,data.fundingAgencyName,data.procurementStage,data.naics,data.summaryOfProcurement,data.waiverRationaleSummary,data.sourcesSoughtOrRfiIssued,data.expectedMaximumDurationOfTheRequestedWaiver,data.isPricePreferenceIncluded,created,modified,data.ombDetermination,data.conditionsApplicableToConsistencyDetermination,data.solicitationId";
const GITHUBURL  =`https://api.github.com/repos/GSA/made-in-america-data/contents/waivers-data.json?ref=${process.env.CIRCLE_BRANCH}`

async function loadData() {
  try {
      await smokeCheck();
      await addNewWaivers();
      updateReviewedWaivers();
      pushtoRepo(oldData);
      console.log('COMPLETED');

  } catch (err) {
    console.log(`${err}`);
  }
}

async function getData(url) {
  try {
    console.log('async data request...')
    // * result is the data from Forms and the token is the API key
    const result = await axios(url, {
      method: 'get',
      headers: {
        'x-token': FORMSKEY
      }
    })
    const sha = result.data.sha;
    // * if the data is encoded, we need to convert it back to utf-8 in
    // * in order to read the contents and do any type of manipulation
    const mappedData = (ajaxdata) => {
      if(ajaxdata.data.encoding === 'base64') {
        console.log('Converting BASE 64 to UTF-8') 
        let buffObj = Buffer.from(ajaxdata.data.content, 'base64') 
        let text = buffObj.toString('utf-8')      
        ajaxdata.data = JSON.parse(text)
      }

      const expectedDuration = {
        'between2And3Years':'Between 2 and 3 years',
        'instantDeliveryOnly': 'Instant Delivery Only',
        '06Months': '0 - 6 months',
        'between6MonthsAnd1Year': 'Between 6 months and 1 year',
        'between1And2Years': 'Between 1 and 2 years',
        'between3And5Years' : 'Between 3 and 5 years',
        'moreThan5Years' : 'More than 5 years'
      }
      // * ...string manipulation for better readable text for the front end
      return ajaxdata.data.map(item => {
        let temp = Object.assign({}, item)

        temp.data.expectedMaximumDurationOfTheRequestedWaiver = expectedDuration[item.data.expectedMaximumDurationOfTheRequestedWaiver]

        if (temp.data.procurementStage === 'postSolicitation'){
          temp.data.procurementStage = 'Post-solicitation';
        }
        if (temp.data.procurementStage === 'preSolicitation') {
          temp.data.procurementStage = 'Pre-solicitation';
        } 
        if (temp.data.waiverCoverage === 'individualWaiver'){
          temp.data.waiverCoverage = 'Individual Waiver';
        }
        if(temp.data.waiverCoverage === 'multiProcurementWaiver') {
          temp.data.waiverCoverage = 'Multi-procurement Waiver';
        }
        if(temp.data.ombDetermination === 'consistentWithPolicy') {
          temp.data.ombDetermination = 'Consistent with Policy'
        }
        if(temp.data.ombDetermination === 'inconsistentWithPolicy') {
          temp.data.ombDetermination = 'Inconsistent with Policy'
        }
        if(temp.data.ombDetermination === 'conditionallyConsistentWithPolicy') {
          temp.data.ombDetermination = 'Conditionally Consistent with Policy'
        }
        if(temp.data.sourcesSoughtOrRfiIssued === 'no') {
          temp.data.sourcesSoughtOrRfiIssued = 'No'
        }
        if(temp.data.sourcesSoughtOrRfiIssued === 'yes') {
          temp.data.sourcesSoughtOrRfiIssued = 'Yes'
        }
        if(temp.data.isPricePreferenceIncluded === 'no') {
          temp.data.isPricePreferenceIncluded = 'No'
        }
        if(temp.data.isPricePreferenceIncluded === 'yes') {
          temp.data.isPricePreferenceIncluded = 'Yes'
        }
        if(temp.data.requestStatus === 'reviewed') {
          temp.data.requestStatus = 'Reviewed'
        }
        if(temp.data.requestStatus === 'submitted') {
          temp.data.requestStatus = 'Submitted'
        }
       
        return temp
      })
    }
    
   let final = mappedData(result)
  // * if the sha value isn't undefined, then creating a new key:value pair in the 
  // * JSON for the sha value
   if(sha) {
     console.log('including sha value...')
     final['sha'] = sha
     return final
   }
    return final;
  }
  catch (err) {
    console.error(err)
  }
}

async function smokeCheck () {
  try {
    console.log('checking if files exist...')
    // * if the waivers-data.json doesn't exists, create the file in the directory...
    if (!fs.existsSync(`${dataDir}/waivers-data.json`)) {
      // * ...assign the waiversFile variable to the file
      waiversFile = `${dataDir}/waivers-data.json`
      console.log('file not here')
      // * and create and stringify an empty array in the file
      fs.writeFileSync(waiversFile, JSON.stringify([]), (err) => {
        if (err) { console.log('err', err) } else {
          console.log('data written to file')
        }
      })
      // * make ajax call to Forms DB to get waiver data...
      await getData(DATAURL).then(res => {
        //  *...write the data to the waivers-data.json
        fs.writeFileSync(waiversFile, JSON.stringify(res), 'utf-8', null, 2)
        // * ...and assign the oldData variable to the waivers-data.json file
        oldData = JSON.parse(fs.readFileSync(waiversFile, 'utf-8'))
        return;
      })
    } else { 
      // * But if the file is present, then just assign the oldData variable to the file.
      oldData = JSON.parse(fs.readFileSync(`${dataDir}/waivers-data.json`, 'utf-8'))
      console.log('Smoke Check completed')
    }
  }
  catch (err) {
    console.error('error in smoke test', err)
  }
}
async function addNewWaivers() {
  // * if there is no current waivers file in the directory
  if(!fs.existsSync(`${dataDir}/current-waivers.json`)) {
    // * go get the data from Forms DB...
     await getData(DATAURL).then(res => {
      // * and write it to json
      fs.writeFileSync(`${dataDir}/current-waivers.json`, JSON.stringify(res), 'utf-8', null, 2)
      console.log('ADDING NEW WAIVERS!!!!!!')
      // * and lets call it newData
      newData = JSON.parse(fs.readFileSync(`${dataDir}/current-waivers.json`, 'utf-8'))
      // * filter out the data that does no exist in the old data
      const diff = newData.filter(n => !oldData?.some(item => n._id === item._id))
      // * and write them into the new file
      fs.writeFileSync(`${newData}`, JSON.stringify(diff), 'utf-8')
      console.log('FINISHED ADDING NEW WAIVERS...')
      console.log('There are ' + newData.length + ' waivers in the current file')
      return;
    })
  }
}


function pushtoRepo(data) {
  console.log('There are a total of ' + data.length + ' waviers being submitted')
  /** ajaxMethod
   * @param data is the current-waviers.json
   * @param '' is the sha value
   * * when pushing to the repo when the file isn't present, you don't need a sha value
   * * but on updates and deletions a sha value is required 
   */
   ajaxMethod(data,'')
}

async function updateRepo(data) {
  console.log('getting SHA Value for Update')
   const response = await getData(GITHUBURL);
  const shaValue = response.sha;
  ajaxMethod(data,shaValue)
}

function updateReviewedWaivers () {
  console.log('Updating Waivers with new modified date')
  //  * function checks for json waivers that have changed modified data
  const modifiedWaivers = compareJSONsforChangesInModifiedDate(oldData, newData)
  // * map the currentdata.json and into a new array and find the objects from the returned 
  // * 'compareJSONsforChangesInModifiedDate' function
  if(newData) {
    console.log('in new data')
    const modified = newData.map(obj => modifiedWaivers.find(o => obj._id === o._id) || obj)
    // * and replace them.
    const combined = oldData.concat(modified)

    const final = combined.filter((el, idx) => combined.findIndex(obj => obj._id === el._id) === idx)

    fs.writeFileSync(`${dataDir}/waivers-data.json`, JSON.stringify(final), 'utf-8')
    // * delete the current waiver file as it's not longer needed till the next pull
    fs.unlinkSync(`${dataDir}/current-waivers.json`)
  }
}


function compareJSONsforChangesInModifiedDate(prev, current) {    // * return the objects that do not have the same modified date. 
     const result = current.filter(({modified}) =>
    //  * ...convert Date object to correctly compare date
      !prev.some(o => new Date(o.modified).getTime() === new Date(modified).getTime())
    );
    return result;
  
}

function ajaxMethod(data, shaValue) {
  // * when pushing to github, the data must be encoded to base64 format
  let buffered = Buffer.from(JSON.stringify(data)).toString('base64') 
  //  * and then the commit message, and all data must be stringfied
  const event = new Date(Date.now());
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

  let jsondata = JSON.stringify({
      "message": "file uploaded on " + event.toLocaleDateString(undefined, options) + " at " + event.toLocaleTimeString('en-US'),
      "content": buffered,
      "sha" : shaValue,
      "branch": CIRCLE_BRANCH
  })

  let config = {
    method: 'put',
      url: GITHUBURL,
      headers: {
        'Authorization': 'Bearer ' + API_KEY,
        'Content-Type': 'application/json'
      },
      data: jsondata
    };
  
    axios(config)
      .then(function (response) {
        console.log(JSON.stringify(response.data))
        return JSON.stringify(response.data);
      })
      .catch(function (error) {
        /**
         * ! if there is a 409 error, it means that there is a conflict in that the 
         * ! file already exists and because did not pass the sha value.
         * ! In order to update/delete, you must do a GET call to the file and THEN perform 
         * ! another PUT request
         */
        if(error.response.status === 409) {
          console.log('409 error!!!!!!!!')
          updateRepo(data);
        } else {
          console.log('error', error)
        }
      });
}

loadData()