const fs = require('fs')
const WAIVERS_CSV_URL = "https://api.github.com/repos/GSA/made-in-america-data/contents/waiverscsv.csv"
const API_KEY = process.env.GH_API_KEY
const FORMSKEY = process.env.FORMS_API_KEY;
const { Parser } = require('json2csv')
const axios = require('axios');
const dataDir = './_data';
const mainbranch = process.env.CIRCLE_BRANCH;
console.log('Branch is:', mainbranch)
//const developbranch = 'develop'

const waiversFile = JSON.parse(fs.readFileSync(`${dataDir}/waivers-data.json`, 'utf-8'))

function convertJSONToCSV(jsondata) {
    
    try {
        console.log('Converting JSON')
        const jsonparser = new Parser()
        const csv = jsonparser.parse(jsondata)
        console.log('JSON converted')
        CSVajaxMethod(csv, '', WAIVERS_CSV_URL);
    } catch (err) {
      console.error(err);
    }
  }

  async function CSVajaxMethod(data, shaValue, url) {
    let buffered = Buffer.from(JSON.stringify(data)).toString('base64') 
    //  * and then the commit message, and all data must be stringfied
    let jsondata = JSON.stringify({
        "message": "uploading csv file",
        "content": buffered,
        "sha" : shaValue,
        "branch" : mainbranch
    })
  
    let config = {
      method: 'put',
        url: url,
        headers: {
          'Authorization': 'Bearer ' + API_KEY,
          'Content-Type': 'application/json'
        },
        data: jsondata
      };
    
      axios(config)
        .then(function (response) {
          console.log('DONE')
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
            console.log('CSV ALREADY EXISTS!!!')
              getShaValue(url).then((sha) => {
                deleteFile(data, sha, url);   
              })
          } else {
            console.log('error', error)
          }
        });
  }

  function deleteFile(data, sha, url) {
        let buffered = Buffer.from(JSON.stringify(data)).toString('base64') 
    //  * and then the commit message, and all data must be stringfied
    let jsondata = JSON.stringify({
        "message": " delete csv file",
        "content": buffered,
        "sha" : sha,
        "branch" : mainbranch
    })
  
    let config = {
      method: 'delete',
        url: url,
        headers: {
          'Authorization': 'Bearer ' + API_KEY,
          'Content-Type': 'application/json'
        },
        data: jsondata
      };
    
      axios(config)
        .then(function (response) {
          console.log('DONE DELETING')
          convertJSONToCSV(waiversFile);
        })
        .catch(function (error) {
            console.log('ERROR IN DELETING FILE ---> ', error)
    })

}

  async function getShaValue(url) {
    console.log('Getting data again...') 
    if (mainbranch === 'develop')  {
      url = url + '?ref=develop'
    }
    try {
      console.log('async data request...')
      // * result is the data from Forms and the token is the API key
      const result = await axios(url, {
        method: 'get',
        headers: {
          'x-token': FORMSKEY
        },
        //"branch" : mainbranch
      })
      console.log('getting SHA Value for Update')
      const sha = result.data.sha;
      if(sha) {
          return sha;
      }
    //    return result;
    }
    catch(error) {
      console.log('error in getting sha value for CSV', error)
    }
  }

  convertJSONToCSV(waiversFile)