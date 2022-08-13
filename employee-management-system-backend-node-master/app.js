var express = require("express"),
  mongoose = require("mongoose"),
  autoIncrement = require("mongoose-auto-increment"),
  Joi = require("joi"),
  app = express();
jwt = require("jsonwebtoken");
require('dotenv').config()


//connecting to mongodb
let mongoURI = process.env.DATABASEURL;
//seting up jwt token
let jwtKey = process.env.JWTKEY;


app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});


mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose
  .connect(mongoURI)
  .then(() => console.log("db connection successful"))
  .catch(err => console.log(err));

// Create mongo connection
const conn = mongoose.createConnection(mongoURI);
autoIncrement.initialize(conn);
// app.use(bodyParser.urlencoded({ extended: true }));

//for request body
app.use(express.json());
//////////////////////////////////
//////////////////Employee
var employeeSchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  age: { type: String, required: true }, 
  Email: { type: String, required: true, unique: true }, 
  DOB: { type: Date, required: true },  
  address: { type: String, required: true }, 
  Photo: { type: String }  
});
employeeSchema.plugin(autoIncrement.plugin, {
  model: "Employee",
  field: "EmployeeID"
});

var Employee = mongoose.model("Employee", employeeSchema);


/////////////////////////////////
/////////////////////Employee

app.get("/api/employee", verifyHR, (req, res) => {
  // {path: 'projects', populate: {path: 'portals'}}
  Employee.find()
    .populate({
      path: "position"
    })    
    .exec(function (err, employee) {
      res.send(employee);
    });
});

app.post("/api/employee", verifyHR, (req, res) => {
  Joi.validate(req.body, EmployeeValidation, (err, result) => {
    if (err) {
      console.log(err);
      res.status(400).send(err.details[0].message);
    } else {
      let newEmployee;

      newEmployee = {
        Email: req.body.Email,
        name: req.body.name,       
        age: req.body.age,       
        DOB: req.body.DOB,
        address: req.body.address              
      };

      Employee.create(newEmployee, function (err, employee) {
        if (err) {
          console.log(err);
          res.send("error");
        } else {
          res.send(employee);

          console.log("new employee Saved");
        }
      });
      console.log(req.body);
    }
  });
});

app.put("/api/employee/:id", verifyHR, (req, res) => {
  Joi.validate(req.body, EmployeeValidationUpdate, (err, result) => {
    if (err) {
      console.log(err);
      res.status(400).send(err.details[0].message);
    } else {
      let newEmployee;
      newEmployee = {
        Email: req.body.Email,
        name: req.body.name    
      };

      Employee.findByIdAndUpdate(req.params.id, newEmployee, function (
        err,
        employee
      ) {
        if (err) {
          res.send("error");
        } else {
          res.send(newEmployee);
        }
      });
    }

    console.log("put");
    console.log(req.body);
  });
});

app.delete("/api/employee/:id", verifyHR, (req, res) => {  
  res.send("error");
  console.log("delete");
  console.log(req.params.id);
});


var port = process.env.PORT;
if (port & process.env.IP) {
  app.listen(port, process.env.IP, () => {
    console.log("started");
  });
} else
  app.listen(port, () => console.log(`Example app listening on port ${port}!`));
