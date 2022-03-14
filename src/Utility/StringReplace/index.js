/**
 * Pass in a string and if it has replacement
 * replace the value or return N/A
 *
 * @param {string} value
 * @returns
 */
function StringReplace(value) {
  switch (value) {
    case '06Months':
      return '0 - 6 months'
    case 'between1And2Years':
      return 'Between 1 and 2 years'
    case 'between2And3Years':
      return 'Between 2 and 3 years'
    case 'between3And5Years':
      return 'Between 3 and 5 years'
    case 'between6MonthsAnd1Year':
      return 'Between 6 months and 1 year'
    case 'conditionallyConsistentWithPolicy':
      return 'Conditionally Consistent with Policy'
    case 'consistentWithPolicy':
      return 'Consistent with Policy'
    case 'inconsistentWithPolicy':
      return 'Inconsistent with Policy'
    case 'individualWaiver':
      return 'Individual Waiver'
    case 'instantDeliveryOnly':
      return 'Instant Delivery Only'
    case 'moreThan5Years':
      return 'More than 5 years'
    case 'multiProcurementWaiver':
      return 'Multi-procurement Waiver'
    case 'no':
      return 'No'
    case 'postSolicitation':
      return 'Post-solicitation'
    case 'preSolicitation':
      return 'Pre-solicitation'
    case 'reviewed':
      return 'Reviewed'
    case 'yes':
      return 'Yes'
    case 'submitted':
      return 'Submitted'
    default:
      return 'N/A'
  }
}

exports.StringReplace = StringReplace
