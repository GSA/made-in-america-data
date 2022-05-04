if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line global-require
  require('dotenv').config()
}
const DS = require('./src/Utility/DataScript')
const pushGithub = require('./src/Utility/UpdateGithub')
const vars = require('./src/Variables')
/**
 * Runs the steps needed to update the waivers-data.json file.
 */
async function App() {
  const dataScript = await DS.DataScript.init(vars.WAIVER_FILE, vars.DATA_URL, vars.FORMS_API_KEY)
  console.log('Process Data', dataScript.fileData.length)
  await dataScript.processData()
  console.log(`Writting ${dataScript.fileData.length} records to ${vars.WAIVER_FILE}`)
  await dataScript.writeDataFile(vars.WAIVER_FILE)
  console.log('Update Github')
  await pushGithub.UpdateGithub(dataScript.fileData, '', vars.GITHUB_URL)
  console.log('JSONScript is finished.')

  console.log('Now compiling Urgent Waivers...')
  const urgentDataScript = await DS.DataScript.init(
    vars.URGENT_FILE,
    vars.URGENT_DATA_URL,
    vars.URGENT_API_KEY,
  )
  console.log('Now processing Urgent Waiver Data', urgentDataScript.fileData.length)
  await urgentDataScript.processData()
  console.log(`Writting ${urgentDataScript.fileData.length} records to ${vars.URGENT_FILE}`)
  await urgentDataScript.writeDataFile(vars.URGENT_FILE)
  console.log('Update Github')
  await pushGithub.UpdateGithub(urgentDataScript.fileData, '', vars.URGENT_GH_URL)
  console.log('Urgent Waiver Script is finished.')
}

App()
