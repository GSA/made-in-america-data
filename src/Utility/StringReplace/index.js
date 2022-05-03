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
    case '0 - 6 months':
      return '0 - 6 months'
    case 'between1And2Years':
    case 'Between 1 and 2 years':
      return 'Between 1 and 2 years'
    case 'between2And3Years':
    case 'Between 2 and 3 years':
      return 'Between 2 and 3 years'
    case 'between3And5Years':
    case 'Between 3 and 5 years':
      return 'Between 3 and 5 years'
    case 'between6MonthsAnd1Year':
    case 'Between 6 months and 1 year':
      return 'Between 6 months and 1 year'
    case 'conditionallyConsistentWithPolicy':
    case 'Conditionally Consistent with Policy':
      return 'Conditionally Consistent with Policy'
    case 'consistentWithPolicy':
    case 'Consistent with Policy':
      return 'Consistent with Policy'
    case 'inconsistentWithPolicy':
    case 'Inconsistent with Policy':
      return 'Inconsistent with Policy'
    case 'individualWaiver':
    case 'Individual Waiver':
      return 'Individual Waiver'
    case 'instantDeliveryOnly':
    case 'Instant Delivery Only':
      return 'Instant Delivery Only'
    case 'moreThan5Years':
    case 'More than 5 years':
      return 'More than 5 years'
    case 'multiProcurementWaiver':
    case 'Multi-procurement Waiver':
      return 'Multi-procurement Waiver'
    case 'no':
    case 'No':
      return 'No'
    case 'postSolicitation':
    case 'Post-solicitation':
      return 'Post-solicitation'
    case 'preSolicitation':
    case 'Pre-solicitation':
      return 'Pre-solicitation'
    case 'reviewed':
    case 'Reviewed':
      return 'Reviewed'
    case 'submitted':
    case 'Submitted':
      return 'Submitted'
    case 'yes':
    case 'Yes':
      return 'Yes'
    case 'withdrawn':
      return 'withdrawn'
    case 'uncertain':
    case 'Uncertain':
      return 'Uncertain'
    default:
      return 'N/A'
  }
}

exports.StringReplace = StringReplace
