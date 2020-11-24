const express = require("express")
const fileUpload = require("express-fileupload")
const cors = require("cors")
const morgan = require("morgan")
const multer = require("multer")
const app = express()
const ImagesToPDF = require('images-pdf');
const fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var mkdirp = require('mkdirp');
var bodyParser = require('body-parser')
const mongoose = require('mongoose');
const FeedBack = require('./dbModels/feedback.js');
const UserCount = require('./dbModels/userCount.js');

app.use(cors())
app.use(express.urlencoded({ extended: true }))
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

var storage = multer.diskStorage(
  {
    destination: function (req, file, cb) {
      console.log("uploaded_images/" + req.cookies);
      let uploadFolderPath = "uploaded_images/" + req.cookies;
      try {
        mkdirp(uploadFolderPath);
        cb(null, uploadFolderPath)

      } catch (ex) {
        console.log(ex);
      }
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname)
    }
  })

var upload = multer({ storage: storage }).array('file')

//connection url 
const connection_url_feedback = 'mongodb+srv://adminPdFUserShahi_Adi:stLIf14kJIj0Cqoi@cluster0-pdfever.p5vkn.mongodb.net/feedback?retryWrites=true&w=majority'

const connection_url_userCount = 'mongodb+srv://adminPdFUserShahi_Adi:stLIf14kJIj0Cqoi@cluster0-pdfever.p5vkn.mongodb.net/usercount?retryWrites=true&w=majority'


//db config
feedbackConnect = () => {
  console.log("Going to connect to feedback  DB");
  mongoose.connect(connection_url_feedback, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,

  })
};

updateUserCountConnect = () => {
  console.log("Going to connect to UpdateUserCount in  DB");
  mongoose.connect(connection_url_userCount, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
};

app.get('/systemCheck', async(req,res) => {
      console.log("/uploaded_images/" + 'abc');
      let uploadFolderPath = "/uploaded_images/" + 'abc';
      try {
        mkdirp(uploadFolderPath);
        //cb(null, uploadFolderPath);
        //res.status(200).send("Noraa Directory created");
        filepath = path.join(__dirname, '../PdfEver-Backend/output/' + 'input5' + '.txt');
        fs.closeSync(fs.openSync(filepath, 'w')); 
        fs.writeFile(filepath,'hello world is good',(err)=>{
          if(err) {
            console.log("Shit it failed"); 
            res.status(200).send("lllo failed");
          } 
          console.log("OOOOOOO it worked"); 
          res.status(200).send("lllo created");
        }); 
      } catch (ex) {
        console.log(ex);
        res.status(500).send("Noraa Directory Failed");
      }
})

app.post('/feedback', async (req, res) => {
  try {
    console.log("Feedback ", req.body);
    const feedback = req.body;
    feedbackConnect();
    FeedBack.create(feedback, (err, data) => {
      if (err) {
        console.log(err);
        res.status(500).send(err);
      }
      res.status(200).send("Thank you for the feedback!")
    })
  } catch (err) {
    console.log(err);
  }
});

app.get('/download/:id', function (req, res, next) {
  // filepath = path.join(__dirname,'../output/file.pdf') +'/'+ req.body.filename;
  //filepath = path.join(__dirname,'../pdfever/output/file.pdf');
  console.log("Why is download called")
  filepath = path.join(__dirname, '../PdfEver-Backend/output/' + req.params.id + '.pdf');
  try {
    if (fs.existsSync(filepath)) {
      console.log("Dude the file really exists!");
    } else {
      console.log("Dude the file does really exists!");
    }
  } catch (err) {
    console.error(err)
  }

  console.log("Downloaded path ::", filepath);
  res.contentType('application/pdf');
  res.download(filepath, function (err) {
    if (err) {
      console.log("Error");
      console.log(err);
    } else {
      console.log("Successfully downloaded");
      updateUserCountConnect();
      var utc = getCurrentDateAndTime();
      console.log("oiiii", utc);
      let userTimeJSON = {
        count: utc
      };
      UserCount.create(userTimeJSON, (err, data) => {
        if (err) {
          //res.status(500).send(err);
        } else {
          //res.status(201).send(data);
        }
      })
    }
  });
});


getCurrentDateAndTime = () => {
  var objToday = new Date(),
    weekday = new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'),
    dayOfWeek = weekday[objToday.getDay()],
    domEnder = function () { var a = objToday; if (/1/.test(parseInt((a + "").charAt(0)))) return "th"; a = parseInt((a + "").charAt(1)); return 1 == a ? "st" : 2 == a ? "nd" : 3 == a ? "rd" : "th" }(),
    dayOfMonth = today + (objToday.getDate() < 10) ? '0' + objToday.getDate() + domEnder : objToday.getDate() + domEnder,
    months = new Array('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'),
    curMonth = months[objToday.getMonth()],
    curYear = objToday.getFullYear(),
    curHour = objToday.getHours() > 12 ? objToday.getHours() - 12 : (objToday.getHours() < 10 ? "0" + objToday.getHours() : objToday.getHours()),
    curMinute = objToday.getMinutes() < 10 ? "0" + objToday.getMinutes() : objToday.getMinutes(),
    curSeconds = objToday.getSeconds() < 10 ? "0" + objToday.getSeconds() : objToday.getSeconds(),
    curMeridiem = objToday.getHours() > 12 ? "PM" : "AM";
  var today = curHour + ":" + curMinute + "." + curSeconds + curMeridiem + " " + dayOfWeek + " " + dayOfMonth + " of " + curMonth + ", " + curYear;

  return today;
}

var generate_key = function () {
  // 16 bytes is likely to be more than enough,
  // but you may tweak it to your needs
  let key = crypto.randomBytes(16).toString('base64') + Date.now();

  return key.replace(/[^\w\s]/gi, '');//.replace("==", "");
  //to replace all special characters
};

app.post('/picture', async (req, res) => {
  try {
    let uid = generate_key();
    console.log("UID :", uid);
    req.cookies = uid;
    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(500).json(err)
      } else if (err) {
        return res.status(500).json(err)
      }
      console.log("START");
      console.log("ENDD");
      //new ImagesToPDF.ImagesToPDF().convertFolderToPDF('uploaded_images', 'output/file.pdf');
      //return file;

      return res.status(200).send(uid);//.status(200).send(req)

    })
  } catch (e) {
    console.log(e.message);
    res.status(500).send(e)
  }
});


