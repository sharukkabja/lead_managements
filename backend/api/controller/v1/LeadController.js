var stringConstant = require('../../common/stringConstants');
var leadService = require('../../services/leadService');



exports.Leads = async function (req, res) {

    const { name, email, phone } = req.body;

    try {

        if (!name || !email || !phone)
           return res.status(400).json({ message: 'Required fields missing' });

        if (!/^\d{10}$/.test(phone))
           return res.status(400).json({ message: 'Phone must be 10 digits' });

        let info = await leadService.Leads(req, res);
        if(info.executed == 1){
            res.json({ status: 200, message: stringConstant.COMMAN_SUCCESS_MSG, data : info.data });
        }else{
            res.json({ status: 400, message: stringConstant.FAILED_ERROE, data : {} });
        }
    } catch (err) {
        console.log(err)
        res.json({ status: 400, message: err });
    }
}

exports.GetLeads = async function (req, res) {

    try {

        let info = await leadService.GetLeads(req, res);
        if(info.executed == 1){
            res.json({ status: 1, message: stringConstant.COMMAN_SUCCESS_MSG, data : info.data });
        }else{
            res.json({ status: 0, message: stringConstant.FAILED_ERROE, data : {} });
        }
    } catch (err) {
        console.log(err)
        res.json({ status: 400, message: err });
    }
}
exports.UpdateLeadStatus = async function (req, res) {

    try {

        let info = await leadService.UpdateLeadStatus(req, res);
        if(info.executed == 1){
            res.json({ status: 1, message: stringConstant.COMMAN_SUCCESS_MSG, data : info.data });
        }else{
            res.json({ status: 0, message: stringConstant.FAILED_ERROE, data : {} });
        }
    } catch (err) {
        console.log(err)
        res.json({ status: 400, message: err });
    }
}
exports.ActivitiesForALead = async function (req, res) {

    try {

        let info = await leadService.ActivitiesForALead(req, res);
        if(info.executed == 1){
            res.json({ status: 1, message: stringConstant.COMMAN_SUCCESS_MSG, data : info.data });
        }else{
            res.json({ status: 0, message: stringConstant.FAILED_ERROE, data : {} });
        }
    } catch (err) {
        console.log(err)
        res.json({ status: 400, message: err });
    }
}
exports.CheckDuplicateLead = async function (req, res) {

      const { name, email, phone } = req.body;

        if (!email && !phone && !name) {
            return res.status(400).json({
            message: 'At least one field (name, email, phone) is required',
            });
        }

    try {

        let info = await leadService.CheckDuplicateLead(req, res);
        if(info.executed == 1){
            res.json({ status: 1, message: stringConstant.COMMAN_SUCCESS_MSG, data : info.data });
        }else{
            res.json({ status: 0, message: stringConstant.FAILED_ERROE, data : {} });
        }
    } catch (err) {
        console.log(err)
        res.json({ status: 400, message: err });
    }
}













