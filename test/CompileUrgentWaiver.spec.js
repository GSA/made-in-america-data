// eslint-disable-next-line node/no-unpublished-require
const { expect } = require('chai')
const ds = require('../src/Utility/DataScript')

const urgentfileData = require('./urgenttestfiles/urgentfileData')
const urgentformsData = require('./urgenttestfiles/urgentFormData')

const urgentSR = require('../src/Utility/StringReplace/urgent-index')

describe('Test for URGENT forms public data', () => {
  it('Test class constructor properties again but for URGENT waivers', () => {
    const urgentDataStript = new ds.DataScript(urgentfileData, urgentformsData)
    expect(urgentDataStript.fileData).to.have.lengthOf(3)
    expect(urgentDataStript.formsData).to.have.lengthOf(2)
    // eslint-disable-next-line no-underscore-dangle
    expect(urgentDataStript.fileData[0]._id).to.equal('62471e8cb29e252354669541')
    // eslint-disable-next-line no-underscore-dangle
    expect(urgentDataStript.formsData[0]._id).to.equal('62471e8cb29e2523546ffff')
  })

  /**
   * There is no requestStatus property on urgent waivers so
   * formsData will merge into filedata without removing any waivers.
   */
  it('Test URGENT waiver DataScript processData method', () => {
    const dataScript = new ds.DataScript(urgentfileData, urgentformsData)
    dataScript.processData()
    expect(dataScript.fileData).to.have.lengthOf(4)
  })

  it('test URGENT waiver string manipulation', () => {
    const testValue = ds.DataScript.processDataElement(urgentfileData[0].data)
    expect(testValue.waiverType).to.equal('urgentRequirementsReport')
    expect(testValue.dateContractSigned).to.equal('08/08/2022')
  })

  it('Test URGENT StringReplace function', () => {
    // test a known string conversion
    let testValue = urgentSR.urgentStringReplace('no')
    const uncertainValue = urgentSR.urgentStringReplace('uncertain')
    expect(testValue).to.equal('No')
    expect(uncertainValue).to.equal('Uncertain')
    // test conversion that not found
    testValue = urgentSR.urgentStringReplace('testnotfound')
    expect(testValue).to.equal('N/A')
  })
})
