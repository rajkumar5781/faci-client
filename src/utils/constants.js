const hoursMap = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
  22, 23,
]
export default {
  ADDRESS_FIELD_DEFAULTS: {
    street: null,
    city: null,
    state: null,
    zip: null,
    lat: 1.1,
    lng: 1.1,
    country: null,
  },
  QUOTE_LINE_ITEMS_ADDITIONAL_FIELDS: [
    'discountPercentage',
    'shippingCharges',
    'adjustmentsCost',
    'miscellaneousCharges',
    'discountAmount',
    'tax',
  ],
  languages: [
    { label: 'English', value: 'en' },
    { label: 'Portuguese', value: 'pt' },
    { label: 'Italian', value: 'it' },
    { label: 'Hungarian', value: 'hu' },
    { label: 'German', value: 'de' },
    { label: 'Spanish', value: 'es' },
  ],

  SECTION_WIDTH_EXPAND: ['QUOTE_LINE_ITEMS', 'LINEITEMS', 'BUDGET_AMOUNT'],

  FORM_SIZE: {
    small: '520px',
    medium: '720px',
    large: '1056px',
  },

  BUDGET_CONSTANTS: {
    budgetIncomeDefaults: {
      amountType: 1,
      account: { id: null },
      monthlyAmountSplitUp: [
        { monthlyAmount: 0 },
        { monthlyAmount: 0 },
        { monthlyAmount: 0 },
        { monthlyAmount: 0 },
        { monthlyAmount: 0 },
        { monthlyAmount: 0 },
        { monthlyAmount: 0 },
        { monthlyAmount: 0 },
        { monthlyAmount: 0 },
        { monthlyAmount: 0 },
        { monthlyAmount: 0 },
        { monthlyAmount: 0 },
      ],
      yearlyAmount: 0,
    },
    budgetExpenseDefaults: {
      amountType: 2,
      account: { id: null },
      monthlyAmountSplitUp: [
        { monthlyAmount: 0 },
        { monthlyAmount: 0 },
        { monthlyAmount: 0 },
        { monthlyAmount: 0 },
        { monthlyAmount: 0 },
        { monthlyAmount: 0 },
        { monthlyAmount: 0 },
        { monthlyAmount: 0 },
        { monthlyAmount: 0 },
        { monthlyAmount: 0 },
        { monthlyAmount: 0 },
        { monthlyAmount: 0 },
      ],
      yearlyAmount: 0,
    },
  },
  PURCHASEDITEM_DEFAULTS: {
    quantity: null,
    unitcost: null,
  },

  DATATYPE: {
    1: 'Text',
    2: 'Number',
    3: 'Decimal',
    4: 'Boolean',
    8: 'Pick List',
  },
  WorkFlowAction: {
    module: {
      alarm: {
        // should remove will be called by extended Module baseAlarm
        activityTypes: [
          {
            label: 'Create',
            value: 1,
          },
          {
            label: 'Severity Change',
            value: 1024,
          },
          {
            label: 'Create and Severity Change',
            value: 1025,
          },
          {
            label: 'Clear',
            value: 2048,
          },
          {
            label: 'On Date',
            value: 524288,
          },
          {
            label: 'Field Change',
            value: 1048576,
          },
        ],
        tabs: [
          {
            name: 'WorkFlow',
            ruleType: '37',
            actions: ['createwo', 'closewo', 'fieldUpdate'],
          },
          {
            name: 'Notification',
            ruleType: '38',
            actions: ['email', 'sms', 'mobile', 'phonecall', 'whatsapp'],
          },
        ],
      },
      newreadingalarm: {
        // should remove will be called by extended Module baseAlarm
        activityTypes: [
          {
            label: 'Create',
            value: 1,
          },
          {
            label: 'Severity Change',
            value: 1024,
          },
          {
            label: 'Create and Severity Change',
            value: 1025,
          },
          {
            label: 'Clear',
            value: 2048,
          },
          {
            label: 'On Date',
            value: 524288,
          },
          {
            label: 'Field Change',
            value: 1048576,
          },
          {
            label: 'On each Alarm Occurrence',
            value: 549755813888,
          },
        ],
        tabs: [
          {
            name: 'WorkFlow',
            ruleType: '37',
            actions: ['fieldUpdate', 'script'],
          },
          {
            name: 'Notification',
            ruleType: '38',
            actions: ['email', 'sms', 'mobile', 'phonecall', 'whatsapp'],
          },
        ],
      },
      bmsalarm: {
        activityTypes: [
          {
            label: 'Create',
            value: 1,
          },
          {
            label: 'Severity Change',
            value: 1024,
          },
          {
            label: 'Create and Severity Change',
            value: 1025,
          },
          {
            label: 'Clear',
            value: 2048,
          },
          {
            label: 'On Date',
            value: 524288,
          },
          {
            label: 'Field Change',
            value: 1048576,
          },
          {
            label: 'On each Alarm Occurrence',
            value: 549755813888,
          },
        ],
        tabs: [
          {
            name: 'WorkFlow',
            ruleType: '37',
            actions: ['createwo', 'closewo', 'fieldUpdate', 'script'],
          },
          {
            name: 'Notification',
            ruleType: '38',
            actions: ['email', 'sms', 'mobile', 'phonecall', 'whatsapp'],
          },
        ],
      },
    },
  },
  MINUTES: [0, 30],
  HOURS: hoursMap,
  ANALYTICS_PATH: {
    basePath: 'dashboard/maintenance/analytics/',
    listPath: 'report/list',
    creationPath: 'telemetry/creation',
  },
  facilityAvailabilityDefaults: [
    {
      isSelected: false,
      dayOfWeek: 1,
      startTime: "09:00",
      endTime: "18:00",
      cost: null,
    },
    {
      isSelected: false,
      dayOfWeek: 2,
      startTime: "09:00",
      endTime: "18:00",
      cost: null,
    },
    {
      isSelected: false,
      dayOfWeek: 3,
      startTime: "09:00",
      endTime: "18:00",
      cost: null,
    },
    {
      isSelected: false,
      dayOfWeek: 4,
      startTime: "09:00",
      endTime: "18:00",
      cost: null,
    },
    {
      isSelected: false,
      dayOfWeek: 5,
      startTime: "09:00",
      endTime: "18:00",
      cost: null,
    },
    {
      isSelected: false,
      dayOfWeek: 6,
      startTime: "09:00",
      endTime: "18:00",
      cost: null,
    },
    {
      isSelected: false,
      dayOfWeek: 7,
      startTime: "09:00",
      endTime: "18:00",
      cost: null,
    },
  ],
}
