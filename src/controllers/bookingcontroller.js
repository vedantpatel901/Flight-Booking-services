const {BookingService} = require('../services');
const { AppErrors, AppSuccess } = require('../utils/common');
const { StatusCodes } = require('http-status-codes');
const inMemoryDb = {}

async function createBookings(req,res) {
    try {
        console.log("req.body", req.body);
        const flightBooking = await BookingService.createBooking({
            flightId: req.body.flightId,
            userId: req.body.userId,
            noOfSeats: req.body.noOfSeats,
        });
        const response = AppSuccess('Flight books successfully', flightBooking);
        return res
            .status(StatusCodes.OK)
            .json(response);
    } catch (error) {
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

async function makepayment(req,res) {
    try {
        const idempotencyKey = req.headers['x-idempotency-key'];
        if (!idempotencyKey || inMemoryDb[idempotencyKey]) {
            return res
            .status(StatusCodes.BAD_REQUEST)
            .json(AppErrors('cannot retry the payment on successful payment', {
                explanation: 'cannot retry the payment on successful payment',
                statusCode: StatusCodes.BAD_REQUEST,
            }));
        }

        console.log("req.body", req.body);
        const flightBooking = await BookingService.makePayment({
            userId: req.body.userId,
            totalCost: req.body.totalCost,
            bookingId: req.body.bookingId,
        });
        inMemoryDb[idempotencyKey] = idempotencyKey;
        const response = AppSuccess('booked is completed successfully', flightBooking);
        return res
            .status(StatusCodes.OK)
            .json(response);
    } catch (error) {
        console.log("error in booking controller", error);
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
    makepayment
}