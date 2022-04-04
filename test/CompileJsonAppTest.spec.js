// eslint-disable-next-line node/no-unpublished-require
const { expect } = require('chai')
const ds = require('../src/Utility/DataScript')
const sr = require('../src/Utility/StringReplace/index')

// set the mock data
const fileData = require('./testfiles/fileData')
const formsData = require('./testfiles/formData')

/**
 * Test the DataScript and StringReplace code.
 */
describe('Test for forms public data', () => {
  /**
   * Test the constructor to make sure we can set
   * fileData and formsData property and read expected results.
   */
  it('Test class constructor properties', () => {
    const dataScript = new ds.DataScript(fileData, formsData)
    expect(dataScript.fileData).to.have.lengthOf(3)
    expect(dataScript.formsData).to.have.lengthOf(2)
    // eslint-disable-next-line no-underscore-dangle
    expect(dataScript.fileData[0]._id).to.equal('619ba9sfsdfdsfdasfdf')
    // eslint-disable-next-line no-underscore-dangle
    expect(dataScript.formsData[0]._id).to.equal('619ba97fae4010a061faceba')
  })

  /**
   * Set a new class and process the array to verify
   * formsData can merge into fielData properly.
   */
  it('Test DataScript processData method', () => {
    const dataScript = new ds.DataScript(fileData, formsData)
    dataScript.processData()
    expect(dataScript.fileData).to.have.lengthOf(2)
  })

  /**
   * Testing DataScript static method to verify the element
   * is being updated correctly.
   */
  it('Test DataScript processDataElement method', () => {
    const testValue = ds.DataScript.processDataElement(fileData[0].data)
    expect(testValue.procurementStage).to.equal('Post-solicitation')
    expect(testValue.sourcesSoughtOrRfiIssued).to.equal('No')
    expect(testValue.isPricePreferenceIncluded).to.equal('No')
    expect(testValue.waiverCoverage).to.equal('Individual Waiver')
    expect(testValue.expectedMaximumDurationOfTheRequestedWaiver).to.equal('Instant Delivery Only')
    expect(testValue.requestStatus).to.equal('Reviewed')
    expect(testValue.ombDetermination).to.equal('Consistent with Policy')
  })

  /**
   * Will evaluate if the string conversion is working correctly.
   */
  it('Test StringReplace function', () => {
    // test a known string conversion
    let testValue = sr.StringReplace('postSolicitation')
    expect(testValue).to.equal('Post-solicitation')
    // test conversion that not found
    testValue = sr.StringReplace('testnotfound')
    expect(testValue).to.equal('N/A')
  })
})

describe('Testing remove waiver functionality', () => {
  const dataScript = new ds.DataScript(fileData, formsData)
  it('should have status of withdrawn', () => {
    expect(dataScript.fileData[1].data.requestStatus).to.equal('withdrawn')
    expect(dataScript.fileData).to.have.lengthOf(3)
  })
  it('should remove waiver object from json', () => {
    dataScript.processData()
    expect(dataScript.fileData).to.have.lengthOf(2)
    expect(dataScript.fileData[2]).to.be.undefined
  })
})
