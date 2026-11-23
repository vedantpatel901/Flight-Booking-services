
const CrudRepository = require('./crud-repository');
const { Booking } = require('../models');
const AppError = require('../utils/errors/app-error');
const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');
const { BookingStatus } = require('../utils/common/enums');

class BookingRepository extends CrudRepository{
    constructor(){
        super(Booking);
    }

    async createBooking(data,transaction){
        const response = await this.model.create(data, {transaction});
        return response; 
    }

     async getdatabypk(data,transaction){
        const respone = await this.model.findByPk(data  , {transaction : transaction});
        if(!respone){
            throw new AppError("Booking not found", StatusCodes.NOT_FOUND);
        }
        return respone;
    }


    async update(id, data,transaction){
        return await this.model.update(data, {
            where: { id },
            transaction
        });
    }

    async cancelOldBookings(currentTime) {
        return await this.model.findAll({
            where: {
                createdAt: {
                    [Op.lte]: currentTime
                },
                [Op.and]: [
                    { status: { [Op.not]: BookingStatus.Booked } },
                    { status: { [Op.not]: BookingStatus.Cancelled } }
                ]
            }
        });
    }


}

module.exports = BookingRepository;