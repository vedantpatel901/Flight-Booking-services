const axios = require('axios');
const db = require('../models');
const AppError = require('../utils/errors/app-error');
const { StatusCodes } = require('http-status-codes');

async function createBooking(data){
   let transaction;

   try {
    const noOfSeats = Number(data.noOfSeats);
    transaction = await db.sequelize.transaction();

    const flightResponse = await axios.get(
      `http://localhost:3000/api/v1/flights/${data.flightId}`
    );
    const flightData = flightResponse.data.data;

    if (!flightData) {
      throw new AppError("flight not found", StatusCodes.NOT_FOUND);
    }

    if (flightData.totalSeats < noOfSeats) {
      throw new AppError(
        "no of seats are not available",
        StatusCodes.BAD_REQUEST
      );
    }
    const totalbookingcost = data.noOfSeats * flightData.price;
    console.log("totalbookingcost", totalbookingcost);

    await transaction.commit();
    return true;
   } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        "something went wrong in the booking service",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
   }
}
 
module.exports = {
    createBooking
}