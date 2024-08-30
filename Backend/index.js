const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require("cors"); 

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});

mongoose.connect("mongodb+srv://jeevacharan21:sravani25@cluster0.pcktdxu.mongodb.net/")
  .then(() => console.log('DB connection successful'))
  .catch(err => console.error('Failed to connect to MongoDB', err));

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());


const authSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
});

const UserActivation = mongoose.model("UserActivation", authSchema);

const citySchema = new mongoose.Schema({
  City: {
    type: String,
    required: true,
  },
  place_name: {
    type: String,
    required: true,
  },
  place_type: {
    type: String,
    required: true,
  },
  Ratings: {
    type: String,
    required: true,
  },
  Best_time_to_visit: {
    type: String,
    required: true
  },
  place_desc: {
    type: String,
    required: true,
  }
});

const places = mongoose.model("places", citySchema);

app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await UserActivation.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User with the same email already exists" });
    }

    let user = new UserActivation({
      name,
      email,
      password: hashedPassword
    });

    user = await user.save();

    res.json(user);
  } catch (e) {
    console.error("Error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserActivation.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User with this email does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Incorrect password" });
    }

    const token = jwt.sign({ id: user._id }, "your_secret_key_here");

    res.json({ token, user });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/places/insert", async(req,res) => {
  try {
    const { City, place_name, place_type, Ratings, Best_time_to_visit, place_desc } = req.body;
    if (!City) {
      return res.status(400).json({ msg: "City not entered" });
    }

    let plan = new places({
      City,
      place_name,
      place_type,
      Ratings,
      Best_time_to_visit,
      place_desc
    });
    plan = await plan.save();

    res.json(plan);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/places", async (req, res) => {
  try {
    const { cityname } = req.query;

    const places1 = await places.find({ City: cityname });

    if (!places1 || places1.length === 0) {
      return res.status(404).json({ error: "City not found" });
    }

    res.json({ places1 });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});