app.post('/deleteDir', async (req, res) => {
  try {
    console.log("Inside please delete dir");
    let t1 = "bv";
    console.log(req.body[Object.keys(req.body)[0]]);
    for (var propName in req.body) {
      if (req.body.hasOwnProperty(propName)) {
        t1 = propName;    // or do something with it and break
      }
    }

    console.log("Going too delete", t1);
    outputFilePath = path.join(__dirname, '../PdfEver-Backend/output/' + t1 + '.pdf');
    fs.rmdir(outputFilePath, { recursive: true }, (err) => {
      if (err) {
        throw err;
      }
      console.log(`${outputFilePath} is deleted!`);
      folderPath = path.join(__dirname, '../PdfEver-Backend/uploaded_images/' + t1);
      fs.rmdir(folderPath, { recursive: true }, (err) => {
        if (err) {
          throw err;
        }
        console.log(`${folderPath} is deleted!`);
      });
    });

  } catch (e) {
    console.log(e.message);
    res.status(500).send(e)
  }
});



app.post('/mergeFiles', async (req, res) => {
  try {
    let t1 = "bv";
    console.log(req.body[Object.keys(req.body)[0]]);
    for (var propName in req.body) {
      if (req.body.hasOwnProperty(propName)) {
        t1 = propName;    // or do something with it and break
      }
    }
    console.log("Starting merging process for : ", t1);
    var mergeLogic = async () => {
      new ImagesToPDF.ImagesToPDF().convertFolderToPDF('uploaded_images/' + t1, 'output/' + t1 + '.pdf');

    }
    mergeLogic().then(() => {
      console.log("File merging successful");
      return res.status(200).send(t1);//.status(200).send(req)
    });
  } catch (e) {
    console.log(e.message);
    res.status(500).send(e)
  }
});

const port = process.env.PORT || 4000

app.listen(port, () => console.log(`Server is running on port ${port}`))