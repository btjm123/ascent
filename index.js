const express = require('express')
const mongodb = require('mongodb')
const bodyParser = require('body-parser');
const { body } = require('express-validator');
const algoController = require('./controllers/algoController');
let secureEnv = require('secure-env');
global.env = secureEnv({secret:'mySecretPassword'});

const app = express()
const port = 3000

const http = require('http').createServer(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "http://68.183.238.136",
    methods: ["GET", "POST"],
    credentials: true
  }
});


app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/views'));
app.use(bodyParser.urlencoded({
  extended: true
})); 
/* w9jE6x4zOI879mwV */
const MongoClient = mongodb.MongoClient;
const uri = "mongodb+srv://dbadmin1:w9jE6x4zOI879mwV@cluster0.zwnbb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true });
var db;
client.connect(err => {
  // perform actions on the collection objects
  if (err) console.log(err);
  db = client.db("verity");
});

app.post('/mentorship-signup', [], async (req,res) => {
	console.log(req.body);
	const mentors = db.collection("mentors");
	mentors.insertOne(req.body, function (err,res){
		if(err) throw err
		console.log("done");
	});
	res.redirect('/');
});
app.post('/menteeship-signup', [], async (req,res) => {
	console.log(req.body);
	const mentees = db.collection("mentees");
	mentees.insertOne(req.body, function (err,res){
		if(err) throw err
		console.log("done");
	});
	res.redirect('/');
});

app.post('/newsletter-signup', [
  body('email').isEmail().normalizeEmail(),
  body('message').not().isEmpty().trim().escape(),
  body('msg_subject').not().isEmpty().trim().escape(),
  body('name').not().isEmpty().trim().escape()
], async (req, res) => {
  console.log(req.body);
  const newsletter = db.collection("newsletter");
  newsletter.insertOne(req.body, function (err, res) {
    if (err) throw err
    console.log("done");
  });
  
});


app.get('/', async (req, res) => {
  const numberMentees = await db.collection('mentees').countDocuments();
  const numberMentors = await db.collection('mentors').countDocuments();
  res.render('pages/index', {
    numberMentees: numberMentees,
    numberMentors: numberMentors
  });
})
app.get('/mentor', function (req, res) {
  res.render('pages/mentor', {});
});
app.get('/mentee', function (req, res) {
  res.render('pages/mentee', {});
});


app.get('/admin', async (req, res) => {

  
  try {
    let mentorsData = await db.collection('mentors').find().toArray();
    let menteesData = await db.collection('mentees').find().toArray();  

    const pairingsMap = algoController(db, mentorsData, menteesData, (err, pairingsMap) => {
      pairingsMap.then(data => {
        console.log(data);
        if (err == null) {
          res.render('dashboard', {
            menteesData: menteesData,
            mentorsData: mentorsData,
            pairingsMap: data  
          });
        } else {
          res.status(500).json({
            status: 'failure',
            message: err
          })
        }
      })
      
      
    });
  } catch(err) {
    console.log(err);
    res.status(500).json({
      status: 'failure',
      message: err
    })
  }

})

app.get('/admin-data', (req, res) => {
  res.render('basic-table')
})


app.get('/admin-profile', (req, res) => {
  res.render('profile')
})

http.listen(port, function() {
  console.log("Server connected");
  io.on("connection", function(socket) {
    console.log("User: " + socket.id);

    socket.on("messageSent", function(message) {
      socket.broadcast.emit("messageSent", message)
    })
  })
})


