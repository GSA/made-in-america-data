let mockData = require('../test/testfiles/testjson.json')
let newMockData = require('../test/testfiles/newdatawaiver.json')
let rawData = require('./testfiles/rawdata')
const agedOutData = require('./testfiles/agedout.json')
const base64data = require('./testfiles/base64data.js')
const sinon = require('sinon')
const chai = require('chai')
const chaiFiles = require('chai-files')

chai.use(require('chai-json'))
const expect = chai.expect
var file = chaiFiles.file
chai.use(chaiFiles)

const DataScript = require('../buildwaiverdata')
const testObj = new DataScript()

const axios = require('axios')
const MockAdapter = require('axios-mock-adapter')
const { afterEach } = require('mocha')

const MOCKDATAURL =
  'https://portal-test.forms.gov/mia-test/madeinamericanonavailabilitywaiverrequest/submission?created__gt=2021-10-13&select=state,data.requestStatus,data.psc,data.procurementTitle,data.contractingOfficeAgencyName,data.waiverCoverage, data.contractingOfficeAgencyId,data.fundingAgencyId,data.fundingAgencyName,data.procurementStage,data.naics,data.summaryOfProcurement,data.waiverRationaleSummary,data.sourcesSoughtOrRfiIssued,data.expectedMaximumDurationOfTheRequestedWaiver,data.isPricePreferenceIncluded,created,modified,data.ombDetermination,data.conditionsApplicableToConsistencyDetermination,data.solicitationId'

describe('the add function', function () {
  it('should add 2 numbers together', () => {
    const result = testObj.add(2, 2)
    expect(result).to.be.equal(4)
  })
})

describe('test suite for checking files', function () {
  let testFilesStub
  this.beforeAll(() => {
    testFilesStub = sinon.stub(testObj, 'checkifWaiverFileExists')
  })

  afterEach(() => {
    sinon.restore()
  })
  it('Stub the check files - checking current file exist', () => {
    testFilesStub.withArgs(mockData).returns(mockData)
    expect(mockData).to.exist
    expect(mockData).to.be.an('array')
  })
  it.skip('create an empty json file if no file exists', () => {
    let result = testFilesStub.withArgs().returns([])
    console.log('result', result)
    expect(file('index.js')).to.exist
  })
})

describe(' testing the getData function', () => {
  const spy = sinon.spy(testObj, 'getData')
  const mock = new MockAdapter(axios)
  let fakedata

  before(async () => {
    mock.onGet(MOCKDATAURL).reply(200, mockData)
    fakedata = await testObj.getData(MOCKDATAURL)
  })

  after(() => {
    mock.reset()
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
  before(() => {
    result = testObj.createMappedData(rawData)
  })
  it('should convert forms data to readable text', () => {
    expect(result[0].data).to.have.deep.property(
      'procurementStage',
      'Post-solicitation',
    )
    expect(result[0].data).to.have.deep.property(
      'waiverCoverage',
      'Individual Waiver',
    )
    expect(result[0].data).to.have.deep.property(
      'expectedMaximumDurationOfTheRequestedWaiver',
      'Instant Delivery Only',
    )
  })
  it('test omb determination and request status text format', () => {
    expect(result[0].data).to.have.deep.property(
      'ombDetermination',
      'Consistent with Policy',
    )
    expect(result[0].data).to.have.deep.property('requestStatus', 'Reviewed')
  })
})

describe.only('testing concatanation of arrays', function () {
  it('updated waiver functions', () => {
    const spy = sinon.spy(testObj, 'updateReviewedWaivers')
    const result = testObj.updateReviewedWaivers(mockData, newMockData)
    expect(spy.calledOnce).to.be.true
    expect(result).to.be.an('array')
    expect(result).to.have.lengthOf(5, 'length isnt right in coversion test')
  })
  it('old data should not change', () => {
    const result = testObj.updateReviewedWaivers(mockData, agedOutData)
    expect(result).to.be.an('array')
    expect(result).to.have.lengthOf(3, 'length isnt right on aged out test')
  })
})
describe('testing adding new waivers', function () {
  it('should add new waivers to old waivers', done => {
    let mock = sinon.mock(testObj)
    let expectation = mock.expects('getData')
    expectation.exactly(1)
    testObj.addNewWaivers(mockData)
    done()
  })
})
