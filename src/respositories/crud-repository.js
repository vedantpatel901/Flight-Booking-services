const {Logger} = require("../config/logger-config")

class CrudRepository{
    constructor(model){
        this.model = model;
    }

    async create(data){
        const respone = await this.model.create(data);
        return respone; 
    }

     async destroy(data){
        const respone = await this.model.destroy({ where:{
            id: data
        } });
        return respone;
    }

    async getdata(data){
        const respone = await this.model.findOne({ where: { id: data } });
        return respone;
    }

    async getAll(){
        const response = await this.model.findAll();
        return response;
    }
}


module.exports = CrudRepository;