 var express =	require('express');
var app		=	express();
var bodyParser = require('body-parser');
var mongoose	=	require('mongoose');
var _	=	require('lodash');
var User 	=	require('./app/models/user');
mongoose.connect('mongodb://root:root1234@ds261460.mlab.com:61460/document_users');

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

var port= process.env.PORT||8080;

var router = express.Router();

router.use(function(req, res, next) {

    console.log('Something is happening.');
    next(); 
});


router.get('/',function(req,res){
	res.json({message : 'welcome'});
});



router.route('/signup')
	.post(function(req,res){

		var body=_.pick(req.body,['name','phone','email','password']);
		var user = new User(body);
		// user.name = req.body.name;
		// user.phone = req.body.phone;
		// user.password = req.body.password;
		// user.email=req.body.email;

		user.save().then(function(){
			 return user.generateAuthToken();
			// res.json(user);
		}).then(function(token){
			res.header('x-auth',token).send(user);
		}).catch(function(e){
			res.status(400).send(e);
		});
	});

router.route('/login')
	.post(function(req,res){
		var body=_.pick(req.body,['phone','password']);
		User.findByCredentials(body.phone,body.password).then(function(user){

			res.send(user);

		}).catch(function(e){
			res.status(400).send(e);
		});
	});



app.use('/api',router);

app.use('/login',function(req,res){

	res.sendFile('D:/DocumentApi/html/login.html');
});

app.use('/',function(req,res){

	res.sendFile('D:/DocumentApi/html/index.html');
});



app.listen(port);

console.log('Running on Port '+ port);