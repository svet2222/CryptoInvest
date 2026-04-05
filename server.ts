import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";

dotenv.config();

// MongoDB Connection
import mongoose from "mongoose";
const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error("MONGODB_URI not set");
  process.exit(1);
}
mongoose.connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";
// MONGODB_URI is now handled above

// --- MODELS ---
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  walletBalance: { type: Number, default: 0 },
  totalDeposits: { type: Number, default: 0 },
  totalWithdrawals: { type: Number, default: 0 },
  referralCode: { type: String, unique: true },
  referredBy: { type: String, default: null },
  totalReferralEarnings: { type: Number, default: 0 },
  totalProfitEarned: { type: Number, default: 0 },
  totalBonusReceived: { type: Number, default: 0 },
  bonusBalance: { type: Number, default: 0 },
  hasSeenBonusPopup: { type: Boolean, default: false },
  hasDeposited: { type: Boolean, default: false },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  isVerified: { type: Boolean, default: false },
  kyc: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    country: String,
    state: String,
    city: String,
    address: String,
    pincode: String,
    idFrontImage: String,
    idBackImage: String,
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: null
    },
    submittedAt: Date
  },
  createdAt: { type: Date, default: Date.now },
});

const depositSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  txHash: { type: String, required: true },
  promoCode: { type: String, default: null },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  timestamp: { type: Date, default: Date.now },
});

const withdrawalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  charge: { type: Number, default: 0 },
  finalAmount: { type: Number, required: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  timestamp: { type: Date, default: Date.now },
});

const feesSchema = new mongoose.Schema({
  fixedCharge: { type: Number, default: 0 },
  percentageCharge: { type: Number, default: 0 },
  minAmount: { type: Number, default: 10 },
  maxAmount: { type: Number, default: 10000 },
  dailyLimit: { type: Number, default: 5000 },
  monthlyLimit: { type: Number, default: 50000 },
  updatedAt: { type: Date, default: Date.now }
});

const investmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  planName: { type: String, required: true },
  amount: { type: Number, required: true },
  minDailyProfit: { type: Number, required: true },
  maxDailyProfit: { type: Number, required: true },
  duration: { type: Number, required: true },
  startDate: { type: Date, default: null },
  maturityDate: { type: Date, required: true },
  lastProfitDate: { type: Date, default: null },
  totalProfitEarned: { type: Number, default: 0 },
  status: { type: String, enum: ["pending", "active", "completed", "rejected"], default: "pending" },
});

const profitHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  investmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Investment", required: true },
  amountInvested: { type: Number, required: true },
  amount: { type: Number, required: true },
  percentage: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

const configSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
});

const referralHistorySchema = new mongoose.Schema({
  referrerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  referredId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  commission: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

const kycSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  country: String,
  state: String,
  city: String,
  address: String,
  pincode: String,
  idFrontImage: String,
  idBackImage: String,
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  submittedAt: { type: Date, default: Date.now },
});

const walletSchema = new mongoose.Schema({
  coin: { type: String, default: "USDT" },
  network: { type: String, required: true },
  address: { type: String, required: true },
  qrCode: { type: String },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  createdAt: { type: Date, default: Date.now },
});

const supportTicketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  messages: [
    {
      sender: { type: String, enum: ["user", "admin"], required: true },
      text: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }
  ],
  status: { type: String, enum: ["open", "closed"], default: "open" },
  lastMessageAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);
const Deposit = mongoose.model("Deposit", depositSchema);
const Withdrawal = mongoose.model("Withdrawal", withdrawalSchema);
const Investment = mongoose.model("Investment", investmentSchema);
const ProfitHistory = mongoose.model("ProfitHistory", profitHistorySchema);
const Config = mongoose.model("Config", configSchema);
const ReferralHistory = mongoose.model("ReferralHistory", referralHistorySchema);
const KYC = mongoose.model("KYC", kycSchema);

const bonusSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  type: { type: String, default: "deposit_bonus" },
  status: { type: String, enum: ["locked", "unlocked"], default: "locked" },
  promoCode: String,
  createdAt: { type: Date, default: Date.now },
});
const offerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  bonusPercent: { type: Number, required: true },
  minDeposit: { type: Number, required: true },
  maxBonus: { type: Number, default: null },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});
const Offer = mongoose.model("Offer", offerSchema);

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["deposit", "withdrawal", "investment", "profit", "referral", "bonus"], required: true },
  amount: { type: Number, required: true },
  source: { type: String, default: null }, // e.g., "promo", "referral_commission"
  status: { type: String, enum: ["pending", "completed", "failed"], default: "completed" },
  timestamp: { type: Date, default: Date.now }
});
const Transaction = mongoose.model("Transaction", transactionSchema);

const Bonus = mongoose.model("Bonus", bonusSchema);
const Wallet = mongoose.model("Wallet", walletSchema);
const Fees = mongoose.model("Fees", feesSchema);
const SupportTicket = mongoose.model("SupportTicket", supportTicketSchema);

const planSchema = new mongoose.Schema({
  name: { type: String, required: true },
  minAmount: { type: Number, required: true },
  maxAmount: { type: Number, required: true },
  minDailyProfit: { type: Number, required: true },
  maxDailyProfit: { type: Number, required: true },
  duration: { type: Number, required: true },
  totalReturn: { type: Number, required: true },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  createdAt: { type: Date, default: Date.now }
});
const Plan = mongoose.model("Plan", planSchema);

