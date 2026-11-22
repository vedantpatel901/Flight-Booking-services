const { Serverconfig, Logger } = require('./config');

const express = require('express');
const apiRoutes = require('./routes');
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/api' , apiRoutes);

app.listen(Serverconfig.PORT, () => {
    console.log(`Server is running on port ${Serverconfig.PORT}`);
    Logger.info('server is running fine');
});