const mongoose = require('mongoose');
const validator = require('validator');
const jwt	=	require('jsonwebtoken');
const _ 	=	require('lodash');
const bcrypt	=	require('bcryptjs');
var nodemailer = require('nodemailer');
var Schema = mongoose.Schema;
var UserSchema = new Schema({
	name :{
		type: String,
		required: true,
		minlength: 1,
		trim: true
	},
	email : {
		type: String,
		required: true,
		trim: true,
		minlength: 1,
		validate: {
			validator: validator.isEmail,
			message: '{VALUE} is not a valid Email'
		}
	},
	status :{
		type: Number
	},
	tokens: [{
		access: {
			type : String,
			required : true
		},
		token: {
			type : String,
			required : true
		}
	}]
});


UserSchema.methods.generateAuthToken = function(){
	var user=this;
	var access='auth';
	var token = jwt.sign({_id: user._id.toHexString(),access},'abcd').toString();
	user.tokens.push({access,token});
	return user.save().then(()=>{
		// console.log(token);
		return token;
	});
} ;


UserSchema.methods.toJSON=function(){
	var user=this;
	var  userObject= user.toObject();

	return _.pick(userObject,['_id','name','email']); 
}

UserSchema.statics.findByCredentials=function(phone,password){
var User=this;
return User.findOne({phone}).then(function(user){
	if(!user){
		return Promise.reject();
	}
	return new Promise(function(resolve,reject){
		bcrypt.compare(password,user.password,function(err,res){
			if(res){
				resolve(user);
			}
			else{
				reject();
			}
		});
	});
});
};

UserSchema.pre('save',function(next){
var user = this;
if(user.isModified('password'))
{
	bcrypt.genSalt(10,function(err,salt){
		bcrypt.hash(user.password,salt,function(err,hash){
			user.password=hash;
			next();
		});
	});
}
else
{
	next();
}
});

module.exports= mongoose.model('User',UserSchema);

