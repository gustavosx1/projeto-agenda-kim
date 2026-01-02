/**
 * Converter formato DD/MM para YYYY-MM-DD
 * @param {string} ddmmDate - Data no formato DD/MM
 * @returns {string} Data no formato YYYY-MM-DD
 */
export const convertDDMMtoYYYYMMDD = (ddmmDate) => {
  const today = new Date()
  const [day, month] = ddmmDate.split("/")
  const year = today.getFullYear()
  
  const dateObj = new Date(year, parseInt(month, 10) - 1, parseInt(day, 10))
  if (isNaN(dateObj.getTime())) {
    throw new Error("Data inválida")
  }
  
  return dateObj.toISOString().slice(0, 10)
}

/**
 * Converter formato YYYY-MM-DD para DD/MM
 * @param {string} yyyymmddDate - Data no formato YYYY-MM-DD
 * @returns {string} Data no formato DD/MM
 */
export const convertYYYYMMDDtoDDMM = (yyyymmddDate) => {
  const [year, month, day] = yyyymmddDate.split("-")
  return `${day}/${month}`
}
