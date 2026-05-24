const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const mongoUrl = (process.env.MONGODB_URI || "mongodb://localhost:27017/smart_medical_store")
  .trim()
  .replace(/^['"]|['"]$/g, '');

mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(async () => {
    console.log("✅ MongoDB Connected");
    
    const medicineSchema = new mongoose.Schema({
      name: { type: String, required: true, index: true },
      company: { type: String, index: true },
      price: { type: Number, default: 0 },
      quantity: { type: Number, default: 0 },
      rack: String,
      shelf: String,
      created_at: { type: Date, default: Date.now }
    });
    
    const Medicine = mongoose.model("Medicine", medicineSchema);
    
    // Count medicines
    const count = await Medicine.countDocuments();
    console.log(`📊 Total medicines in database: ${count}`);
    
    // Get first 5 items
    const first5 = await Medicine.find().limit(5);
    console.log("\n📋 First 5 medicines:");
    console.log(JSON.stringify(first5, null, 2));
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error("❌ Error:", err.message);
    process.exit(1);
  });