// --- PROFIT SIMULATION ENGINE ---
const runProfitSimulation = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log("[Profit Engine] Waiting for database connection...");
      return;
    }
    const isPaused = await Config.findOne({ key: "profit_system_paused" });
    if (isPaused?.value === true) {
      console.log("[Profit Engine] System is paused.");
      return;
    }

    const mode = await Config.findOne({ key: "profit_system_mode" });
    const isManual = mode?.value === "manual";

    const activeInvestments = await Investment.find({ status: "active" });
    console.log(`[Profit Engine] Processing ${activeInvestments.length} investments...`);

    for (const inv of activeInvestments) {
      const now = new Date();
      
      // Check maturity (Always automatic)
      if (now >= inv.maturityDate) {
        console.log(`[Profit Engine] Investment ${inv._id} matured. Completing.`);
        await Investment.findByIdAndUpdate(inv._id, { status: "completed" });
        await User.findByIdAndUpdate(inv.userId, {
          $inc: { walletBalance: inv.amount }
        });
        
        const transaction = new Transaction({
          userId: inv.userId,
          type: "investment",
          amount: inv.amount,
          source: `Investment Matured: ${inv.planName}`,
          status: "completed"
        });
        await transaction.save();
        continue; // Skip profit for this run if matured
      }

      // Skip auto-profit if in manual mode
      if (isManual) continue;

      // Check if 24 hours passed since last profit
      let lastProfit: Date;
      if (inv.lastProfitDate instanceof Date) {
        lastProfit = inv.lastProfitDate;
      } else if (inv.startDate instanceof Date) {
        lastProfit = inv.startDate;
      } else {
        lastProfit = new Date();
      }
      const diffHours = (now.getTime() - lastProfit.getTime()) / (1000 * 60 * 60);

      if (diffHours >= 23) {
        const randomPercent = Math.random() * (inv.maxDailyProfit - inv.minDailyProfit) + inv.minDailyProfit;
        const profitAmount = (inv.amount * randomPercent) / 100;

        if (isNaN(profitAmount)) {
          console.error(`[Profit Engine] Invalid profit calculation for investment ${inv._id}`);
          continue;
        }

        console.log(`[Profit Engine] Applying ${randomPercent.toFixed(2)}% profit to investment ${inv._id}`);

        // Update Investment
        await Investment.findByIdAndUpdate(inv._id, {
          $inc: { totalProfitEarned: profitAmount },
          $set: { lastProfitDate: now }
        });

        // Update User Wallet with profit
        await User.findByIdAndUpdate(inv.userId, {
          $inc: { 
            walletBalance: profitAmount,
            totalProfitEarned: profitAmount
          }
        });

        // Save History
        const history = new ProfitHistory({
          userId: inv.userId,
          investmentId: inv._id,
          amountInvested: inv.amount,
          amount: profitAmount,
          percentage: randomPercent,
          timestamp: now
        });
        await history.save();

        const transaction = new Transaction({
          userId: inv.userId,
          type: "profit",
          amount: profitAmount,
          source: `Auto Profit: ${inv.planName}`,
          status: "completed"
        });
        await transaction.save();
      }
    }
  } catch (err) {
    console.error("[Profit Engine] Error:", err);
  }
};

// --- MIDDLEWARE ---
const authenticate = async (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      console.warn(`[Auth] User not found for ID: ${decoded.id}`);
      return res.status(401).json({ message: "User no longer exists" });
    }
    next();
  } catch (err: any) {
    console.warn(`[Auth] Token verification failed: ${err.message}`);
    res.status(401).json({ message: "Session expired or invalid. Please login again." });
  }
};

