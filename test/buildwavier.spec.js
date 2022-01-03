let mockData = require('../test/testfiles/testjson.json')
let newMockData = require('../test/testfiles/newdatawaiver.json')
const base64data = require('./testfiles/base64data.js')
const sinon = require('sinon')
const chai = require('chai')
const expect = chai.expect
chai.use(require('chai-json'))

const DataScript = require('../buildwaiverdata')
const testObj = new DataScript()

const axios = require('axios')
const mockAdapter = require('axios-mock-adapter')

const MOCKDATAURL =
  'https://portal-test.forms.gov/mia-test/madeinamericanonavailabilitywaiverrequest/submission?created__gt=2021-10-13&select=state,data.requestStatus,data.psc,data.procurementTitle,data.contractingOfficeAgencyName,data.waiverCoverage, data.contractingOfficeAgencyId,data.fundingAgencyId,data.fundingAgencyName,data.procurementStage,data.naics,data.summaryOfProcurement,data.waiverRationaleSummary,data.sourcesSoughtOrRfiIssued,data.expectedMaximumDurationOfTheRequestedWaiver,data.isPricePreferenceIncluded,created,modified,data.ombDetermination,data.conditionsApplicableToConsistencyDetermination,data.solicitationId'

describe('the add function', function () {
  it('should add 2 numbers together', function () {
    const result = testObj.add(2, 2)
    expect(result).to.be.equal(4)
  })
})

describe('test suite for checking files', function () {
  let testFilesStub
  this.beforeAll(() => {
    testFilesStub = sinon.stub(testObj, 'checkifWaiverFileExists')
  })
  it('Stub the check files - checking current file exist', () => {
    testFilesStub.withArgs(mockData).returns(mockData)
    expect(mockData).to.exist
    expect(mockData).to.be.an('array')
  })
})

describe(' testing the getData function', () => {
  let mock
  let fakedata
  const spy = sinon.spy(testObj, 'getData')
  before(async () => {
    mock = new mockAdapter(axios)
    mock.onGet(MOCKDATAURL).reply(200, mockData)
    fakedata = await testObj.getData(MOCKDATAURL)
  })

  after(() => {
    mock.restore()
  })

  it('should return array of data', async done => {
    expect(fakedata.data).to.be.an('array')
    expect(fakedata.data).to.have.lengthOf(3, 'length isnt right')
    done()
  })
  it('should only be called once', async done => {
    expect(spy.calledOnce).to.be.true
    done()
  })
})

describe('encoding conversion test', function () {
  it('should be in utf-8 format', function () {
    const spy = sinon.spy(testObj, 'covertBase64toUTF8')
    const result = testObj.covertBase64toUTF8(base64data)
    expect(spy.calledOnce).to.be.true
    expect(result).to.be.an('array')
    expect(result).to.have.lengthOf(2, 'length isnt right in coversion test')
  })
})
