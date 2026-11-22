const express = require("express");

const router = express.Router();
const bookingRoute = require("./bookingroute");
const { Infocontroller } = require("../../controllers"); 

router.get("/info", (req, res) => {
    return res.json({ message: "this is the info route" });
});
router.use("/booking", bookingRoute);

module.exports = router; 