const isAdmin = (req: any, res: any, next: any) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Admin access required" });
  }
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // MongoDB connection is now handled before server starts

  // Start Profit Engine after successful DB connection
  console.log("🚀 Starting Profit Engine...");
  setInterval(runProfitSimulation, 1000 * 60 * 60);
  setTimeout(runProfitSimulation, 5000);

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      message: mongoose.connection.readyState === 1 ? "Database is ready" : "Database connection failed. Check MONGODB_URI secret."
    });
  });

  // --- AUTH ROUTES ---
  app.post("/api/auth/register", async (req, res) => {
    const { name, email, password, referralCode } = req.body;
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ message: "User already exists" });

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUserReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        referralCode: newUserReferralCode,
        referredBy: referralCode || null,
        // Bootstrap admin
        role: email.toLowerCase() === "patelsvet108@gmail.com" ? "admin" : "user",
      });

      await newUser.save();
      res.status(201).json({ message: "User registered successfully" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: "Invalid credentials" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

      const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1d" });
      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          walletBalance: user.walletBalance,
          totalDeposits: user.totalDeposits,
          totalWithdrawals: user.totalWithdrawals,
          referralCode: user.referralCode,
          totalReferralEarnings: user.totalReferralEarnings,
          bonusBalance: user.bonusBalance,
          hasSeenBonusPopup: user.hasSeenBonusPopup,
          hasDeposited: user.hasDeposited,
        },
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/auth/me", authenticate, (req: any, res) => {
    res.json(req.user);
  });

  app.get("/api/user/profile", authenticate, (req: any, res) => {
    res.json(req.user);
  });

  // --- USER ROUTES ---
  app.get("/api/dashboard/stats", authenticate, async (req: any, res) => {
    try {
      const user = await User.findById(req.user._id);
      res.json(user);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/deposits", authenticate, async (req: any, res) => {
    const { amount, txHash, promoCode } = req.body;
    try {
      const deposit = new Deposit({
        userId: req.user._id,
        amount,
        txHash,
        promoCode: promoCode || null,
      });
      await deposit.save();
      res.status(201).json(deposit);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/deposits", authenticate, async (req: any, res) => {
    try {
      const deposits = await Deposit.find({ userId: req.user._id }).sort({ timestamp: -1 });
      res.json(deposits);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/bonus-config", async (req, res) => {
    try {
      const config = await Config.findOne({ key: "bonus_popup_config" });
      if (!config) {
        // Default config
        const defaultConfig = {
          isEnabled: true,
          bonusPercentage: 10,
          promoCode: "WELCOME10",
          bannerUrl: "https://picsum.photos/seed/bonus/800/400",
          title: "🎁 Deposit Bonus Offer",
          description: "Get 10% instant bonus on your first deposit"
        };
        await Config.create({ key: "bonus_popup_config", value: defaultConfig });
        return res.json(defaultConfig);
      }
      res.json(config.value);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.put("/api/user/popup-seen", authenticate, async (req: any, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (user) {
        user.hasSeenBonusPopup = true;
        await user.save();
        res.json({ message: "Popup marked as seen" });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/fees", async (req, res) => {
    try {
      let fees = await Fees.findOne();
      if (!fees) {
        fees = await Fees.create({});
      }
      res.json(fees);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.put("/api/admin/fees", authenticate, isAdmin, async (req, res) => {
    try {
      let fees = await Fees.findOne();
      if (!fees) {
        fees = new Fees(req.body);
      } else {
        Object.assign(fees, req.body);
        fees.updatedAt = new Date();
      }
      await fees.save();
      res.json(fees);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/withdrawals", authenticate, async (req: any, res) => {
    const { amount } = req.body;
    try {
      const user = await User.findById(req.user._id);
      if (!user) return res.status(404).json({ message: "User not found" });

      if (!user.isVerified) {
        return res.status(403).json({ message: "Please complete account verification to enable withdrawals" });
      }

      // Get Fees Config
      let fees = await Fees.findOne();
      if (!fees) fees = await Fees.create({});

      // Range Check
      if (amount < fees.minAmount) return res.status(400).json({ message: `Minimum withdrawal is ${fees.minAmount} USDT` });
      if (amount > fees.maxAmount) return res.status(400).json({ message: `Maximum withdrawal is ${fees.maxAmount} USDT` });

      // Limit Checks
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const dailyWithdrawals = await Withdrawal.find({
        userId: req.user._id,
        status: { $ne: "rejected" },
        timestamp: { $gte: startOfDay }
      });
      const monthlyWithdrawals = await Withdrawal.find({
        userId: req.user._id,
        status: { $ne: "rejected" },
        timestamp: { $gte: startOfMonth }
      });

      const dailyTotal = dailyWithdrawals.reduce((acc, w) => acc + w.amount, 0);
      const monthlyTotal = monthlyWithdrawals.reduce((acc, w) => acc + w.amount, 0);

      if (dailyTotal + amount > fees.dailyLimit) return res.status(400).json({ message: "Daily withdrawal limit exceeded" });
      if (monthlyTotal + amount > fees.monthlyLimit) return res.status(400).json({ message: "Monthly withdrawal limit exceeded" });

      // Check for active investments lock-in
      const activeInvestments = await Investment.find({ 
        userId: req.user._id, 
        status: "active" 
      });

      if (activeInvestments.length > 0) {
        return res.status(400).json({ message: "Your investment is still in lock-in period. Withdrawal available only after maturity." });
      }

      if (user.walletBalance < amount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      // Calculate Charge
      let charge = 0;
      if (fees.fixedCharge > 0) {
        charge = fees.fixedCharge;
      } else {
        charge = (amount * fees.percentageCharge) / 100;
      }

      const finalAmount = amount - charge;
      if (finalAmount <= 0) return res.status(400).json({ message: "Withdrawal amount too low after charges" });

      const withdrawal = new Withdrawal({
        userId: req.user._id,
        amount,
        charge,
        finalAmount,
      });
      await withdrawal.save();

      user.walletBalance -= amount;
      await user.save();

      res.status(201).json(withdrawal);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/withdrawals", authenticate, async (req: any, res) => {
    try {
      const withdrawals = await Withdrawal.find({ userId: req.user._id }).sort({ timestamp: -1 });
      res.json(withdrawals);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/investments", authenticate, async (req: any, res) => {
    const { planName, amount, minDailyProfit, maxDailyProfit, duration } = req.body;
    try {
      const user = await User.findById(req.user._id);
      if (!user) return res.status(404).json({ message: "User not found" });
      
      if (user.walletBalance < amount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      // We'll set a temporary maturity date, it will be recalculated on admin approval
      const tempMaturityDate = new Date();
      tempMaturityDate.setDate(tempMaturityDate.getDate() + duration);

      const investment = new Investment({
        userId: req.user._id,
        planName,
        amount,
        minDailyProfit,
        maxDailyProfit,
        duration,
        maturityDate: tempMaturityDate,
        status: "pending",
        startDate: null,
        lastProfitDate: null
      });
      await investment.save();

      user.walletBalance -= amount;
      await user.save();

      // Unlock bonus if applicable (if investment amount >= bonus amount)
      const lockedBonus = await Bonus.findOne({ userId: req.user._id, status: "locked" });
      if (lockedBonus && amount >= lockedBonus.amount) {
        lockedBonus.status = "unlocked";
        await lockedBonus.save();
        
        const updatedUser = await User.findById(req.user._id);
        if (updatedUser) {
          updatedUser.walletBalance += lockedBonus.amount;
          updatedUser.bonusBalance -= lockedBonus.amount;
          await updatedUser.save();
        }
      }

      res.status(201).json({ 
        message: "Note: Your investment will start after admin approval.",
        investment 
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/investments", authenticate, async (req: any, res) => {
    try {
      const investments = await Investment.find({ userId: req.user._id }).sort({ startDate: -1 });
      res.json(investments);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // --- PLAN ROUTES ---
  app.get("/api/plans", async (req, res) => {
    try {
      const plans = await Plan.find({ status: "active" });
      res.json(plans);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/admin/plans", authenticate, isAdmin, async (req, res) => {
    try {
      const plans = await Plan.find().sort({ createdAt: -1 });
      res.json(plans);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/admin/plans", authenticate, isAdmin, async (req, res) => {
    try {
      const plan = new Plan(req.body);
      await plan.save();
      res.status(201).json(plan);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.put("/api/admin/plans/:id", authenticate, isAdmin, async (req, res) => {
    try {
      const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(plan);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.delete("/api/admin/plans/:id", authenticate, isAdmin, async (req, res) => {
    try {
      await Plan.findByIdAndDelete(req.params.id);
      res.json({ message: "Plan deleted" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // --- ADMIN INVESTMENT APPROVAL ---
  app.get("/api/admin/investments", authenticate, isAdmin, async (req, res) => {
    try {
      const investments = await Investment.find()
        .populate("userId", "name email")
        .sort({ startDate: -1 });
      res.json(investments);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.put("/api/admin/investments/:id/approve", authenticate, isAdmin, async (req, res) => {
    try {
      const inv = await Investment.findById(req.params.id);
      if (!inv) return res.status(404).json({ message: "Investment not found" });

      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 1); // today + 1
      startDate.setHours(0, 0, 0, 0);

      const maturityDate = new Date(startDate);
      maturityDate.setDate(maturityDate.getDate() + inv.duration);

      inv.status = "active";
      inv.startDate = startDate;
      inv.maturityDate = maturityDate;
      inv.lastProfitDate = startDate; // Start profit counting from startDate
      await inv.save();

      res.json({ message: "Investment approved" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.put("/api/admin/investments/:id/reject", authenticate, isAdmin, async (req, res) => {
    try {
      const inv = await Investment.findById(req.params.id);
      if (!inv) return res.status(404).json({ message: "Investment not found" });

      inv.status = "rejected";
      await inv.save();

      // Refund user balance
      const user = await User.findById(inv.userId);
      if (user) {
        user.walletBalance += inv.amount;
        await user.save();
      }

      res.json({ message: "Investment rejected and balance refunded" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/profits", authenticate, async (req: any, res) => {
    const { range, startDate, endDate } = req.query;
    try {
      let query: any = { userId: req.user._id };
      
      if (range) {
        const now = new Date();
        if (range === "today") {
          query.timestamp = { $gte: new Date(now.setHours(0, 0, 0, 0)) };
        } else if (range === "7days") {
          query.timestamp = { $gte: new Date(now.setDate(now.getDate() - 7)) };
        } else if (range === "30days") {
          query.timestamp = { $gte: new Date(now.setDate(now.getDate() - 30)) };
        }
      } else if (startDate && endDate) {
        query.timestamp = { 
          $gte: new Date(startDate), 
          $lte: new Date(endDate) 
        };
      }

      const profits = await ProfitHistory.find(query).sort({ timestamp: -1 });
      res.json(profits);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/transactions/all", authenticate, async (req: any, res) => {
    try {
      const [deposits, withdrawals, transactions] = await Promise.all([
        Deposit.find({ userId: req.user._id }),
        Withdrawal.find({ userId: req.user._id }),
        Transaction.find({ userId: req.user._id })
      ]);

      const combined = [
        ...deposits.map(d => ({ ...d.toObject(), type: 'deposit' })),
        ...withdrawals.map(w => ({ ...w.toObject(), type: 'withdrawal' })),
        ...transactions.map(t => ({ ...t.toObject() }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      res.json(combined);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/referrals", authenticate, async (req: any, res) => {
    try {
      const history = await ReferralHistory.find({ referrerId: req.user._id }).sort({ timestamp: -1 });
      res.json(history);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // --- VERIFICATION ROUTES ---
  app.post("/api/kyc", authenticate, upload.fields([
    { name: "idFrontImage", maxCount: 1 },
    { name: "idBackImage", maxCount: 1 }
  ]), async (req: any, res) => {
    try {
      console.log("KYC API HIT");
      console.log("BODY:", req.body);
      console.log("FILES:", req.files);

      const {
        firstName,
        lastName,
        email,
        phone,
        country,
        state,
        city,
        address,
        pincode
      } = req.body;

      const idFrontImage = req.files?.idFrontImage?.[0]?.path || "";
      const idBackImage = req.files?.idBackImage?.[0]?.path || "";

      let kyc = await KYC.findOne({ userId: req.user._id });
      
      const kycData = {
        userId: req.user._id,
        firstName: firstName || "",
        lastName: lastName || "",
        email: email || req.user.email,
        phone: phone || "",
        country: country || "",
        state: state || "",
        city: city || "",
        address: address || "",
        pincode: pincode || "",
        status: "pending",
        submittedAt: new Date()
      };

      if (idFrontImage) (kycData as any).idFrontImage = `/uploads/${path.basename(idFrontImage)}`;
      if (idBackImage) (kycData as any).idBackImage = `/uploads/${path.basename(idBackImage)}`;

      if (kyc) {
        Object.assign(kyc, kycData);
        await kyc.save();
      } else {
        kyc = await KYC.create(kycData);
      }

      console.log("KYC SAVED:", kyc);

      // Also update user kyc status for quick access
      // If user edits KYC, set isVerified to false
      await User.findByIdAndUpdate(req.user._id, { 
        "kyc.status": "pending",
        isVerified: false,
        kyc: {
          ...kycData,
          idFrontImage: (kycData as any).idFrontImage || kyc?.idFrontImage,
          idBackImage: (kycData as any).idBackImage || kyc?.idBackImage
        }
      });

      res.json({
        success: true,
        message: "KYC submitted successfully"
      });
    } catch (err: any) {
      console.log("KYC ERROR:", err);
      // Always show success as per request
      res.json({
        success: true,
        message: "KYC submitted successfully"
      });
    }
  });

  // Keep old route for compatibility but redirect to new logic if needed
  app.post("/api/verification", authenticate, async (req: any, res) => {
    console.log("Old /api/verification hit, redirecting to /api/kyc logic if possible");
    // For now, just handle it as before or return success
    res.json({ success: true, message: "KYC submitted successfully" });
  });

  app.get("/api/admin/verifications", authenticate, isAdmin, async (req, res) => {
    try {
      const kycRequests = await KYC.find().populate("userId", "name email").sort({ submittedAt: -1 });
      res.json(kycRequests);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.put("/api/admin/verifications/:id", authenticate, isAdmin, async (req, res) => {
    const { status } = req.body; // "approved" or "rejected"
    try {
      const kyc = await KYC.findById(req.params.id);
      if (!kyc) return res.status(404).json({ message: "KYC request not found" });

      kyc.status = status;
      await kyc.save();

      const user = await User.findById(kyc.userId);
      if (user) {
        user.isVerified = status === "approved";
        if (user.kyc) {
          user.kyc.status = status;
        }
        await user.save();
      }

      res.json({ message: `Verification ${status}` });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // --- WALLET ROUTES ---
  app.get("/api/wallets", async (req, res) => {
    try {
      const wallets = await Wallet.find({ status: "active" });
      res.json(wallets);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/admin/wallets", authenticate, isAdmin, async (req, res) => {
    try {
      const wallets = await Wallet.find().sort({ createdAt: -1 });
      res.json(wallets);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/admin/wallets", authenticate, isAdmin, async (req, res) => {
    try {
      const wallet = new Wallet(req.body);
      await wallet.save();
      res.status(201).json(wallet);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.put("/api/admin/wallets/:id", authenticate, isAdmin, async (req, res) => {
    try {
      const wallet = await Wallet.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(wallet);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.delete("/api/admin/wallets/:id", authenticate, isAdmin, async (req, res) => {
    try {
      await Wallet.findByIdAndDelete(req.params.id);
      res.json({ message: "Wallet deleted" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // --- SUPPORT ROUTES ---
  const getAutoReply = (text: string) => {
    const msg = text.toLowerCase();
    
    // Greetings
    if (msg === "hi" || msg === "hello" || msg === "hey" || msg.startsWith("hi ") || msg.startsWith("hello ") || msg === "namaste" || msg === "kem cho" || msg === "halo" || msg === "good morning" || msg === "gm" || msg === "good evening" || msg === "ge" || msg === "sup" || msg === "yo" || msg === "hi support" || msg === "hi admin" || msg === "hi team" || msg === "hi sir" || msg === "hello sir" || msg === "hi help" || msg === "hello help" || msg === "hi there" || msg === "hello there" || msg.includes("jai shree krishna") || msg.includes("jsk") || msg.includes("jai swaminarayan")) {
      return "Hi Sir 👋, kaise help kar sakta hu?";
    }

    // Withdrawal issues
    if (msg.includes("withdrawal") || msg.includes("paisa nahi mila") || msg.includes("withdraw pending") || msg.includes("withdrawal nahi aya") || msg.includes("paisa nahi aya") || msg.includes("withdraw nahi aya") || msg.includes("nikalna hai") || msg.includes("payment") || msg.includes("paisa kab ayega") || msg.includes("withdraw kab hoga") || msg.includes("withdrawal pending") || msg.includes("withdraw problem") || msg.includes("paisa nikalna hai") || msg.includes("withdraw nahi ho raha") || msg.includes("withdraw issue") || msg.includes("nikalna") || msg.includes("withdrawal problem") || msg.includes("withdraw help") || msg.includes("withdrawal help") || msg.includes("paisa kab milega") || msg.includes("paisa kyare avse") || msg.includes("withdraw kyak che") || msg.includes("paisa") || msg.includes("money")) {
      return "Sir, aapka withdrawal abhi processing me hai. Please 24 hours tak wait kare.";
    }

    // Deposit issues
    if (msg.includes("deposit") || msg.includes("amount add") || msg.includes("add nahi hua") || msg.includes("deposit nahi aya") || msg.includes("paisa add nahi hua") || msg.includes("paisa dala") || msg.includes("recharge") || msg.includes("paisa add karna hai") || msg.includes("deposit pending") || msg.includes("paisa kab add hoga") || msg.includes("deposit problem") || msg.includes("paisa add nahi ho raha") || msg.includes("deposit nahi ho raha") || msg.includes("deposit issue") || msg.includes("paisa add") || msg.includes("deposit help") || msg.includes("recharge help") || msg.includes("recharge nahi hua") || msg.includes("paisa add karva che") || msg.includes("recharge kem karvu")) {
      return "Sir, deposit confirm hone me thoda time lagta hai. Agar 10–15 min me reflect na ho to support ko bataye.";
    }

    // KYC issues
    if (msg.includes("kyc") || msg.includes("verify") || msg.includes("verification") || msg.includes("kyc pending") || msg.includes("verify nahi hua") || msg.includes("kyc kab hoga") || msg.includes("document") || msg.includes("id card") || msg.includes("aadhar") || msg.includes("pan card") || msg.includes("kyc approve") || msg.includes("kyc problem") || msg.includes("kyc nahi ho raha") || msg.includes("id verify") || msg.includes("kyc issue") || msg.includes("kyc verify") || msg.includes("kyc help") || msg.includes("verify help") || msg.includes("kyc kem karvu") || msg.includes("verify karvu che")) {
      return "Sir, aapka KYC abhi review me hai. Admin approve karega, please wait kare.";
    }

    // Profit / Bonus
    if (msg.includes("profit") || msg.includes("bonus") || msg.includes("profit kab milega") || msg.includes("bonus nahi mila") || msg.includes("paisa kab milega") || msg.includes("profit nahi aya") || msg.includes("earning") || msg.includes("interest") || msg.includes("return") || msg.includes("profit kab ayega") || msg.includes("bonus kab milega") || msg.includes("profit problem") || msg.includes("profit nahi mil raha") || msg.includes("bonus nahi aya") || msg.includes("profit issue") || msg.includes("earning nahi aya") || msg.includes("bonus help") || msg.includes("profit help") || msg.includes("paisa kyare malse")) {
      return "Sir, profit system ke according auto credit hota hai. Thoda wait kare ya plan details check kare.";
    }

    // Investment / Plans
    if (msg.includes("plan") || msg.includes("invest") || msg.includes("investment") || msg.includes("package") || msg.includes("kaunsa plan acha hai") || msg.includes("best plan") || msg.includes("plan details") || msg.includes("invest kem karvu")) {
      return "Sir, aap 'Investment Plans' section me jaakar best plans dekh sakte hai. Sabse zyada return wale plans top par hai.";
    }

    if (msg.length < 2 || msg === "?" || msg === "help" || msg === "support" || msg === "admin" || msg === "hello support" || msg === "hello admin" || msg === "hello team" || msg === "hello sir" || msg === "hi team" || msg === "hi help" || msg === "hello help" || msg === "hi there" || msg === "hello there") {
      return "Hi Sir 👋, kaise help kar sakta hu?";
    }

    return "Sir, please apni problem thoda detail me bataye.";
  };

  app.get("/api/support", authenticate, async (req: any, res) => {
    try {
      let ticket = await SupportTicket.findOne({ userId: req.user._id });
      res.json(ticket);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/support/message", authenticate, async (req: any, res) => {
    const { text } = req.body;
    try {
      let ticket = await SupportTicket.findOne({ userId: req.user._id });
      const newMessage = { sender: "user", text, timestamp: new Date() };

      if (!ticket) {
        ticket = new SupportTicket({
          userId: req.user._id,
          messages: [
            newMessage,
            { sender: "admin", text: getAutoReply(text), timestamp: new Date() }
          ],
          lastMessageAt: new Date()
        });
      } else {
        ticket.messages.push(newMessage);
        // Add auto-reply
        const autoReply = getAutoReply(text);
        ticket.messages.push({ sender: "admin", text: autoReply, timestamp: new Date() });
        ticket.lastMessageAt = new Date();
        ticket.status = "open";
      }

      await ticket.save();
      res.json(ticket);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/admin/support", authenticate, isAdmin, async (req, res) => {
    try {
      const tickets = await SupportTicket.find()
        .populate("userId", "name email")
        .sort({ lastMessageAt: -1 });
      res.json(tickets);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/admin/support/:id", authenticate, isAdmin, async (req, res) => {
    try {
      const ticket = await SupportTicket.findById(req.params.id).populate("userId", "name email");
      res.json(ticket);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/admin/support/:id/reply", authenticate, isAdmin, async (req, res) => {
    const { text } = req.body;
    try {
      const ticket = await SupportTicket.findById(req.params.id);
      if (!ticket) return res.status(404).json({ message: "Ticket not found" });

      ticket.messages.push({ sender: "admin", text, timestamp: new Date() });
      ticket.lastMessageAt = new Date();
      await ticket.save();
      res.json(ticket);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // --- OFFER ROUTES ---
  app.get("/api/offers/active", async (req, res) => {
    try {
      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ message: "Database connection is not ready. Please try again in a few seconds." });
      }
      const now = new Date();
      const activeOffer = await Offer.findOne({
        isActive: true,
        startTime: { $lte: now },
        endTime: { $gte: now }
      });
      res.json(activeOffer || null);
    } catch (err: any) {
      console.error("Error fetching active offer:", err);
      res.status(500).json({ message: "Internal server error while fetching active offer." });
    }
  });

  app.get("/api/admin/offers", authenticate, isAdmin, async (req, res) => {
    try {
      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ message: "Database connection is not ready." });
      }
      const offers = await Offer.find().sort({ createdAt: -1 });
      res.json(offers);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/admin/offers", authenticate, isAdmin, async (req, res) => {
    try {
      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ message: "Database connection is not ready." });
      }
      const newOffer = new Offer(req.body);
      await newOffer.save();
      res.status(201).json(newOffer);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.put("/api/admin/offers/:id", authenticate, isAdmin, async (req, res) => {
    try {
      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ message: "Database connection is not ready." });
      }
      const updatedOffer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(updatedOffer);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.delete("/api/admin/offers/:id", authenticate, isAdmin, async (req, res) => {
    try {
      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ message: "Database connection is not ready." });
      }
      await Offer.findByIdAndDelete(req.params.id);
      res.json({ message: "Offer deleted successfully" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });
  app.post("/api/admin/apply-return", authenticate, isAdmin, async (req, res) => {
    const { planName, percent } = req.body;
    console.log(`[Admin] Distributing ${percent}% profit for plan: ${planName}`);

    try {
      if (!planName || percent === undefined) {
        return res.status(400).json({ success: false, message: "Plan name and percent are required" });
      }

      const activeInvestments = await Investment.find({ planName, status: "active" });
      console.log(`[Admin] Found ${activeInvestments.length} active investments for ${planName}`);

      if (!activeInvestments.length) {
        return res.json({ success: false, message: "No active investments found for this plan" });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      let successCount = 0;
      let skipCount = 0;

      for (const inv of activeInvestments) {
        // Prevent double profit for the same investment today
        const alreadyGiven = await ProfitHistory.findOne({
          investmentId: inv._id,
          timestamp: { $gte: today, $lt: tomorrow }
        });

        if (alreadyGiven) {
          console.log(`[Admin] Profit already distributed for investment ${inv._id} today. Skipping.`);
          skipCount++;
          continue;
        }

        const amountChanged = (inv.amount * percent) / 100;
        
        if (isNaN(amountChanged)) {
          console.error(`[Admin] Invalid profit calculation for investment ${inv._id}`);
          continue;
        }

        // Update Investment
        await Investment.findByIdAndUpdate(inv._id, {
          $inc: { totalProfitEarned: amountChanged },
          $set: { lastProfitDate: new Date() }
        });
        
        // Update User Wallet
        await User.findByIdAndUpdate(inv.userId, {
          $inc: { 
            walletBalance: amountChanged,
            totalProfitEarned: amountChanged
          }
        });
        
        // Save History
        const history = new ProfitHistory({
          userId: inv.userId,
          investmentId: inv._id,
          amountInvested: inv.amount,
          amount: amountChanged,
          percentage: percent,
          timestamp: new Date()
        });
        await history.save();

        // Create Transaction Record
        const transaction = new Transaction({
          userId: inv.userId,
          type: "profit",
          amount: amountChanged,
          source: `Profit from ${planName}`,
          status: "completed"
        });
        await transaction.save();

        console.log({
          userId: inv.userId,
          investment: inv.amount,
          percent,
          profit: amountChanged
        });
        successCount++;
      }
      
      res.json({ 
        success: true, 
        message: `Successfully distributed profit to ${successCount} users. ${skipCount} skipped (already distributed).` 
      });
    } catch (err: any) {
      console.error("Profit Error:", err);
      res.status(500).json({ 
        success: false, 
        message: "Failed to apply return", 
        error: err.message 
      });
    }
  });

  app.post("/api/admin/config", authenticate, isAdmin, async (req, res) => {
    const { key, value } = req.body;
    try {
      await Config.findOneAndUpdate({ key }, { value }, { upsert: true });
      res.json({ message: "Config updated" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/admin/config", authenticate, isAdmin, async (req, res) => {
    try {
      const configs = await Config.find();
      res.json(configs);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/admin/investments", authenticate, isAdmin, async (req, res) => {
    try {
      const investments = await Investment.find().populate("userId", "name email").sort({ createdAt: -1 });
      res.json(investments);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.put("/api/admin/investments/:id/approve", authenticate, isAdmin, async (req, res) => {
    try {
      const investment = await Investment.findById(req.params.id);
      if (!investment || investment.status !== "pending") {
        return res.status(400).json({ message: "Invalid investment or already processed" });
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 1); // Next day
      startDate.setHours(0, 0, 0, 0);

      const maturityDate = new Date(startDate);
      maturityDate.setDate(maturityDate.getDate() + investment.duration);

      investment.status = "active";
      investment.startDate = startDate;
      investment.maturityDate = maturityDate;
      investment.lastProfitDate = startDate;
      await investment.save();

      res.json({ message: "Investment approved successfully", investment });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.put("/api/admin/investments/:id/reject", authenticate, isAdmin, async (req, res) => {
    try {
      const investment = await Investment.findById(req.params.id);
      if (!investment || investment.status !== "pending") {
        return res.status(400).json({ message: "Invalid investment or already processed" });
      }

      investment.status = "rejected";
      await investment.save();

      // Refund user balance
      const user = await User.findById(investment.userId);
      if (user) {
        user.walletBalance += investment.amount;
        await user.save();
      }

      res.json({ message: "Investment rejected and balance refunded" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });
  app.get("/api/admin/users", authenticate, isAdmin, async (req, res) => {
    try {
      const users = await User.find().select("-password");
      res.json(users);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.put("/api/admin/users/:id", authenticate, isAdmin, async (req, res) => {
    try {
      const oldUser = await User.findById(req.params.id);
      if (!oldUser) return res.status(404).json({ message: "User not found" });

      const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select("-password");
      
      if (updatedUser && req.body.walletBalance !== undefined && req.body.walletBalance !== oldUser.walletBalance) {
        const diff = req.body.walletBalance - oldUser.walletBalance;
        const transaction = new Transaction({
          userId: updatedUser._id,
          type: diff > 0 ? "deposit" : "withdrawal",
          amount: Math.abs(diff),
          source: "Admin Adjustment",
          status: "completed"
        });
        await transaction.save();
        console.log(`[Admin] Balance updated for ${updatedUser.email}: ${oldUser.walletBalance} -> ${updatedUser.walletBalance}`);
      }

      res.json(updatedUser);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/admin/deposits", authenticate, isAdmin, async (req, res) => {
    try {
      const deposits = await Deposit.find().populate("userId", "name email").sort({ timestamp: -1 });
      res.json(deposits);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.put("/api/admin/deposits/:id/approve", authenticate, isAdmin, async (req, res) => {
    try {
      const deposit = await Deposit.findById(req.params.id);
      if (!deposit || deposit.status !== "pending") return res.status(400).json({ message: "Invalid deposit" });

      deposit.status = "approved";
      await deposit.save();

      const user = await User.findById(deposit.userId);
      if (user) {
        const isFirstDeposit = !user.hasDeposited;
        user.walletBalance += deposit.amount;
        user.totalDeposits += deposit.amount;
        user.hasDeposited = true;

        // Deposit Bonus
        if (deposit.promoCode) {
          const now = new Date();
          const activeOffer = await Offer.findOne({
            code: deposit.promoCode,
            isActive: true,
            startTime: { $lte: now },
            endTime: { $gte: now },
            minDeposit: { $lte: deposit.amount }
          });

          if (activeOffer) {
            let bonusAmount = (deposit.amount * activeOffer.bonusPercent) / 100;
            if (activeOffer.maxBonus) {
              bonusAmount = Math.min(bonusAmount, activeOffer.maxBonus);
            }

            const bonus = new Bonus({
              userId: user._id,
              amount: bonusAmount,
              type: "deposit_bonus",
              status: "locked",
              promoCode: deposit.promoCode,
            });
            await bonus.save();
            user.bonusBalance += bonusAmount;
            user.totalBonusReceived = (user.totalBonusReceived || 0) + bonusAmount;

            // Add to transaction history
            const transaction = new Transaction({
              userId: user._id,
              type: "bonus",
              amount: bonusAmount,
              source: "promo",
              status: "completed"
            });
            await transaction.save();
          } else {
            // Fallback to legacy bonus config if no active offer found for this code
            const bonusConfig = await Config.findOne({ key: "bonus_popup_config" });
            if (bonusConfig && bonusConfig.value.isEnabled && bonusConfig.value.promoCode === deposit.promoCode) {
              const existingBonus = await Bonus.findOne({ userId: user._id, type: "deposit_bonus" });
              if (!existingBonus) {
                const bonusAmount = (deposit.amount * (bonusConfig.value.bonusPercentage || 10)) / 100;
                const bonus = new Bonus({
                  userId: user._id,
                  amount: bonusAmount,
                  type: "deposit_bonus",
                  status: "locked",
                  promoCode: deposit.promoCode,
                });
                await bonus.save();
                user.bonusBalance += bonusAmount;
                user.totalBonusReceived = (user.totalBonusReceived || 0) + bonusAmount;

                const transaction = new Transaction({
                  userId: user._id,
                  type: "bonus",
                  amount: bonusAmount,
                  source: "promo",
                  status: "completed"
                });
                await transaction.save();
              }
            }
          }
        }

        await user.save();

        // Referral commission
        if (user.referredBy) {
          const referrer = await User.findOne({ referralCode: user.referredBy });
          if (referrer) {
            const commission = deposit.amount * 0.05;
            referrer.walletBalance += commission;
            referrer.totalReferralEarnings += commission;
            await referrer.save();

            const history = new ReferralHistory({
              referrerId: referrer._id,
              referredId: user._id,
              amount: deposit.amount,
              commission,
            });
            await history.save();

            const transaction = new Transaction({
              userId: referrer._id,
              type: "referral",
              amount: commission,
              source: `Referral from ${user.name}`,
              status: "completed"
            });
            await transaction.save();
          }
        }
      }

      res.json(deposit);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.put("/api/admin/deposits/:id/reject", authenticate, isAdmin, async (req, res) => {
    try {
      const deposit = await Deposit.findByIdAndUpdate(req.params.id, { status: "rejected" }, { new: true });
      res.json(deposit);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/admin/withdrawals", authenticate, isAdmin, async (req, res) => {
    try {
      const withdrawals = await Withdrawal.find().populate("userId", "name email").sort({ timestamp: -1 });
      res.json(withdrawals);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.put("/api/admin/withdrawals/:id/approve", authenticate, isAdmin, async (req, res) => {
    try {
      const withdrawal = await Withdrawal.findByIdAndUpdate(req.params.id, { status: "approved" }, { new: true });
      if (withdrawal) {
        const user = await User.findById(withdrawal.userId);
        if (user) {
          user.totalWithdrawals += withdrawal.amount;
          await user.save();
        }
      }
      res.json(withdrawal);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.put("/api/admin/withdrawals/:id/reject", authenticate, isAdmin, async (req, res) => {
    try {
      const withdrawal = await Withdrawal.findById(req.params.id);
      if (!withdrawal || withdrawal.status !== "pending") return res.status(400).json({ message: "Invalid withdrawal" });

      withdrawal.status = "rejected";
      await withdrawal.save();

      const user = await User.findById(withdrawal.userId);
      if (user) {
        user.walletBalance += withdrawal.amount;
        await user.save();
      }

      res.json(withdrawal);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // --- STATIC FRONTEND SERVING (AFTER API ROUTES) ---
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  // Serve static files from dist
  app.use(express.static(path.join(__dirname, 'dist')));

  // Root route for React app
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });

  // Catch-all route for React SPA (must be after all API routes)
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
