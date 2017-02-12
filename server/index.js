var express = require('express')
var app = express()
var Joi = require('joi')

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

var MESSAGE_STORE = [{
	text: 'Im a test message',
	location: {
		lat: 0,
		lng: 1
	}
}]

function saveMessage(message) {
	return new Promise((resolve, reject) => {
		MESSAGE_STORE.push(message)
		resolve(MESSAGE_STORE)
	})
}

function findMessage(location) {
	return new Promise((resolve, reject) => {
		resolve({
			result: [{
				text: 'Message',
				location: location
			}]
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
			res.send(response)
		}).catch(e => {
			res.status(500).send('ERROR TEHEH')
		})

	})
})

// returns all the messages
app.get('/message/all', function (req, res) {
  res.send(MESSAGE_STORE)
})

// creates a new message
app.post('/message', function (req, res) {
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
app.listen(PORT);