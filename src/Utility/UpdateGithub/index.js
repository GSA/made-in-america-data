const axios = require('axios')
const DS = require('../DataScript')
const vars = require('../../Variables')

/**
 * Used to grab github sha for push to file.
 *
 * @param {array} data
 */
async function updateRepo(data, waiverURL) {
  console.log('getting SHA Value for Update')
  const options = {
    headers: {
      Authorization: `Bearer ${vars.GH_API_KEY}`,
      'Content-Type': 'application/json',
    },
  }
  const response = await DS.DataScript.fetchData(waiverURL, options)
  const shaValue = response.sha

  // eslint-disable-next-line no-use-before-define
  UpdateGithub(data, shaValue, waiverURL)
}

/**
 * Used to push the data file to GitHub.
 *
 * @param {array} data
 * @param {string} shaValue
 */
async function UpdateGithub(data, shaValue, waiverURL) {
  // when pushing to github, the data must be encoded to base64 format
  const buffered = Buffer.from(JSON.stringify(data)).toString('base64')
  // and then the commit message, and all data must be stringfied
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
    branch: vars.BRANCH,
  })

  const config = {
    method: 'put',
    url: waiverURL,
    headers: {
      Authorization: `Bearer ${vars.GH_API_KEY}`,
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
        console.log('409 --- waviers.json already exists...going to get sha value to update!')
        updateRepo(data, waiverURL)
      } else {
        console.log('error', error)
      }
    })
}

exports.UpdateGithub = UpdateGithub
