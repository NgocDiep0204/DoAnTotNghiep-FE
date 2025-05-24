// src/utils/validators.js

export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@gmail\.com$/
  return regex.test(email)
}

  
export const isStrongPassword = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/
  return regex.test(password)
}
  