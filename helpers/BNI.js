require('dotenv').config()
const fetch = require('node-fetch')
const jwt = require('jsonwebtoken')
const { encode } = require('js-base64')
const { BNI_SERVICES_URL, BNI_API_KEY, BNI_API_SECRET, BNI_CLIENT_ID, BNI_CLIENT_SECRET, BNI_CLIENT_NAME } = process.env

/**
 * Generate JWT Token
 */
const generateJWT = (data) => new Promise(async (resolve, reject) => {
  resolve(await jwt.sign(JSON.parse(data), BNI_API_SECRET, { noTimestamp: true }))
})

/**
 * Get Access Token
 */
const getAccessToken = () => new Promise(async (resolve, reject) => {
  const resRequest = await fetch(`${BNI_SERVICES_URL}/api/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${encode(`${BNI_CLIENT_ID}:${BNI_CLIENT_SECRET}`)}`
    },
    body: 'grant_type=client_credentials'
  })
  if (resRequest.status === 200) {
    const { access_token } = await resRequest.json()
    resolve(access_token)
  } else {
    throw new Error('Bad Credentials')
  }
})

/**
 * Get Balance
 */
const getBalance = (accessToken, accountNo) => new Promise(async (resolve, reject) => {
  const resRequest = await sendRequest(`${BNI_SERVICES_URL}/H2H/v2/getbalance`, accessToken, { accountNo })
  resolve(resRequest)
})

/**
 * Get Payment Status
 */
const getPaymentStatus = (accessToken, customerReferenceNumber) => new Promise(async (resolve, reject) => {
  const resRequest = await sendRequest(`${BNI_SERVICES_URL}/H2H/v2/getpaymentstatus`, accessToken, { customerReferenceNumber })
  resolve(resRequest)
})

/**
 * Send Requst
 */
const sendRequest = (url, token, data) => new Promise(async (resolve, reject) => {
  const payload = JSON.stringify({ clientId: `IDBNI${encode(BNI_CLIENT_NAME)}`, ...data })
  const signature = await generateJWT(payload)
  const resRequest = await fetch(`${url}?access_token=${token}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': BNI_API_KEY
    },
    body: JSON.stringify({ ...JSON.parse(payload), signature })
  })
  if (resRequest.status === 200) {
    resolve(await resRequest.json())
  } else {
    throw new Error('Bad Signature')
  }
})

module.exports = {
  generateJWT,
  getAccessToken,
  getBalance,
  getPaymentStatus
}