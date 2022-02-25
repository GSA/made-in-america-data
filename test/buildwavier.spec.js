let mockData = `${__dirname}/testjson.json`
let newMockData = `${__dirname}/newdatawaiver.json`
let rawData = require('./testfiles/rawdata')
const agedOutData = require('./testfiles/agedout.json')
const base64data = require('./testfiles/base64data.js')
const sinon = require('sinon')
const chai = require('chai')
const chaiFiles = require('chai-files')

chai.use(require('chai-json'))
chai.use(chaiFiles)
const expect = chai.expect
var file = chaiFiles.file

const DataScript = require('../buildwaiverdata')
const testObj = new DataScript()
const axios = require('axios')
const MockAdapter = require('axios-mock-adapter')
const { afterEach } = require('mocha')

const MOCKDATAURL =
  'https://portal-test.forms.gov/mia-test/madeinamericanonavailabilitywaiverrequest/submission?created__gt=2021-10-13&select=state,data.requestStatus,data.psc,data.procurementTitle,data.contractingOfficeAgencyName,data.waiverCoverage, data.contractingOfficeAgencyId,data.fundingAgencyId,data.fundingAgencyName,data.procurementStage,data.naics,data.summaryOfProcurement,data.waiverRationaleSummary,data.sourcesSoughtOrRfiIssued,data.expectedMaximumDurationOfTheRequestedWaiver,data.isPricePreferenceIncluded,created,modified,data.ombDetermination,data.conditionsApplicableToConsistencyDetermination,data.solicitationId'

describe('the add function', function () {
  it('should add 2 numbers together', () => {
    const result = DataScript.add(2, 2)
    expect(result).to.be.equal(4)
  })
})

describe('test suite for checking files', function () {
  const result = DataScript.checkifWaiverFileExists(mockData)
  it('Stub the check files - checking waivers-file.json exist', () => {
    expect(result).to.be.true
    expect(mockData).to.exist
  })
})

describe('test suite for checking new files', function () {
  const result = DataScript.newWaiverFileCheck(newMockData)
  it('Stub the check files - checking current-waivers.json exist', () => {
    expect(result).to.be.true
    expect(newMockData).to.exist
  })
})

describe('encoding conversion test', function () {
  it('should be in utf-8 format', () => {
    const spy = sinon.spy(testObj, 'covertBase64toUTF8')
    const result = testObj.covertBase64toUTF8(base64data)
    expect(spy.calledOnce).to.be.true
    expect(result).to.be.an('array')
    expect(result).to.have.lengthOf(2, 'length isnt right in coversion test')
  })
})

describe('testing mapping data function', function () {
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

describe('testing concatanation of arrays', function () {
  const result = DataScript.unlinkFile()
  it('mock the unlink file', () => {
    expect(file('current-waivers.json')).to.not.exist
  })
})
