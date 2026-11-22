const express = require('express');
const router = express.Router();
const { BookingController } = require('../../controllers');

router.post('/', BookingController.createBookings);
router.post('/makepayment', BookingController.makepayment);
module.exports = router;