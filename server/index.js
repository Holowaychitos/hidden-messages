const express = require('express')
const app = express()

const Joi = require('joi')
const _ = require('lodash')

const PORT = process.env.PORT || 3000

const messageSchema = Joi.object().keys({
    message: Joi.string().required(),
    location: Joi.object().keys({
    	lat: Joi.number().required(),
    	lng: Joi.number().required()
    }).required()
}).required()

const querySchema = Joi.object().keys({
    lat: Joi.number().required(),
    lng: Joi.number().required()
}).required()

var MESSAGE_STORE = []

app.use(express.bodyParser())

function saveMessage(message) {
	return new Promise((resolve, reject) => {

		const messageToPush = Object.assign({}, message, {
			_id: parseInt(Math.random() * 46656, 10).toString(36),
			_readsRemaining: 10
		})

		MESSAGE_STORE.push(messageToPush)
		resolve(MESSAGE_STORE)
	})
}

function findMessage(location) {
	return new Promise((resolve, reject) => {
		MESSAGE_STORE = _.filter(MESSAGE_STORE, message => message._readsRemaining > 0)

		if (!MESSAGE_STORE.length) {
			resolve({
				result: []
			})
		}

		var findedMessage = MESSAGE_STORE[Math.floor(Math.random() * MESSAGE_STORE.length)]
		findedMessage._readsRemaining = findedMessage._readsRemaining - 1

		resolve({
			result: [findedMessage]
		})
	})
}

// returns the messages 'near' the location
app.get('/message', function (req, res) {
	const query = req.query

	Joi.validate(query, querySchema, function (err, value) {
		if (err) {
			res.status(500).send('Please provide valid ?lat=[number]&lng=[number] query string.')
			return
		}

		findMessage(query).then((response) => {
			res.json(response)
		}).catch(e => {
			res.status(500).send('ERROR TEHEH')
		})

	})
})

// returns all the messages
app.get('/message/all', function (req, res) {
  res.json(MESSAGE_STORE)
})

// creates a new message
app.post('/message', function (req, res) {
	console.log('REQ', req.body)

	Joi.validate(req.body, messageSchema, function (err, value) {
		if (err) {
			res.status(500).send('Please provide a valid message {"message": [string], "location": {"lat": [number], "lng": [number]}}')
			return
		}

		saveMessage(req.body).then(() => {
			res.send('YAY')
		}).catch(e => {
			res.status(500).send('STAPH')
		})

	})
})

console.log('SERVER STARTING', PORT)

// initializing
saveMessage({
	text: 'Im a test message',
	location: {
		lat: 0,
		lng: 1
	}
})

app.listen(PORT);