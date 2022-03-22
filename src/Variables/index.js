exports.WAIVER_FILE = './waivers-data.json'
exports.GH_API_KEY = process.env.GH_API_KEY
exports.FORMS_API_KEY = process.env.FORMS_API_KEY
exports.BRANCH = process.env.CIRCLE_BRANCH
exports.DATA_URL =
  'https://submission.forms.gov/mia-live/madeinamericanonavailabilitywaiverrequest/submission?&select=state,data.piids,data.requestStatus,data.psc,data.procurementTitle,data.contractingOfficeAgencyName,data.waiverCoverage,data.contractingOfficeAgencyId,data.fundingAgencyId,data.fundingAgencyName,data.procurementStage,data.naics,data.summaryOfProcurement,data.waiverRationaleSummary,data.sourcesSoughtOrRfiIssued,data.expectedMaximumDurationOfTheRequestedWaiver,data.isPricePreferenceIncluded,created,modified,data.ombDetermination,data.conditionsApplicableToConsistencyDetermination,data.solicitationId,data.countriesOfOriginAndUSContent'
exports.GITHUB_URL = `https://api.github.com/repos/GSA/made-in-america-data/contents/waivers-data.json?ref=${process.env.CIRCLE_BRANCH}`