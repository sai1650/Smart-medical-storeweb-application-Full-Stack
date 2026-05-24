const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

// Connection to MongoDB
const mongoUrl = (process.env.MONGODB_URI || "mongodb://localhost:27017/smart_medical_store")
  .trim()
  .replace(/^['"]|['"]$/g, '');

mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  });

// Define Schemas
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "staff", enum: ["admin", "staff"] },
  name: String,
  email: String,
  phone: String,
  photo: String,
  resetOTP: Number,
  otpExpiry: Date,
  created_at: { type: Date, default: Date.now }
});

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  company: { type: String, index: true },
  price: { type: Number, default: 0 },
  quantity: { type: Number, default: 0 },
  rack: String,
  shelf: String,
  created_at: { type: Date, default: Date.now }
});

// Create Models
const User = mongoose.model("User", userSchema);
const Medicine = mongoose.model("Medicine", medicineSchema);

// Seed Data
async function seedDatabase() {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Medicine.deleteMany({});
    console.log("✅ Cleared existing data");

    // Create Users
    const users = await User.insertMany([
      {
        username: "admin",
        password: "admin",
        role: "admin",
        name: "Admin User",
        email: "admin@pharmaflow.com",
        phone: "9876543210"
      },
      {
        username: "staff",
        password: "staff",
        role: "staff",
        name: "Staff Member",
        email: "staff@pharmaflow.com",
        phone: "9876543211"
      }
    ]);
    console.log("✅ Users created:", users.length);

    // Create Sample Medicines
    const medicines = await Medicine.insertMany([
      {
        name: "Aspirin",
        company: "Bayer",
        price: 50,
        quantity: 100,
        rack: "R1",
        shelf: "S1"
      },
      {
        name: "Ibuprofen",
        company: "Pfizer",
        price: 75,
        quantity: 85,
        rack: "R1",
        shelf: "S2"
      },
      {
        name: "Paracetamol",
        company: "GSK",
        price: 40,
        quantity: 150,
        rack: "R1",
        shelf: "S3"
      },
      {
        name: "Amoxicillin",
        company: "Abbott",
        price: 120,
        quantity: 50,
        rack: "R2",
        shelf: "S1"
      },
      {
        name: "Ciprofloxacin",
        company: "Cipla",
        price: 90,
        quantity: 60,
        rack: "R2",
        shelf: "S2"
      },
      {
        name: "Metformin",
        company: "Generic",
        price: 65,
        quantity: 200,
        rack: "R2",
        shelf: "S3"
      },
      {
        name: "Lisinopril",
        company: "Merck",
        price: 110,
        quantity: 75,
        rack: "R3",
        shelf: "S1"
      },
      {
        name: "Atorvastatin",
        company: "Pfizer",
        price: 95,
        quantity: 120,
        rack: "R3",
        shelf: "S2"
      },
      {
        name: "Omeprazole",
        company: "AstraZeneca",
        price: 85,
        quantity: 90,
        rack: "R3",
        shelf: "S3"
      },
      {
        name: "Diphenhydramine",
        company: "Johnson & Johnson",
        price: 55,
        quantity: 110,
        rack: "R4",
        shelf: "S1"
      }
    ]);
    console.log("✅ Medicines created:", medicines.length);

    console.log("\n✅ Database seeding complete!");
    console.log("\nTest Credentials:");
    console.log("Username: admin, Password: admin");
    console.log("Username: staff, Password: staff");

    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Error seeding database:", err.message);
    mongoose.connection.close();
    process.exit(1);
  }
}

seedDatabase();
