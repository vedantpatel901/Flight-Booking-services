const axios = require('axios');
const db = require('../models');
const AppError = require('../utils/errors/app-error');
const { StatusCodes } = require('http-status-codes');
const BookingRepository = require('../respositories/booking-repository');
const { BookingStatus } = require('../utils/common/enums');


const bookingRepository = new BookingRepository();

async function createBooking(data) {
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

    await axios.patch(
      `http://localhost:3000/api/v1/flights/${data.flightId}/seats`,
      {
        seats: noOfSeats,
        dec: true
      }
    );

    const totalbookingcost = data.noOfSeats * flightData.price;
    console.log("totalbookingcost", totalbookingcost);
    const bookingPayload = {
      ...data, totalCost: totalbookingcost
    }
    const bookingFlight = await bookingRepository.createBooking(bookingPayload, transaction);
    await transaction.commit();
    return bookingFlight;
  } catch (error) {
    console.log("error in booking service", error);
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

async function makePayment(data) {
  const transaction = await db.sequelize.transaction();
  let committed = false;

  try {
    const bookingDetails = await bookingRepository.getdatabypk(data.bookingId, transaction);

    if (bookingDetails.status === BookingStatus.Cancelled) {
      throw new AppError("The booking is already cancelled", StatusCodes.BAD_REQUEST);
    }

    const bookingTime = new Date(bookingDetails.createdAt);
    const currentTime = new Date();

    if (currentTime - bookingTime > 300000) {
      await axios.patch(
        `http://localhost:3000/api/v1/flights/${bookingDetails.flightId}/seats`,
        {
          seats: bookingDetails.noOfSeats,
          dec: false
        }
      );
      await bookingRepository.update(
        data.bookingId,
        { status: BookingStatus.Cancelled },
        transaction
      );
      await transaction.commit();
      committed = true;
      throw new AppError("The booking is expired", StatusCodes.BAD_REQUEST);
    }

    if (Number(bookingDetails.totalCost) !== Number(data.totalCost)) {
      throw new AppError("Total cost is not correct", StatusCodes.BAD_REQUEST);
    }
    if (bookingDetails.status === BookingStatus.Booked) {
      throw new AppError("The booking is already booked", StatusCodes.BAD_REQUEST);
    }
    if (Number(bookingDetails.userId) !== Number(data.userId)) {
      console.log("bookingDetails.userId", bookingDetails.userId);
      console.log("data.userId", data.userId);
      throw new AppError("User is not allowed to make payment for this booking", StatusCodes.UNAUTHORIZED);
    }

    await bookingRepository.update(
      data.bookingId,
      { status: BookingStatus.Booked },
      transaction
    );

    await transaction.commit();
    committed = true;
    return await bookingRepository.getdatabypk(data.bookingId);
  } catch (error) {
    if (!committed) {
      await transaction.rollback();
    }
    throw error;
  }
}

async function cancelBooking(bookingId) {
  const transaction = await db.sequelize.transaction();
  try {
    const bookingDetails = await bookingRepository.getdatabypk(bookingId, transaction); // this is a function which will get the booking details by primary key
    if (bookingDetails.status === BookingStatus.Cancelled) {
      await transaction.commit();
      return bookingDetails;
    }
    await axios.patch(
      `http://localhost:3000/api/v1/flights/${bookingDetails.flightId}/seats`,
      {
        seats: bookingDetails.noOfSeats,
        dec: false
      },
    );
    await bookingRepository.update(bookingId, { status: BookingStatus.Cancelled }, transaction);
    await transaction.commit();
    return await bookingRepository.getdatabypk(bookingId);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function cancelOldBookings() {
  try {
    const currentTime = new Date(Date.now() - 300000); // 5 minutes ago
    const expiredBookings = await bookingRepository.cancelOldBookings(currentTime);
    const cancelledBookings = [];

    for (const booking of expiredBookings) {
      cancelledBookings.push(await cancelBooking(booking.id));
    }

    return cancelledBookings;
  } catch (error) {
    console.error("error cancelling old bookings", error);
    throw error;
  }
}
module.exports = {
  createBooking,
  makePayment,
  cancelBooking,
  cancelOldBookings
}