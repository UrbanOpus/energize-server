var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    path = require('path'),
    config = require(path.join(__dirname, '..', '/config/config.js')),
    crypto = require('crypto'),
    jwt = require('jwt-simple'),
    tokenSecret = 'put-a-$Ecr3t-h3re';

var Data = new Schema({
	// the date of the reading or the start date of a bill
	date: {type: Number, required: true},
	// indicates whether data is from a meter reading or from utility company
	is_meter_reading: {type: Boolean, required:true},
	// if data is from a bill, this is the start date of the bill
	date_start: {type: Number},
	// if data is from a bill, this is the end date of the bill
	date_end: {type: Number},
	// if meter reading this is the total GJ consumed by the household
	total_gj: {type: Number},
	// if bill, this is the consumed GJ from date_start to date_end
	consumed_gj: {type: Number},
	// if meter reading this indicates how many m^3 of gas have been used
	meter_reading: {type: Number},
	// Temperature, average if from bill, user input if from reading
	average_temp: {type: Number}
});

var DataModel = mongoose.model('Data', Data);

var DataStore = new Schema({
	// user token to identify who's data store it is
	token: {type: String, required: true},
	// array of data for given user
	data_payload: [Data]
});

DataStore.statics.addMeterReading = function(token, date, total_gj, meter_reading, cb) {
	var self = this;
    this.findOne({token: token}, function(err, dataStore) {
    	if(err || !dataStore) {
            cb(err, null);
        } else {
        	var new_data = new Data(
            {   "date": 			date,
	    		"is_meter_reading": true,
	    		"total_gj": 		total_gj,
	    		"meter_reading": 	meter_reading
            });
	    	dataStore.data_payload.push(new_data);
	    	dataStore.save(function (err) {
			  if (err)
			  	cb(err, null);
			  else
			  	cb(false, "SUCCESS");
			});
	    }
    }
}

DataStore.statics.addBillingData = function(token, start_date, end_date, consumed_gj, avg_temp,  cb) {
	var self = this;
    this.findOne({token: token}, function(err, dataStore) {
    	if(err || !dataStore) {
            cb(err, null);
        } else {
        	var new_data = new Data(
            {   "date": 			start_date,
            	"start_date":		start_date,
            	"end_date":			end_date,
	    		"is_meter_reading": false,
	    		"consumed_gj": 		consumed_gj,
	    		"average_temp": 	avg_temp
            });
	    	dataStore.data_payload.push(new_data);
	    	dataStore.save(function (err) {
			  if (err)
			  	cb(err, null);
			  else
			  	cb(false, "SUCCESS");
			});
	    }
    }
}


DataStore.statics.getDataBetween = function(token, start_date, end_date, cb) {
    var self = this;
    this.findOne({token: token}, function(err, dataStore) {
        if(err || !dataStore) {
            cb(err, null);
        } else {
            //cb(false, {email: usr.email, token: usr.token, date_created: usr.date_created, full_name: usr.full_name});
            dataStore.data_payload.find({date:{"$gte":start_date, "$lt":end_date}}, 
            	function(err, relevant_data) {
            	if(err || !relevant_data) {
            		cb(err, null);
        		} else {
        			cd(false, relevant_data);
        		}
            });
        }
    });
};

var DataStoreModel = mongoose.model('DataStore', DataStore);