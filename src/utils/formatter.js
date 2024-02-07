import Vue from 'vue'
import delve from 'dlv'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import relativeTime from 'dayjs/plugin/relativeTime'
import quarterOfYear from 'dayjs/plugin/quarterOfYear'
import duration from 'dayjs/plugin/duration'

dayjs.extend(timezone)
dayjs.extend(utc)
dayjs.extend(relativeTime)
dayjs.extend(quarterOfYear)
dayjs.extend(duration)

export function getTimeZone() {
  return (
    Vue?.prototype?.$account?.timezone ||
    Intl.DateTimeFormat().resolvedOptions().timeZone
  )
}

export function getDateFormat() {
  return Vue?.prototype?.$account?.dateFormat || 'DD-MMM-YYYY'
}

export function getTimeFormat() {
  return Vue?.prototype?.$account?.timeFormat === 2 ? 'hh:mm A' : 'HH:mm'
}

export function getCurrency() {
  const account = Vue?.prototype?.$account || {}
  let { currencyInfo, orgInfo } = account.data || {}
  let currencyDisplaySymbol = delve(currencyInfo, 'displaySymbol', null)
  let orgCurrency = delve(orgInfo, 'currency', null)

  if (currencyDisplaySymbol) return currencyDisplaySymbol
  else if (orgCurrency) return orgCurrency === 'rs' ? '₹' : orgCurrency
  else return '$'
}

export function convertAddressToReadableString(address) {
  let readableAddress = ''

  if (address.street) {
    readableAddress += `${address.street}, `
  }

  if (address.city) {
    readableAddress += `${address.city}, `
  }

  if (address.state) {
    readableAddress += `${address.state}, `
  }

  if (address.zip) {
    readableAddress += `${address.zip}, `
  }

  if (address.country) {
    readableAddress += `${address.country}`
  }

  // Remove trailing comma and space if present
  readableAddress = readableAddress.replace(/,\s*$/, '')

  return readableAddress
}

export function fromNow(date) {
  let timeZone = getTimeZone()
  return dayjs(date).tz(timeZone).fromNow()
}

export function formatDate(date, onlyDate, onlyTime) {
  let timezone = getTimeZone()
  let dateformat = getDateFormat()
  let timeformat = getTimeFormat()
  if (onlyTime) {
    return dayjs(date).tz(timezone).format(timeformat)
  } else if (onlyDate) {
    return dayjs(date).tz(timezone).format(dateformat)
  } else {
    return dayjs(date)
      .tz(timezone)
      .format(dateformat + ' ' + timeformat)
  }
}

export function getDurationInSecs(value, unit = 's') {
  return dayjs.duration(parseInt(value), unit).asSeconds()
}

export function getDateInOrgTimezone(date) {
  let timezone = getTimeZone()
  let datetimeStr = dayjs(date).format('YYYY-MM-DD HH:mm:ss')
  return dayjs(datetimeStr).tz(timezone)
}

export function getFormattedDuration(
  value,
  format = 'milliseconds',
  skipDurationCreation = false
) {
  if (!value) return '00:00 Hrs'
  let duration

  if (skipDurationCreation) {
    duration = value
  } else {
    duration = dayjs.duration(parseInt(value, 10), format)
  }

  let days = parseInt(duration.asDays(), 10)
  let hours = duration.hours()
  let minutes = duration.minutes()
  let seconds = duration.seconds()

  if (days > 0) {
    if (days === 1) {
      return hours ? `${days} Day ${hours} Hrs` : `${days} Day`
    }
    return hours ? `${days} Days ${hours} Hrs` : `${days} Days`
  } else if (hours > 0) {
    return minutes ? `${hours} Hrs ${minutes} Mins` : `${hours} Hrs`
  } else if (minutes > 0) {
    return seconds ? `${minutes} Mins ${seconds} Secs` : `${minutes} Mins`
  } else {
    return `${seconds} Secs`
  }
}

export function formatGeoLocation(str) {
  if (str) {
    let val = str.split(',')
    return parseFloat(val[0]).toFixed(6) + ',' + parseFloat(val[1]).toFixed(6)
  }
}

// Returns the duration between a start date and the current date and time.
export function getDurationSince(startDate) {
  return dayjs.duration(dayjs() - startDate)
}

// Returns a duration based on a numeric frequency and a unit (e.g., 'M' for months).
export function getDurationObject(frequency, unit) {
  return dayjs.duration(frequency, unit)
}

// Returns a duration obj based on the number of months and years.
export function getDurationOfMY(months, years) {
  return dayjs.duration({ M: months, y: years })
}

// Returns a formatted date in a specified format and timezone.
export function formatCustomDate(date, format) {
  let timeZone = getTimeZone()
  return dayjs(date).tz(timeZone).format(format)
}

// Returns a date as a dayjs object.
export function getDateInstance(date) {
  let timeZone = getTimeZone()
  returndayjs(date).tz(timeZone)
}

// Returns the duration between a start date and an end date.
export function getDaysBetween(startDate, endDate) {
  return dayjs.duration(dayjs(endDate).diff(dayjs(startDate)))
}

// Returns the Start value for the Year and Month in Millisecond.
export function getStartOfMonthInMillis(year, month) {
  let timeZone = getTimeZone()
  return dayjs()
    .tz(timeZone)
    .year(Number(year))
    .month(Number(month) - 1)
    .startOf('month')
    .valueOf()
}

// Returns the End value for the Year and Month in Millisecond.
export function getEndOfMonthInMillis(year, month) {
  let timeZone = getTimeZone()
  return dayjs()
    .tz(timeZone)
    .year(Number(year))
    .month(Number(month) - 1)
    .endOf('month')
    .valueOf()
}
