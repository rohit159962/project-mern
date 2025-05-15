const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");

app.use(express.json());
app.use(cors());

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Database Connection With MongoDB
mongoose.connect(
  process.env.MONGO_URI || "mongodb+srv://rthakur2270:rohit1599@cluster0.xizfvit.mongodb.net/clothify",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
).then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Image Storage Engine (Memory Storage for Render)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Creating Upload Endpoint for images
app.post("/upload", upload.single("product"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: 0, message: "No file uploaded" });
  }

  try {
    const result = await cloudinary.uploader.upload_stream(
      { folder: "clothify_products", public_id: `product_${Date.now()}` },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return res.status(500).json({ success: 0, message: "Cloudinary upload error" });
        }
        res.json({ success: 1, image_url: result.secure_url });
      }
    ).end(req.file.buffer);
  } catch (error) {
    console.error("Upload endpoint error:", error);
    res.status(500).json({ success: 0, message: "Failed to upload image" });
  }
});

// Schema for creating products
const Product = mongoose.model("Product", {
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  new_price: {
    type: Number,
    required: true,
  },
  old_price: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  available: {
    type: Boolean,
    default: true,
  },
});

app.post("/addproduct", async (req, res) => {
  try {
    console.log("Add product request body:", req.body);
    const { name, image, category, new_price, old_price } = req.body;

    // Validate input
    if (!name || !image || !category || !new_price || !old_price) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Generate ID
    let products = await Product.find({}).sort({ id: -1 });
    let id = products.length > 0 ? products[0].id + 1 : 1;

    // Create product
    const product = new Product({
      id,
      name,
      image,
      category,
      new_price: Number(new_price),
      old_price: Number(old_price),
    });

    await product.save();
    console.log("Product saved:", product);

    res.json({
      success: true,
      name,
    });
  } catch (error) {
    console.error("Add product error:", error);
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
});

// Creating API for deleting a product
app.post("/removeproduct", async (req, res) => {
  try {
    await Product.findOneAndDelete({ id: req.body.id });
    console.log("Product removed:", req.body.id);
    res.json({
      success: true,
      name: req.body.name,
    });
  } catch (error) {
    console.error("Remove product error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Creating API for getting all products
app.get("/allproducts", async (req, res) => {
  try {
    let products = await Product.find({});
    console.log("All products fetched");
    res.send(products);
  } catch (error) {
    console.error("All products error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Schema creating for user model
const Users = mongoose.model("Users", {
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  cartData: {
    type: Object,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// Creating Endpoint for registering the user
app.post("/signup", async (req, res) => {
  try {
    let check = await Users.findOne({ email: req.body.email });
    if (check) {
      return res.status(400).json({
        success: false,
        errors: "User Already Exists",
      });
    }
    let cart = {};
    for (let i = 0; i <= 300; i++) {
      cart[i] = 0;
    }
    const user = new Users({
      name: req.body.username,
      email: req.body.email,
      password: req.body.password,
      cartData: cart,
    });
    await user.save();
    const data = {
      user: {
        id: user.id,
      },
    };
    const token = jwt.sign(data, "secret_ecom");
    res.json({
      success: true,
      token,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Creating endpoint for user login
app.post("/login", async (req, res) => {
  try {
    let user = await Users.findOne({ email: req.body.email });
    if (user) {
      const passCompare = req.body.password === user.password;
      if (passCompare) {
        const data = {
          user: {
            id: user.id,
          },
        };
        const token = jwt.sign(data, "secret_ecom");
        res.json({
          success: true,
          token,
        });
      } else {
        res.json({
          success: false,
          errors: "Incorrect Password",
        });
      }
    } else {
      res.json({
        success: false,
        errors: "User Not Found",
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Creating endpoint for new collection on home page
app.get("/newcollections", async (req, res) => {
  try {
    let products = await Product.find({});
    let newcollection = products.slice(1).slice(-8);
    res.send(newcollection);
  } catch (error) {
    console.error("New collections error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Creating endpoint for popular in women category on home page
app.get("/popularinwomen", async (req, res) => {
  try {
    let products = await Product.find({ category: "women" });
    let popular_in_women = products.slice(0, 4);
    res.send(popular_in_women);
  } catch (error) {
    console.error("Popular in women error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Creating middleware to fetch user
const fetchUser = async (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    res.status(401).send({
      success: false,
      errors: "Please authenticate using a valid token",
    });
  }
  try {
    const data = jwt.verify(token, "secret_ecom");
    req.user = data.user;
    next();
  } catch (error) {
    res.status(401).send({
      success: false,
      errors: "Please authenticate using a valid token",
    });
  }
};

// Creating endpoint for adding products in cartdata
app.post("/addtocart", fetchUser, async (req, res) => {
  try {
    let userData = await Users.findOne({ _id: req.user.id });
    userData.cartData[req.body.itemId] += 1;
    await Users.findOneAndUpdate(
      { _id: req.user.id },
      { cartData: userData.cartData }
    );
    res.send("Added");
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Creating endpoint to remove products from cartData
app.post("/removefromcart", fetchUser, async (req, res) => {
  try {
    let userData = await Users.findOne({ _id: req.user.id });
    if (userData.cartData[req.body.itemId] > 0)
      userData.cartData[req.body.itemId] -= 1;
    await Users.findOneAndUpdate(
      { _id: req.user.id },
      { cartData: userData.cartData }
    );
    res.send("Removed");
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Creating endpoint to get cartdata
app.post("/getcart", fetchUser, async (req, res) => {
  try {
    let userData = await Users.findOne({ _id: req.user.id });
    res.json(userData.cartData);
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/", (req, res) => {
  res.send("Express App is Running");
});

app.listen(port, (error) => {
  if (!error) {
    console.log("Server Running on Port " + port);
  } else {
    console.error("Server error:", error);
  }
});
