import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

// establish server and database connection
const app = express();
const port = process.env.PORT || 3000;
const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

var doctors = [];

// start server
app.listen(port, () => {
  console.log(`It's me, port ${port}, I'm the listening port it's me`);
});

async function getDoctors() {
  return await db.query("SELECT d.incarnation, d.id AS doctor_id, a.name AS actor_name FROM doctors d INNER JOIN actors a ON d.primary_actor = a.id");
}

// home route with doctors query for display and user selection
app.get("/", async (req, res) => {
  doctors = await getDoctors();
  console.log(doctors.rows);
  res.render("docWho.ejs", {data1: doctors});
});

// get selected doctor info from database
app.post("/doctorInfo", async (req, res) => {
  const selectedDoctor = req.body.selectedDoctor;
  console.log(`Selected Doctor: ${selectedDoctor}`); // Log the selected doctor's value
  doctors = await getDoctors();
  const selectedDoctorRecord = doctors.rows.find(doctor => doctor.doctor_id == selectedDoctor);
    console.log(selectedDoctorRecord); // Log the selected doctor's record

    try {
      const doctorInfoCompanion = await db.query(`
      SELECT DISTINCT c.name AS companion_name
      FROM public.companions c
      JOIN public.serials_companions sc ON c.id = sc.companion_id
      JOIN public.serials s ON sc.serial_id = s.id
      JOIN public.serials_doctors sd ON s.id = sd.serial_id
      WHERE sd.doctor_id = $1`, [selectedDoctor]);
      
      console.log(doctorInfoCompanion.rows); // Log the companions

      const doctorInfoSerials = await db.query(`
      SELECT s.title FROM serials s JOIN serials_doctors sd ON s.id = sd.serial_id WHERE sd.doctor_id = $1`, [selectedDoctor]);

      console.log(doctorInfoSerials.rows); // Log the serials

      res.render("doctorInfoOverview.ejs", {data1: doctorInfoCompanion.rows, data2: doctorInfoSerials.rows, doctor: selectedDoctorRecord});

    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    };
});