var express = require("express");
var router = express();

var LeadController = require('../controller/v1/LeadController');

router.post("/leads",LeadController.Leads);
router.get("/leads",LeadController.GetLeads);
router.put("/leads/:id/status",LeadController.UpdateLeadStatus);
router.get("/leads/:id/timeline",LeadController.ActivitiesForALead);
router.post("/leads/check-duplicate",LeadController.CheckDuplicateLead);



router.all("*", function (req, res, next) {
    res.send("Invalid Url");
});


module.exports = router;