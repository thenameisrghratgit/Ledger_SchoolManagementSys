export const required = (value, message = 'This field is required.') =>
  !value || !String(value).trim() ? message : ''

export const isEmail = (value) =>
  !value
    ? 'Enter an email address.'
    : /^\S+@\S+\.\S+$/.test(value)
      ? ''
      : 'Enter a valid email address.'

export const isPhone = (value) =>
  !value
    ? 'Enter a phone number.'
    : /^[0-9+\-\s()]{7,15}$/.test(value)
      ? ''
      : 'Enter a valid phone number.'

export const minLength = (value, len, message) =>
  !value || value.length < len ? message || `Must be at least ${len} characters.` : ''

export const matches = (value, other, message = 'Passwords do not match.') =>
  value !== other ? message : ''
