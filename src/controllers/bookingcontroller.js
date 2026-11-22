const {BookingService} = require('../services');
const { AppErrors, AppSuccess } = require('../utils/common');
const { StatusCodes } = require('http-status-codes');

async function createBookings(req,res) {
    try {
        console.log("req.body", req.body);
        const flightBooking = await BookingService.createBooking({
            flightId: req.body.flightId,
        });
        const response = AppSuccess('Flight books successfully', flightBooking);
        return res
            .status(StatusCodes.OK)
            .json(response);
    } catch (error) {
        console.log("error in controller", error);
        const statusCode = error?.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
        const response = AppErrors(error.message, {
            explanation: error.explanation,
            statusCode,
        }); 
        return res
            .status(statusCode)
            .json(response);
    }
}

module.exports = {
    createBookings,
}