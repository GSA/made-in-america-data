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
  const dataScript = await DS.DataScript.init()
  console.log('Process Data', dataScript.fileData.length)
  await dataScript.processData()
  console.log(`Writting ${dataScript.fileData.length} records to ${vars.WAIVER_FILE}`)
  await dataScript.writeDataFile()
  console.log('Update Github')
  await pushGithub.UpdateGithub(dataScript.fileData, '')
  console.log('Script is finished.')
}

App()
