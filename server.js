var express =	require('express');
var app		=	express();
var bodyParser = require('body-parser');
var mongoose	=	require('mongoose');
var _	=	require('lodash');
var User 	=	require('./app/models/user');
mongoose.connect('mongodb://root:root1234@ds261460.mlab.com:61460/document_users');

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(express.static('./public'));

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    // res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers','Origin, X-Requested-With,content-type, Accept');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    // res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

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
		
		user.save().then(function(){
			 return user.generateAuthToken();
		}).then(function(token){
			console.log(token);
			res.header('x-auth',token).send(user);
		}).catch(function(e){
			res.status(400).send(e);
		});
	});

router.route('/login')
	.post(function(req,res){
		var body=_.pick(req.body,['phone','password']);
		User.findByCredentials(body.phone,body.password).then(function(user){
			return user.generateAuthToken().then(function(token){
			res.header('x-auth',token).send(user);
		});
		}).catch(function(e){
			res.status(400).send(e);
		});
	});



app.use('/api',router);

app.use('/login',function(req,res){

	res.sendFile('login.html');
});

app.use('/',function(req,res){

	res.sendFile('index.html');
});


app.listen(port);
console.log('Running on Port '+ port);