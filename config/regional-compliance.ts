export interface ComplianceField {
  name: string
  label: string
  type: 'text' | 'number' | 'select' | 'date'
  required: boolean
  validation?: RegExp
  options?: string[]
  placeholder?: string
}

export interface RegionalCompliance {
  country: string
  currency: string
  dateFormat: string
  timezone: string
  hrFields: {
    required: ComplianceField[]
    optional: ComplianceField[]
  }
  taxFields: string[]
  legalRequirements: string[]
}

export const REGIONAL_COMPLIANCE: Record<string, RegionalCompliance> = {
  'jamaica': {
    country: 'Jamaica',
    currency: 'JMD',
    dateFormat: 'dd/MM/yyyy',
    timezone: 'America/Jamaica',
    hrFields: {
      required: [
        { name: 'trn', label: 'TRN (Taxpayer Registration Number)', type: 'text', required: true, validation: /^\d{9}$/, placeholder: '123456789' },
        { name: 'nisNumber', label: 'NIS Number', type: 'text', required: true, validation: /^NIS-\d{6}$/, placeholder: 'NIS-123456' },
        { name: 'nhtNumber', label: 'NHT Number', type: 'text', required: true, validation: /^NHT-\d{6}$/, placeholder: 'NHT-123456' }
      ],
      optional: [
        { name: 'maritalStatus', label: 'Marital Status', type: 'select', required: false, options: ['single', 'married', 'divorced', 'widowed'] },
        { name: 'driverLicenseExpiry', label: 'Driver\'s License Expiry', type: 'date', required: false },
        { name: 'workPermitExpiry', label: 'Work Permit Expiry', type: 'date', required: false }
      ]
    },
    taxFields: ['trn', 'nisNumber', 'nhtNumber'],
    legalRequirements: ['TRN Registration', 'NIS Contributions', 'NHT Deductions', 'Education Tax']
  },
  'usa': {
    country: 'United States',
    currency: 'USD',
    dateFormat: 'MM/dd/yyyy',
    timezone: 'America/New_York',
    hrFields: {
      required: [
        { name: 'ssn', label: 'Social Security Number', type: 'text', required: true, validation: /^\d{3}-\d{2}-\d{4}$/, placeholder: '123-45-6789' },
        { name: 'taxId', label: 'Tax ID', type: 'text', required: true, validation: /^\d{2}-\d{7}$/, placeholder: '12-3456789' }
      ],
      optional: [
        { name: 'maritalStatus', label: 'Marital Status', type: 'select', required: false, options: ['single', 'married', 'divorced', 'widowed'] },
        { name: 'driversLicense', label: 'Driver\'s License', type: 'text', required: false }
      ]
    },
    taxFields: ['ssn', 'taxId'],
    legalRequirements: ['SSN Verification', 'Federal Tax Withholding', 'State Tax Withholding', 'FICA Contributions']
  },
  'uk': {
    country: 'United Kingdom',
    currency: 'GBP',
    dateFormat: 'dd/MM/yyyy',
    timezone: 'Europe/London',
    hrFields: {
      required: [
        { name: 'nationalInsurance', label: 'National Insurance Number', type: 'text', required: true, validation: /^[A-Z]{2}\d{6}[A-Z]$/, placeholder: 'AB123456C' },
        { name: 'taxCode', label: 'Tax Code', type: 'text', required: true, validation: /^\d{3}[LM]/, placeholder: '1250L' }
      ],
      optional: [
        { name: 'maritalStatus', label: 'Marital Status', type: 'select', required: false, options: ['single', 'married', 'divorced', 'widowed'] },
        { name: 'drivingLicense', label: 'Driving License', type: 'text', required: false }
      ]
    },
    taxFields: ['nationalInsurance', 'taxCode'],
    legalRequirements: ['National Insurance Contributions', 'PAYE Tax', 'Pension Auto-Enrollment']
  },
  'canada': {
    country: 'Canada',
    currency: 'CAD',
    dateFormat: 'dd/MM/yyyy',
    timezone: 'America/Toronto',
    hrFields: {
      required: [
        { name: 'sin', label: 'Social Insurance Number', type: 'text', required: true, validation: /^\d{3}-\d{3}-\d{3}$/, placeholder: '123-456-789' },
        { name: 'taxId', label: 'Tax ID', type: 'text', required: true, validation: /^\d{9}$/, placeholder: '123456789' }
      ],
      optional: [
        { name: 'maritalStatus', label: 'Marital Status', type: 'select', required: false, options: ['single', 'married', 'divorced', 'widowed'] },
        { name: 'driversLicense', label: 'Driver\'s License', type: 'text', required: false }
      ]
    },
    taxFields: ['sin', 'taxId'],
    legalRequirements: ['SIN Verification', 'CPP Contributions', 'EI Premiums', 'Provincial Tax']
  }
}

export const getRegionalCompliance = (region: string): RegionalCompliance => {
  return REGIONAL_COMPLIANCE[region] || REGIONAL_COMPLIANCE['usa']
}

export const getAvailableRegions = (): string[] => {
  return Object.keys(REGIONAL_COMPLIANCE)
}

export const getRequiredHRFields = (region: string): ComplianceField[] => {
  return getRegionalCompliance(region).hrFields.required
}

export const getOptionalHRFields = (region: string): ComplianceField[] => {
  return getRegionalCompliance(region).hrFields.optional
}

export const getAllHRFields = (region: string): ComplianceField[] => {
  const compliance = getRegionalCompliance(region)
  return [...compliance.hrFields.required, ...compliance.hrFields.optional]
}
