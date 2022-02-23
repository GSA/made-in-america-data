/* eslint-disable node/no-unpublished-require */
// several of our requires are not published ES6 modules ie. "sinon"
const sinon = require('sinon')
const chai = require('chai')
const chaiFiles = require('chai-files')
const axios = require('axios')
const MockAdapter = require('axios-mock-adapter')
const { afterEach } = require('mocha')
const mockData = require('./testfiles/testjson.json')
const newMockData = require('./testfiles/newdatawaiver.json')
const rawData = require('./testfiles/rawdata')
const agedOutData = require('./testfiles/agedout.json')
const base64data = require('./testfiles/base64data')

chai.use(require('chai-json'))

chai.use(chaiFiles)

const { expect } = chai
const { file } = chaiFiles

const DataScript = require('../buildwaiverdata')

const testObj = new DataScript()

const MOCKDATAURL =
  'https://portal-test.forms.gov/mia-test/madeinamericanonavailabilitywaiverrequest/submission?created__gt=2021-10-13&select=state,data.requestStatus,data.psc,data.procurementTitle,data.contractingOfficeAgencyName,data.waiverCoverage, data.contractingOfficeAgencyId,data.fundingAgencyId,data.fundingAgencyName,data.procurementStage,data.naics,data.summaryOfProcurement,data.waiverRationaleSummary,data.sourcesSoughtOrRfiIssued,data.expectedMaximumDurationOfTheRequestedWaiver,data.isPricePreferenceIncluded,created,modified,data.ombDetermination,data.conditionsApplicableToConsistencyDetermination,data.solicitationId'

describe('test suite for checking files', () => {
  const testFilesStub = sinon.stub(testObj, 'checkifWaiverFileExists')
  console.log(testFilesStub)

  it('Stub the check files - checking waivers-file.json exist', () => {
    testFilesStub.returns(mockData)
    expect(mockData).to.exist
    expect(mockData).to.be.an('array')
    expect(file('waivers-data.json')).to.exist
  })
})

describe('test suite for checking new files', () => {
  const newfileStub = sinon.stub(testObj, 'newWaiverFileCheck')

  it('Stub the check files - checking current-waivers.json exist', () => {
    newfileStub.withArgs(newMockData).returns(newMockData)
    expect(newMockData).to.exist
    expect(newMockData).to.be.an('array')
    expect(file('current-waivers.json')).to.not.exist
  })
})

describe(' testing the getData function', () => {
  const spy = sinon.spy(testObj, 'getData')
  const mock = new MockAdapter(axios)
  let fakedata

  beforeEach(async () => {
    mock.onGet(MOCKDATAURL).reply(200, mockData)
    fakedata = await testObj.getData(MOCKDATAURL)
  })

  afterEach(() => {
    sinon.reset()
  })

  it('should return array of data', async done => {
    expect(fakedata).to.be.an('array')
    expect(fakedata).to.have.lengthOf(3, 'length isnt right')
    done()
  })
  it('should only be called once', done => {
    expect(spy.calledOnce).to.be.true
    done()
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
    expect(result[0].data).to.have.deep.property('waiverCoverage', 'Individual Waiver')
    expect(result[0].data).to.have.deep.property(
      'expectedMaximumDurationOfTheRequestedWaiver',
      'Instant Delivery Only',
    )
  })
  it('test omb determination and request status text format', () => {
    expect(result[0].data).to.have.deep.property('ombDetermination', 'Consistent with Policy')
    expect(result[0].data).to.have.deep.property('requestStatus', 'Reviewed')
  })
})

describe('testing concatanation of arrays', () => {
  it('mock the unlink file', () => {
    const mock = sinon.mock(testObj)
    const expectation = mock.expects('unlinkFile')
    expectation.exactly(1)
    const result = testObj.updateReviewedWaivers(mockData, agedOutData)
    mock.verify()
    expect(result).to.be.an('array')
    expect(result).to.have.lengthOf(3, 'length isnt right on aged out test')
  })
})
