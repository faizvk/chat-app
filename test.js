import express from "express";
import bcrypt from "bcrypt";

const app = express();
app.use(express.json());
const router = express.Router();

// ✅ HARD-CODED USERS STORAGE (IN MEMORY)
const users = [];

// ✅ SIGNUP ROUTE
router.post("/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).send("Email and password required");
    }

    // ✅ Check if user already exists
    const existingUser = users.find((user) => user.email === email);
    if (existingUser) {
      return res.status(400).send("User already exists");
    }

    // ✅ Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      id: users.length + 1,
      name,
      email,
      password: hashedPassword,
    };

    users.push(newUser);

    res.status(201).json({
      message: "created",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Signup failed", error });
  }
});

// ✅ LOGIN ROUTE
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send("fields required");
    }

    // ✅ Find user in hard-coded array
    const user = users.find((user) => user.email === email);

    if (!user) {
      return res.status(400).send("invalid credentials");
    }

    // ✅ Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).send("invalid credentials");
    }

    res.status(200).json({
      message: "success",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error });
  }
});

app.use(router);

app.listen(3000, () => {
  console.log("listening on port 3000...");
});
