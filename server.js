var express =	require('express');
var app		=	express();
var bodyParser = require('body-parser');
var mongoose	=	require('mongoose');
var _	=	require('lodash');
var User 	=	require('./app/models/user');
mongoose.connect('mongodb://root:root1234@ds261460.mlab.com:61460/document_users');
var nodemailer = require('nodemailer');
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());


// app.use(express.static('./public'));


var transporter = nodemailer.createTransport({
 service: 'gmail',
 auth: {
        user: 'zesterverify@gmail.com',
        pass: 'Zester@123'
    }
});


app.use(function (req, res, next) {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Expose-Headers', 'x-auth');
    res.setHeader('Access-Control-Allow-Headers','Origin, X-Requested-With,content-type, Accept');
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
		user.status=0;
		user.save().then(function(){
			
			 return user.generateAuthToken();
		}).then(function(token){
			console.log(token);
			var link='https://agile-dusk-86729.herokuapp.com/api/verify/'+user._id;
			const mailOptions = {
			  from: 'zesterverify@gmail.com', 
			  to: 'ny.neeraj12121@gmail.com', 
			  subject: 'Subject of your email', 
			  html: '<p>'+user.name+' has registered to your service. Please click the link below to verify</p><a href=\"'+link+'\">link</a>'
			};
			transporter.sendMail(mailOptions, function (err, info) {
			   if(err)
			     console.log(err)
			   else
			     console.log(info);
			});
			res.header('x-auth',token).send(user);
		}).catch(function(e){
			res.status(400).send(e);
		});
	});

router.route('/login')
	.post(function(req,res){
		var body=_.pick(req.body,['phone','password']);
		User.findByCredentials(body.phone,body.password).then(function(user){
			if(user.status==0){
				res.status(401).send("Your account is still not verified");
			}
			else{
				return user.generateAuthToken().then(function(token){
				res.header('x-auth',token).send(user);
				});	
			}

			
		}).catch(function(e){
			res.status(400).send(e);
		});
	});

router.route('/verify/:id')
	.get(function(req,res){

		var id=req.params.id;
		User.findById(id).then(function(user){
			user.status=1;
			user.save().then(function(user){
				res.send(user.name+" is successfully verified");
			});
		}).catch(function(e){
			console.log(e);
		});
	});



app.use('/api',router);

// app.use('/login',function(req,res){

// 	res.sendFile('login.html');
// });

// app.use('/',function(req,res){

// 	res.sendFile('index.html');
// });

app.use(express.static('public', {
  extensions: ['html']
}));



app.listen(port);
console.log('Running on Port '+ port);