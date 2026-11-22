const axios = require('axios');
const { BookingRepository } = require('../respositories');
const db = require('../models');

async function createBooking(data){
   try{
    const result = db.sequelize.transaction(async function bookingImp(t){
      console.log("data",`http://localhost:3000/api/v1/flights/${data.flightId}`)
      const flight = await axios.get(`http://localhost:3000/api/v1/flights/${data.flightId}`);
      console.log("flight", flight);
    })
   }catch (error){
    console.log("error in service", error);

   }
}
 
module.exports = {
    createBooking
}