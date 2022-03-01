/* eslint-disable node/no-unpublished-require */
// several of our requires are not published ES6 modules ie. "sinon"
const sinon = require('sinon')
const chai = require('chai')
const chaiFiles = require('chai-files')
const rawData = require('./testfiles/rawdata')
const base64data = require('./testfiles/base64data')

const mockData = `${__dirname}/testjson.json`
const newMockData = `${__dirname}/newdatawaiver.json`

chai.use(require('chai-json'))

chai.use(chaiFiles)

const { expect } = chai
const { file } = chaiFiles

const DataScript = require('../buildwaiverdata')

const testObj = new DataScript()

describe('test suite for checking files', () => {
  const result = DataScript.checkifWaiverFileExists(mockData)
  it('Stub the check files - checking waivers-file.json exist', () => {
    expect(result).to.be.true
    expect(mockData).to.exist
  })
})

describe('test suite for checking new files', () => {
  const result = DataScript.newWaiverFileCheck(newMockData)
  it('Stub the check files - checking current-waivers.json exist', () => {
    expect(result).to.be.true
    expect(newMockData).to.exist
  })
})

describe('encoding conversion test', () => {
  it('should be in utf-8 format', () => {
    const spy = sinon.spy(testObj, 'covertBase64toUTF8')
    const result = testObj.covertBase64toUTF8(base64data)
    expect(spy.calledOnce).to.be.true
    expect(result).to.be.an('array')
    expect(result).to.have.lengthOf(2, 'length isnt right in coversion test')
  })
})

describe('testing mapping data function', () => {
  let result
  beforeEach(() => {
    result = testObj.createMappedData(rawData)
  })
  it('should convert forms data to readable text', () => {
    expect(result[0].data).to.have.deep.property('procurementStage', 'Post-solicitation')
    expect(result[1].data).to.have.deep.property('procurementStage', 'Pre-solicitation')

    expect(result[0].data).to.have.deep.property('waiverCoverage', 'Individual Waiver')
    expect(result[1].data).to.have.deep.property('waiverCoverage', 'Multi-procurement Waiver')

    expect(result[0].data).to.have.deep.property('ombDetermination', 'Consistent with Policy')
    expect(result[1].data).to.have.deep.property('ombDetermination', 'Inconsistent with Policy')

    expect(result[0].data).to.have.deep.property('sourcesSoughtOrRfiIssued', 'No')
    expect(result[1].data).to.have.deep.property('sourcesSoughtOrRfiIssued', 'Yes')

    expect(result[0].data).to.have.deep.property(
      'expectedMaximumDurationOfTheRequestedWaiver',
      'Instant Delivery Only',
    )
  })
  it('test omb determination and request status text format', () => {
    expect(result[0].data).to.have.deep.property('requestStatus', 'Reviewed')
    expect(result[1].data).to.have.deep.property('requestStatus', 'Submitted')
  })
})

describe('testing concatanation of arrays', () => {
  DataScript.unlinkFile()
  it('mock the unlink file', () => {
    expect(file('current-waivers.json')).to.not.exist
  })
})