/*
  <section id="team" class="section-padding text-center">
      <div class="container">
        <div class="row">
          <div class="col-12">
            <div class="section-title-header text-center">
              <h1 class="section-title wow fadeInUp" data-wow-delay="0.2s">Who's Speaking?</h1>
              <p class="wow fadeInDown" data-wow-delay="0.2s">Global Grand Event on Digital Design</p>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-sm-6 col-md-6 col-lg-4">
            <!-- Team Item Starts -->
            <div class="team-item wow fadeInUp" data-wow-delay="0.2s">
              <div class="team-img">
                <img class="img-fluid" src="/img/index/team/team-01.jpg" alt="">
                <div class="team-overlay">
                  <div class="overlay-social-icon text-center">
                    <ul class="social-icons">
                      <li><a href="#"><i class="lni-facebook-filled" aria-hidden="true"></i></a></li>
                      <li><a href="#"><i class="lni-twitter-filled" aria-hidden="true"></i></a></li>
                      <li><a href="#"><i class="lni-linkedin-filled" aria-hidden="true"></i></a></li>
                      <li><a href="#"><i class="lni-behance" aria-hidden="true"></i></a></li>
                    </ul>
                  </div>
                </div>
              </div>
              <div class="info-text">
                <h3><a href="#">JONATHON DOE</a></h3>
                <p>Product Designer, Tesla</p>
              </div>
            </div>
            <!-- Team Item Ends -->
          </div>
          <div class="col-sm-6 col-md-6 col-lg-4">
            <!-- Team Item Starts -->
            <div class="team-item wow fadeInUp" data-wow-delay="0.4s">
              <div class="team-img">
                <img class="img-fluid" src="/img/index/team/team-02.jpg" alt="">
                <div class="team-overlay">
                  <div class="overlay-social-icon text-center">
                    <ul class="social-icons">
                      <li><a href="#"><i class="lni-facebook-filled" aria-hidden="true"></i></a></li>
                      <li><a href="#"><i class="lni-twitter-filled" aria-hidden="true"></i></a></li>
                      <li><a href="#"><i class="lni-linkedin-filled" aria-hidden="true"></i></a></li>
                      <li><a href="#"><i class="lni-behance" aria-hidden="true"></i></a></li>
                    </ul>
                  </div>
                </div>
              </div>
              <div class="info-text">
                <h3><a href="#">Patric Green</a></h3>
                <p>Front-end Developer, Dropbox</p>
              </div>
            </div>
            <!-- Team Item Ends -->
          </div>

          <div class="col-sm-6 col-md-6 col-lg-4">
            <!-- Team Item Starts -->
            <div class="team-item wow fadeInUp" data-wow-delay="0.6s">
              <div class="team-img">
                <img class="img-fluid" src="/img/index/team/team-03.jpg" alt="">
                <div class="team-overlay">
                  <div class="overlay-social-icon text-center">
                    <ul class="social-icons">
                      <li><a href="#"><i class="lni-facebook-filled" aria-hidden="true"></i></a></li>
                      <li><a href="#"><i class="lni-twitter-filled" aria-hidden="true"></i></a></li>
                      <li><a href="#"><i class="lni-linkedin-filled" aria-hidden="true"></i></a></li>
                      <li><a href="#"><i class="lni-behance" aria-hidden="true"></i></a></li>
                    </ul>
                  </div>
                </div>
              </div>
              <div class="info-text">
                <h3><a href="#">Paul Kowalsy</a></h3>
                <p>Lead Designer, TNW</p>
              </div>
            </div>
            <!-- Team Item Ends -->
          </div>

          <div class="col-sm-6 col-md-6 col-lg-4">
            <!-- Team Item Starts -->
            <div class="team-item wow fadeInUp" data-wow-delay="0.8s">
              <div class="team-img">
                <img class="img-fluid" src="/img/index/team/team-04.jpg" alt="">
                <div class="team-overlay">
                  <div class="overlay-social-icon text-center">
                    <ul class="social-icons">
                      <li><a href="#"><i class="lni-facebook-filled" aria-hidden="true"></i></a></li>
                      <li><a href="#"><i class="lni-twitter-filled" aria-hidden="true"></i></a></li>
                      <li><a href="#"><i class="lni-linkedin-filled" aria-hidden="true"></i></a></li>
                      <li><a href="#"><i class="lni-behance" aria-hidden="true"></i></a></li>
                    </ul>
                  </div>
                </div>
              </div>
              <div class="info-text">
                <h3><a href="#">Jhon Doe</a></h3>
                <p>Back-end Developer, ASUS</p>
              </div>
            </div>
            <!-- Team Item Ends -->
          </div>
          <div class="col-sm-6 col-md-6 col-lg-4">
            <!-- Team Item Starts -->
            <div class="team-item wow fadeInUp" data-wow-delay="1s">
              <div class="team-img">
                <img class="img-fluid" src="/img/index/team/team-05.jpg" alt="">
                <div class="team-overlay">
                  <div class="overlay-social-icon text-center">
                    <ul class="social-icons">
                      <li><a href="#"><i class="lni-facebook-filled" aria-hidden="true"></i></a></li>
                      <li><a href="#"><i class="lni-twitter-filled" aria-hidden="true"></i></a></li>
                      <li><a href="#"><i class="lni-linkedin-filled" aria-hidden="true"></i></a></li>
                      <li><a href="#"><i class="lni-behance" aria-hidden="true"></i></a></li>
                    </ul>
                  </div>
                </div>
              </div>
              <div class="info-text">
                <h3><a href="#">Daryl Dixon</a></h3>
                <p>Full-stack Developer, Google</p>
              </div>
            </div>
            <!-- Team Item Ends -->
          </div>
          <div class="col-sm-6 col-md-6 col-lg-4">
            <!-- Team Item Starts -->
            <div class="team-item wow fadeInUp" data-wow-delay="1.2s">
              <div class="team-img">
                <img class="img-fluid" src="/img/index/team/team-06.jpg" alt="">
                <div class="team-overlay">
                  <div class="overlay-social-icon text-center">
                    <ul class="social-icons">
                      <li><a href="#"><i class="lni-facebook-filled" aria-hidden="true"></i></a></li>
                      <li><a href="#"><i class="lni-twitter-filled" aria-hidden="true"></i></a></li>
                      <li><a href="#"><i class="lni-linkedin-filled" aria-hidden="true"></i></a></li>
                      <li><a href="#"><i class="lni-behance" aria-hidden="true"></i></a></li>
                    </ul>
                  </div>
                </div>
              </div>
              <div class="info-text">
                <h3><a href="#">Chris Adams</a></h3>
                <p>UI Designer, Apple</p>
              </div>
            </div>
            <!-- Team Item Ends -->
          </div>
        </div>
        <a href="speakers.html" class="btn btn-common mt-30 wow fadeInUp" data-wow-delay="1.9s">All Speakers</a>
      </div>
    </section>
*/
