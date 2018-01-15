const knex = require('knex')
const bcrypt = require('bcrypt')

const db = knex({
  client: 'pg',
  connection: {
    host : process.env.RDS_HOSTNAME,
    port : process.env.RDS_PORT,
    user : process.env.RDS_USERNAME,
    password : process.env.RDS_PASSWORD,
    database : process.env.RDS_DB_NAME,
  }
})

function errorLogger(error) {
  console.error(error)
}

// Preferences

function savePreferenceP(user_id, winner_id, loser_id) {
  const [alpha_id, beta_id] = [winner_id, loser_id].sort()
  const win_bit = (alpha_id == winner_id) ? 0 : 1
  return db('preferences')
    .insert({
      user_id: user_id,
      alpha_id: alpha_id,
      beta_id: beta_id,
      win_bit: win_bit
    })
    .returning('id')
    .catch(errorLogger)
}

function getPreferencesP() {
  return db
    .select('user_id', 'alpha_id', 'beta_id', 'win_bit', 'cc', 'zip')
    .from('preferences')
    .join('users', 'preferences.user_id', 'users.id')
    .catch(errorLogger)
}

// Users and Registration Codes
function saveUserP(user) {
  console.log(user)
  let saltRounds = parseInt(process.env.SALT_ROUNDS)
  user.password = bcrypt.hashSync(user.password, saltRounds)
  return db('users')
    .insert(user)
    .returning('id')
    .catch(errorLogger)
}

function getUserByIdP(id) {
  return db
    .select('*')
    .from('users')
    .where({ id: id })
    .first()
    .catch(errorLogger)
}

function getUserByEmailP(email) {
  return db
    .select('*')
    .from('users')
    .where({ email: email })
    .first()
    .catch(errorLogger)
}

exports.savePreferenceP = savePreferenceP
exports.getPreferencesP = getPreferencesP

exports.saveUserP = saveUserP
exports.getUserByIdP = getUserByIdP
exports.getUserByEmailP = getUserByEmailP
