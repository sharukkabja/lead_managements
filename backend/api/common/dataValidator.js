
function NullOrEmptyValidation(data){
    //console.log(data);
    if (data == null || data == undefined || data == '') {
        return true;
    }
    return false;
}

module.exports = {NullOrEmptyValidation : NullOrEmptyValidation};