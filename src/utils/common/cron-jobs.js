const { CronJob } = require('cron');
const { BookingService } = require('../../services');


function scheduledJob(){

   const job = new CronJob(' */15 * * * *', async () => {
      const response = await BookingService.cancelOldBookings();
      console.log(`Cancelled ${response.length} expired booking(s)`);
   });

   job.start();
}

module.exports = scheduledJob;