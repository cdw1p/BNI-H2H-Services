const { getAccessToken, getBalance, getPaymentStatus } = require('./helpers/BNI')

/**
 * Temporary Data
 */
const accountNo = '000000000'
const customerReferenceNumber = '000000000'

/**
 * BNI H2H Services
 */
const main = async () => new Promise(async (resolve, reject) => {
  const resAccessToken = await getAccessToken()
  const resBalance = await getBalance(resAccessToken, accountNo)
  const resPaymentStatus = await getPaymentStatus(resAccessToken, customerReferenceNumber)
  console.log(resBalance, resPaymentStatus)
})

main()