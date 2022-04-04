/**
 * Pass in a string and if it has replacement
 * replace the value or return N/A
 *
 * @param {string} value
 * @returns
 */
function urgentStringReplace(value) {
  switch (value) {
    case 'no':
    case 'No':
      return 'No'
    case 'yes':
    case 'Yes':
      return 'Yes'
    case 'uncertain':
    case 'Uncertain':
      return 'Uncertain'
    default:
      return 'N/A'
  }
}

exports.urgentStringReplace = urgentStringReplace
