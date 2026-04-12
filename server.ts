import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import cors from "cors";
import helmet from "helmet";
import { db, initDb } from "./src/server/db";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("FATAL: JWT_SECRET environment variable is not set");
}
const PORT = Number(process.env.PORT) || 3000;

export async function buildApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({
    origin: process.env.NODE_ENV === "production"
      ? (process.env.ALLOWED_ORIGINS
          ? process.env.ALLOWED_ORIGINS.split(",")
          : ["https://peachstack.github.io", "https://peachstackadmin.github.io", "https://sjujala.github.io"])
      : ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  }));
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());

  const getCookieOptions = (req: any) => {
    const forwardedProto = (req.headers["x-forwarded-proto"] as string | undefined)?.split(",")[0]?.trim();
    const isHttps = req.secure || forwardedProto === "https" || process.env.NODE_ENV === "production";
    const sameSite: "none" | "lax" = isHttps ? "none" : "lax";
    return {
      httpOnly: true,
      secure: isHttps,
      sameSite,
      maxAge: 24 * 60 * 60 * 1000,
    };
  };

  // ─── Rate limiters ───────────────────────────────────────────────────────────
  const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false });
  const publicLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false });
  const adminApiLimiter = rateLimit({ windowMs: 60 * 1000, max: 120, standardHeaders: true, legacyHeaders: false });
  const studentApiLimiter = rateLimit({ windowMs: 60 * 1000, max: 60, standardHeaders: true, legacyHeaders: false });

  app.use("/api/login", loginLimiter);
  app.use("/api/register", publicLimiter);
  app.use("/api/contact", publicLimiter);

  // ─── CSRF protection ─────────────────────────────────────────────────────────
  const csrfCheck = (req: any, res: any, next: any) => {
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
    const origin = req.headers.origin as string | undefined;
    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",")
      : ["http://localhost:3000", "http://localhost:5173", "https://peachstack.github.io", "https://peachstackadmin.github.io", "https://sjujala.github.io"];
    // Block requests with no origin header and requests from disallowed origins
    if (!origin || !allowedOrigins.includes(origin)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
  app.use(csrfCheck);

  // ─── In-memory auth cache ────────────────────────────────────────────────────
  // Caches DB user lookups for 30 s per user-id to reduce round-trips to Turso
  // on every authenticated request.  Cache is per serverless instance.
  const AUTH_CACHE_TTL = 30_000;
  const authCache = new Map<string, { tokenVersion: number; isActive: boolean; expiresAt: number }>();

  async function getAuthUser(userId: string) {
    const cached = authCache.get(userId);
    if (cached && cached.expiresAt > Date.now()) return cached;
    const result = await db.execute({ sql: "SELECT is_active, token_version FROM users WHERE id = ?", args: [userId] });
    const row = result.rows[0] as any;
    if (!row) return null;
    const entry = { tokenVersion: row.token_version as number, isActive: !!row.is_active, expiresAt: Date.now() + AUTH_CACHE_TTL };
    authCache.set(userId, entry);
    return entry;
  }

  // Evict a user from the auth cache (call after token_version bump or deactivation).
  function evictAuthCache(userId: string) { authCache.delete(userId); }

  // ─── Auth middleware ─────────────────────────────────────────────────────────
  const authenticate = async (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Not authenticated" });
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }
    try {
      const user = await getAuthUser(decoded.id);
      if (!user || !user.isActive) return res.status(403).json({ message: "Account deactivated" });
      if (decoded.tokenVersion !== undefined && decoded.tokenVersion !== user.tokenVersion) {
        return res.status(401).json({ message: "Session expired" });
      }
    } catch {
      // DB error — fail closed with a 503 so callers know it's a server issue,
      // not an auth issue, and don't redirect the user to the login page.
      return res.status(503).json({ message: "Service temporarily unavailable. Please try again." });
    }
    req.user = decoded;
    next();
  };

  const requireAdmin = async (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Not authenticated" });
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (decoded.role !== "admin" && decoded.role !== "superadmin" && !decoded.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    try {
      const user = await getAuthUser(decoded.id);
      if (!user || !user.isActive) return res.status(403).json({ message: "Account deactivated" });
      if (user.tokenVersion !== undefined && decoded.tokenVersion !== undefined && decoded.tokenVersion !== user.tokenVersion) {
        return res.status(401).json({ message: "Session expired" });
      }
    } catch {
      return res.status(503).json({ message: "Service temporarily unavailable. Please try again." });
    }
    req.user = decoded;
    next();
  };

  const requireSuperadmin = async (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Not authenticated" });
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (decoded.role !== "admin" && decoded.role !== "superadmin" && !decoded.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    try {
      const user = await getAuthUser(decoded.id);
      if (!user || !user.isActive) return res.status(403).json({ message: "Account deactivated" });
      if (user.tokenVersion !== undefined && decoded.tokenVersion !== undefined && decoded.tokenVersion !== user.tokenVersion) {
        return res.status(401).json({ message: "Session expired" });
      }
    } catch {
      return res.status(503).json({ message: "Service temporarily unavailable. Please try again." });
    }
    req.user = decoded;
    if (req.user.role !== "superadmin" && !req.user.isSuperadmin) {
      return res.status(403).json({ message: "Superadmin access required" });
    }
    next();
  };

  // ─── Public Auth Routes ───────────────────────────────────────────────────────
  app.post("/api/register", async (req, res) => {
    const { email, password, name, role } = req.body;
    if (!['student', 'employer'].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }
    const id = crypto.randomUUID();
    const hashedPassword = await bcrypt.hash(password, 12);
    try {
      await db.execute({ sql: "INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)", args: [id, email, hashedPassword, name, role] });
      if (role === "student") {
        await db.execute({ sql: "INSERT INTO student_profiles (user_id) VALUES (?)", args: [id] });
      } else if (role === "employer") {
        await db.execute({ sql: "INSERT INTO employer_profiles (user_id, company_name) VALUES (?, ?)", args: [id, name] });
      }
      res.status(201).json({ message: "User registered successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    const result = await db.execute({ sql: "SELECT id, email, password, role, name, is_active, token_version FROM users WHERE email = ?", args: [email] });
    const user = result.rows[0] as any;
    if (!user || !(await bcrypt.compare(password, user.password))) {
      await db.execute({
        sql: "INSERT INTO security_log (id, email, ip_address, event) VALUES (?, ?, ?, 'failed_login')",
        args: [crypto.randomUUID(), email || null, req.ip || null],
      }).catch(() => {});
      return res.status(401).json({ message: "Invalid email or password" });
    }
    if (!user.is_active) return res.status(403).json({ message: "Account deactivated" });
    await db.execute({ sql: "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?", args: [user.id] });
    const tokenVersion = user.token_version || 0;
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name, tokenVersion }, JWT_SECRET, { expiresIn: "24h" });
    res.cookie("token", token, getCookieOptions(req));
    res.json({ user: { id: user.id, email: user.email, role: user.role, name: user.name } });
  });

  app.post("/api/logout", (req, res) => {
    const cookieOptions = getCookieOptions(req);
    res.clearCookie("token", { httpOnly: true, secure: cookieOptions.secure, sameSite: cookieOptions.sameSite });
    res.json({ message: "Logged out successfully" });
  });

  app.get("/api/me", studentApiLimiter, authenticate, (req: any, res: any) => {
    res.json({ user: req.user });
  });

  // ─── Student Profiles ─────────────────────────────────────────────────────────
  app.get("/api/students/:id", studentApiLimiter, authenticate, async (req, res) => {
    const result = await db.execute({
      sql: "SELECT u.name, u.email, s.* FROM users u JOIN student_profiles s ON u.id = s.user_id WHERE u.id = ?",
      args: [req.params.id],
    });
    const profile = result.rows[0] as any;
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    profile.skills = JSON.parse(profile.skills || "[]");
    profile.badges_earned = JSON.parse(profile.badges_earned || "[]");
    res.json(profile);
  });

  app.put("/api/students/:id", studentApiLimiter, authenticate, async (req: any, res: any) => {
    if (req.user.id !== req.params.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const { university, major, minor, year, skills, bio, profile_picture_url } = req.body;
    await db.execute({
      sql: "UPDATE student_profiles SET university = ?, major = ?, minor = ?, year = ?, skills = ?, bio = ?, profile_picture_url = ? WHERE user_id = ?",
      args: [university, major, minor, year, JSON.stringify(skills), bio, profile_picture_url, req.params.id],
    });
    res.json({ message: "Profile updated" });
  });

  // ─── Employer Profiles ────────────────────────────────────────────────────────
  app.get("/api/employers/:id", studentApiLimiter, authenticate, async (req: any, res: any) => {
    const result = await db.execute({
      sql: "SELECT u.name, u.email, e.* FROM users u JOIN employer_profiles e ON u.id = e.user_id WHERE u.id = ?",
      args: [req.params.id],
    });
    const profile = result.rows[0] as any;
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  });

  // ─── Projects ─────────────────────────────────────────────────────────────────
  app.get("/api/projects", studentApiLimiter, authenticate, async (req, res) => {
    const result = await db.execute({ sql: "SELECT * FROM projects WHERE status = 'open'", args: [] });
    res.json((result.rows as any[]).map((p) => {
      let skills: string[] = [];
      try { skills = JSON.parse(p.skills_required || "[]"); } catch { skills = []; }
      return { ...p, skills_required: skills };
    }));
  });

  app.post("/api/projects", studentApiLimiter, authenticate, async (req: any, res: any) => {
    if (req.user.role !== "employer" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const { title, description, skills_required, deadline, compensation } = req.body;
    const id = crypto.randomUUID();
    await db.execute({
      sql: "INSERT INTO projects (id, title, description, employer_id, skills_required, deadline, compensation) VALUES (?, ?, ?, ?, ?, ?, ?)",
      args: [id, title, description, req.user.id, JSON.stringify(skills_required), deadline, compensation],
    });
    res.status(201).json({ id, message: "Project created" });
  });

  // ─── Applications ─────────────────────────────────────────────────────────────
  app.post("/api/applications", studentApiLimiter, authenticate, async (req: any, res: any) => {
    if (req.user.role !== "student") return res.status(403).json({ message: "Only students can apply" });
    const { project_id, cover_letter } = req.body;
    const id = crypto.randomUUID();
    try {
      await db.execute({
        sql: "INSERT INTO applications (id, student_id, project_id, cover_letter) VALUES (?, ?, ?, ?)",
        args: [id, req.user.id, project_id, cover_letter],
      });
      res.status(201).json({ id, message: "Application submitted" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ─── Contact Form ─────────────────────────────────────────────────────────────
  app.post("/api/contact", async (req, res) => {
    const { name, email, message } = req.body;
    const id = crypto.randomUUID();
    await db.execute({ sql: "INSERT INTO contact_submissions (id, name, email, message) VALUES (?, ?, ?, ?)", args: [id, name, email, message] });
    res.status(201).json({ message: "Message sent" });
  });

  // ─── Admin Auth ───────────────────────────────────────────────────────────────
  app.post("/api/admin/login", loginLimiter, async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });
    const result = await db.execute({ sql: "SELECT id, email, password, role, name, is_active, token_version FROM users WHERE email = ? AND role IN ('admin', 'superadmin')", args: [email] });
    const user = result.rows[0] as any;
    if (!user || !(await bcrypt.compare(password, user.password))) {
      await db.execute({
        sql: "INSERT INTO security_log (id, email, ip_address, event) VALUES (?, ?, ?, 'failed_login')",
        args: [crypto.randomUUID(), email || null, req.ip || null],
      }).catch(() => {});
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (!user.is_active) return res.status(403).json({ message: "Account deactivated" });
    await db.execute({ sql: "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?", args: [user.id] });
    const tokenVersion = user.token_version || 0;
    const isSuperadmin = user.role === "superadmin";
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name, isAdmin: true, isSuperadmin, tokenVersion },
      JWT_SECRET,
      { expiresIn: "24h" }
    );
    res.cookie("token", token, getCookieOptions(req));
    res.json({ user: { id: user.id, email: user.email, role: user.role, name: user.name, isSuperadmin } });
  });

  app.post("/api/admin/logout", adminApiLimiter, requireAdmin, (req, res) => {
    const cookieOptions = getCookieOptions(req);
    res.clearCookie("token", { httpOnly: true, secure: cookieOptions.secure, sameSite: cookieOptions.sameSite });
    res.json({ message: "Logged out" });
  });

  // ─── Admin Dashboard ──────────────────────────────────────────────────────────
  app.get("/api/admin/dashboard", adminApiLimiter, requireAdmin, async (req, res) => {
    const [activeInternsResult, taskStatsResult, pendingTasksResult, recentActivityResult] = await Promise.all([
      db.execute({ sql: "SELECT COUNT(*) as count FROM users WHERE role = 'student' AND is_active = 1", args: [] }),
      db.execute({ sql: "SELECT COUNT(*) as total, SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) as completed FROM tasks", args: [] }),
      db.execute({ sql: "SELECT COUNT(*) as count FROM tasks WHERE status = 'in_review'", args: [] }),
      db.execute({
        sql: "SELECT tal.*, u.name as actor_name, t.title as task_title FROM task_activity_log tal JOIN users u ON tal.user_id = u.id JOIN tasks t ON tal.task_id = t.id ORDER BY tal.created_at DESC LIMIT 10",
        args: [],
      }),
    ]);

    const activeInterns = (activeInternsResult.rows[0] as any)?.count || 0;
    const taskStats = taskStatsResult.rows[0] as any;
    const completionRate = taskStats.total > 0 ? Math.round((Number(taskStats.completed) / Number(taskStats.total)) * 100) : 0;
    const pendingTasks = (pendingTasksResult.rows[0] as any)?.count || 0;
    const recentActivity = recentActivityResult.rows as any[];

    res.json({ activeInterns, completionRate, pendingTasks, recentActivity });
  });

  // ─── Admin Metrics (legacy) ───────────────────────────────────────────────────
  app.get("/api/admin/metrics", adminApiLimiter, requireAdmin, async (req, res) => {
    const [totalInternsResult, totalProjectsResult, openProjectsResult, taskStatsResult, unreadContactsResult] = await Promise.all([
      db.execute({ sql: "SELECT COUNT(*) as count FROM users WHERE role = 'student' AND is_active = 1", args: [] }),
      db.execute({ sql: "SELECT COUNT(*) as count FROM projects", args: [] }),
      db.execute({ sql: "SELECT COUNT(*) as count FROM projects WHERE status = 'open'", args: [] }),
      db.execute({ sql: "SELECT COUNT(*) as total, SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) as completed FROM tasks", args: [] }),
      db.execute({ sql: "SELECT COUNT(*) as count FROM contact_submissions WHERE status = 'unread'", args: [] }),
    ]);
    const taskStats = taskStatsResult.rows[0] as any;
    res.json({
      totalInterns: (totalInternsResult.rows[0] as any)?.count || 0,
      totalApplications: 0,
      pendingApplications: 0,
      acceptedApplications: 0,
      rejectedApplications: 0,
      totalProjects: (totalProjectsResult.rows[0] as any)?.count || 0,
      openProjects: (openProjectsResult.rows[0] as any)?.count || 0,
      unreadContacts: (unreadContactsResult.rows[0] as any)?.count || 0,
      totalTasks: Number(taskStats?.total || 0) - Number(taskStats?.completed || 0),
      completedTasks: Number(taskStats?.completed || 0),
      recentApplications: [],
    });
  });

  // ─── Admin Calendar ───────────────────────────────────────────────────────────
  app.get("/api/admin/calendar", adminApiLimiter, requireAdmin, async (req, res) => {
    const result = await db.execute({ sql: "SELECT * FROM calendar_events ORDER BY event_date ASC", args: [] });
    res.json(result.rows as any[]);
  });

  app.post("/api/admin/calendar", adminApiLimiter, requireAdmin, async (req: any, res: any) => {
    const { title, description, event_date, event_time, target_role, target_user_id } = req.body;
    if (!title || !event_date) return res.status(400).json({ message: "Title and event_date required" });
    const id = crypto.randomUUID();
    await db.execute({
      sql: "INSERT INTO calendar_events (id, title, description, event_date, event_time, target_role, target_user_id, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      args: [id, title, description || null, event_date, event_time || null, target_role || "all", target_user_id || null, req.user.id],
    });
    res.status(201).json({ id });
  });

  app.delete("/api/admin/calendar/:id", adminApiLimiter, requireAdmin, async (req, res) => {
    await db.execute({ sql: "DELETE FROM calendar_events WHERE id = ?", args: [req.params.id] });
    res.json({ message: "Deleted" });
  });

  // ─── Admin Team ───────────────────────────────────────────────────────────────
  app.get("/api/admin/team", adminApiLimiter, requireAdmin, async (req, res) => {
    const result = await db.execute({ sql: "SELECT id, email, name, role, is_active, created_at, last_login FROM users WHERE role IN ('admin', 'superadmin')", args: [] });
    res.json(result.rows as any[]);
  });

  app.post("/api/admin/team", adminApiLimiter, requireSuperadmin, async (req: any, res: any) => {
    const { email, name, password } = req.body;
    if (!email || !name || !password) return res.status(400).json({ message: "Email, name, and password required" });
    const id = crypto.randomUUID();
    const hashed = await bcrypt.hash(password, 12);
    try {
      await db.execute({ sql: "INSERT INTO users (id, email, password, name, role, is_active) VALUES (?, ?, ?, ?, 'admin', 1)", args: [id, email, hashed, name] });
      res.status(201).json({ id, message: "Admin created" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/admin/team/:id", adminApiLimiter, requireSuperadmin, async (req, res) => {
    await db.execute({ sql: "UPDATE users SET is_active = 0, token_version = token_version + 1 WHERE id = ?", args: [req.params.id] });
    evictAuthCache(req.params.id);
    res.json({ message: "Account deactivated" });
  });

  // ─── Admin Users (legacy) ─────────────────────────────────────────────────────
  app.get("/api/admin/users", adminApiLimiter, requireAdmin, async (req, res) => {
    const result = await db.execute({ sql: "SELECT id, email, name, role, is_active, created_at, last_login FROM users WHERE role IN ('admin', 'superadmin')", args: [] });
    res.json(result.rows as any[]);
  });

  app.post("/api/admin/users", adminApiLimiter, requireSuperadmin, async (req: any, res: any) => {
    const { email, name, password } = req.body;
    if (!email || !name || !password) return res.status(400).json({ message: "Email, name, and password required" });
    const id = crypto.randomUUID();
    const hashed = await bcrypt.hash(password, 12);
    try {
      await db.execute({ sql: "INSERT INTO users (id, email, password, name, role, is_active) VALUES (?, ?, ?, ?, 'admin', 1)", args: [id, email, hashed, name] });
      await db.execute({
        sql: "INSERT INTO admin_audit_log (id, admin_id, action, target_type, target_id, details, ip_address) VALUES (?, ?, 'created_admin', 'user', ?, ?, ?)",
        args: [crypto.randomUUID(), req.user.id, id, JSON.stringify({ email, name }), req.ip],
      });
      // Auto-add new admin to all existing groups
      const allGroups = await db.execute({ sql: "SELECT id FROM message_groups", args: [] });
      for (const group of allGroups.rows as any[]) {
        await db.execute({ sql: "INSERT OR IGNORE INTO message_group_members (group_id, user_id) VALUES (?, ?)", args: [group.id, id] });
      }
      res.status(201).json({ id, message: "Admin created" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/admin/users/:id", adminApiLimiter, requireAdmin, async (req: any, res: any) => {
    const { name, email, is_active, password } = req.body;
    const userResult = await db.execute({ sql: "SELECT * FROM users WHERE id = ?", args: [req.params.id] });
    const user = userResult.rows[0] as any;
    if (!user) return res.status(404).json({ message: "User not found" });
    if (name) await db.execute({ sql: "UPDATE users SET name = ? WHERE id = ?", args: [name, req.params.id] });
    if (email) await db.execute({ sql: "UPDATE users SET email = ? WHERE id = ?", args: [email, req.params.id] });
    if (is_active !== undefined) {
      await db.execute({ sql: "UPDATE users SET is_active = ?, token_version = token_version + 1 WHERE id = ?", args: [is_active ? 1 : 0, req.params.id] });
      evictAuthCache(req.params.id);
    }
    if (password) {
      const hashed = await bcrypt.hash(password, 12);
      await db.execute({ sql: "UPDATE users SET password = ?, token_version = token_version + 1 WHERE id = ?", args: [hashed, req.params.id] });
      evictAuthCache(req.params.id);
    }
    res.json({ message: "User updated" });
  });

  app.delete("/api/admin/users/:id", adminApiLimiter, requireSuperadmin, async (req, res) => {
    await db.execute({ sql: "UPDATE users SET is_active = 0, token_version = token_version + 1 WHERE id = ?", args: [req.params.id] });
    evictAuthCache(req.params.id);
    res.json({ message: "User deactivated" });
  });

  // ─── Intern Management ────────────────────────────────────────────────────────
  app.post("/api/admin/interns/create", adminApiLimiter, requireAdmin, async (req: any, res: any) => {
    const { name, email, internRole, tempPassword } = req.body;
    if (!name || !email || !tempPassword) return res.status(400).json({ message: "Name, email, and tempPassword required" });
    const id = crypto.randomUUID();
    const hashed = await bcrypt.hash(tempPassword, 12);
    try {
      await db.execute({ sql: "INSERT INTO users (id, email, password, name, role, is_active) VALUES (?, ?, ?, ?, 'student', 1)", args: [id, email, hashed, name] });
      await db.execute({ sql: "INSERT INTO student_profiles (user_id, intern_role) VALUES (?, ?)", args: [id, internRole || null] });
      await db.execute({
        sql: "INSERT INTO notifications (id, user_id, message, type) VALUES (?, ?, ?, 'account_created')",
        args: [crypto.randomUUID(), id, `Welcome to Peach Stack, ${name}! Your account has been created.`],
      });
      // Auto-add intern to matching role-based groups
      const groupsResult = await db.execute({
        sql: "SELECT id FROM message_groups WHERE role_filter = 'all'" + (internRole ? " OR role_filter = ?" : ""),
        args: internRole ? [internRole] : [],
      });
      for (const group of groupsResult.rows as any[]) {
        await db.execute({ sql: "INSERT OR IGNORE INTO message_group_members (group_id, user_id) VALUES (?, ?)", args: [group.id, id] });
      }
      res.status(201).json({ id, message: "Intern created" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/admin/interns", adminApiLimiter, requireAdmin, async (req, res) => {
    const { search, status, page = "1", limit = "20" } = req.query as any;
    let sql = "SELECT u.id, u.email, u.name, u.created_at, u.last_login, u.is_active, sp.university, sp.major, sp.year, sp.intern_role FROM users u LEFT JOIN student_profiles sp ON u.id = sp.user_id WHERE u.role = 'student'";
    const args: any[] = [];
    if (search) { sql += " AND (u.name LIKE ? OR u.email LIKE ?)"; args.push(`%${search}%`, `%${search}%`); }
    if (status === "active") sql += " AND u.is_active = 1";
    if (status === "inactive") sql += " AND u.is_active = 0";
    const countSql = sql.replace("SELECT u.id, u.email, u.name, u.created_at, u.last_login, u.is_active, sp.university, sp.major, sp.year, sp.intern_role", "SELECT COUNT(*) as count");
    const countResult = await db.execute({ sql: countSql, args });
    const total = (countResult.rows[0] as any)?.count || 0;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    sql += " ORDER BY u.created_at DESC LIMIT ? OFFSET ?";
    const pagedArgs = [...args, parseInt(limit), offset];
    const result = await db.execute({ sql, args: pagedArgs });
    res.json({ data: result.rows as any[], total, page: parseInt(page), limit: parseInt(limit) });
  });

  app.get("/api/admin/interns/:id", adminApiLimiter, requireAdmin, async (req, res) => {
    const internResult = await db.execute({
      sql: "SELECT u.*, sp.* FROM users u LEFT JOIN student_profiles sp ON u.id = sp.user_id WHERE u.id = ? AND u.role = 'student'",
      args: [req.params.id],
    });
    const intern = internResult.rows[0] as any;
    if (!intern) return res.status(404).json({ message: "Not found" });
    intern.skills = JSON.parse(intern.skills || "[]");
    intern.badges_earned = JSON.parse(intern.badges_earned || "[]");
    const tasksResult = await db.execute({ sql: "SELECT * FROM tasks WHERE assigned_to = ? ORDER BY created_at DESC", args: [req.params.id] });
    res.json({ ...intern, tasks: tasksResult.rows as any[] });
  });

  app.patch("/api/admin/interns/:id", adminApiLimiter, requireAdmin, async (req, res) => {
    const { is_active } = req.body;
    if (is_active !== undefined) {
      await db.execute({ sql: "UPDATE users SET is_active = ?, token_version = token_version + 1 WHERE id = ?", args: [is_active ? 1 : 0, req.params.id] });
      evictAuthCache(req.params.id);
    }
    res.json({ message: "Updated" });
  });

  app.delete("/api/admin/interns/:id", adminApiLimiter, requireAdmin, async (req, res) => {
    try {
      const internResult = await db.execute({ sql: "SELECT id FROM users WHERE id = ? AND role = 'student'", args: [req.params.id] });
      if (internResult.rows.length === 0) return res.status(404).json({ message: "Intern not found" });
      const id = req.params.id;
      evictAuthCache(id);
      // Unassign tasks rather than delete them
      await db.execute({ sql: "UPDATE tasks SET assigned_to = NULL WHERE assigned_to = ?", args: [id] });
      // Clean up all related data
      await db.execute({ sql: "DELETE FROM task_comments WHERE user_id = ?", args: [id] });
      await db.execute({ sql: "DELETE FROM task_activity_log WHERE user_id = ?", args: [id] });
      await db.execute({ sql: "DELETE FROM notifications WHERE user_id = ?", args: [id] });
      await db.execute({ sql: "DELETE FROM group_messages WHERE sender_id = ?", args: [id] });
      await db.execute({ sql: "DELETE FROM group_message_reads WHERE user_id = ?", args: [id] });
      await db.execute({ sql: "DELETE FROM message_group_members WHERE user_id = ?", args: [id] });
      await db.execute({ sql: "DELETE FROM messages WHERE sender_id = ? OR recipient_id = ?", args: [id, id] });
      await db.execute({ sql: "DELETE FROM message_threads WHERE participant_one = ? OR participant_two = ?", args: [id, id] });
      await db.execute({ sql: "DELETE FROM project_assignments WHERE user_id = ?", args: [id] });
      await db.execute({ sql: "DELETE FROM student_profiles WHERE user_id = ?", args: [id] });
      await db.execute({ sql: "DELETE FROM users WHERE id = ?", args: [id] });
      res.json({ message: "Intern account permanently deleted" });
    } catch (err: any) {
      console.error('[DELETE INTERN ERROR]', err);
      res.status(500).json({ message: err.message || "Failed to delete intern" });
    }
  });

  app.post("/api/admin/interns/:id/notes", adminApiLimiter, requireAdmin, async (req: any, res: any) => {
    const { note } = req.body;
    if (!note) return res.status(400).json({ message: "Note required" });
    const profileResult = await db.execute({ sql: "SELECT notes FROM student_profiles WHERE user_id = ?", args: [req.params.id] });
    const profile = profileResult.rows[0] as any;
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    const existingNotes = JSON.parse(profile.notes || "[]");
    existingNotes.push({ note, created_at: new Date().toISOString(), created_by: req.user.id });
    await db.execute({ sql: "UPDATE student_profiles SET notes = ? WHERE user_id = ?", args: [JSON.stringify(existingNotes), req.params.id] });
    res.json({ message: "Note added" });
  });

  // ─── Task Management ──────────────────────────────────────────────────────────
  app.get("/api/admin/tasks", adminApiLimiter, requireAdmin, async (req, res) => {
    const { status, assignee, priority, page = "1", limit = "50" } = req.query as any;
    let sql = "SELECT t.*, u.name as assignee_name, c.name as creator_name FROM tasks t LEFT JOIN users u ON t.assigned_to = u.id LEFT JOIN users c ON t.created_by = c.id WHERE 1=1";
    const args: any[] = [];
    if (status) { sql += " AND t.status = ?"; args.push(status); }
    if (assignee) { sql += " AND t.assigned_to = ?"; args.push(assignee); }
    if (priority) { sql += " AND t.priority = ?"; args.push(priority); }
    const countResult = await db.execute({ sql: sql.replace("SELECT t.*, u.name as assignee_name, c.name as creator_name", "SELECT COUNT(*) as count"), args });
    const total = (countResult.rows[0] as any)?.count || 0;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    sql += " ORDER BY t.created_at DESC LIMIT ? OFFSET ?";
    const result = await db.execute({ sql, args: [...args, parseInt(limit), offset] });
    const tasks = (result.rows as any[]).map((t) => ({ ...t, tags: JSON.parse(t.tags || "[]") }));
    res.json({ data: tasks, total, page: parseInt(page), limit: parseInt(limit) });
  });

  app.post("/api/admin/tasks", adminApiLimiter, requireAdmin, async (req: any, res: any) => {
    const { title, description, assigned_to, assigned_role, project_id, priority, due_date, estimated_hours, tags, points, task_type } = req.body;
    if (!title || !description) return res.status(400).json({ message: "Title and description required" });
    const id = crypto.randomUUID();
    const createdBy = req.user.id;
    await db.execute({
      sql: "INSERT INTO tasks (id, title, description, assigned_to, assigned_role, project_id, created_by, priority, due_date, estimated_hours, tags, points, task_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      args: [id, title, description, assigned_to || null, assigned_role || null, project_id || null, createdBy, priority || "medium", due_date || null, estimated_hours || null, JSON.stringify(tags || []), points || 10, task_type || "regular"],
    });
    await db.execute({
      sql: "INSERT INTO task_activity_log (id, task_id, user_id, action, new_value) VALUES (?, ?, ?, 'created', ?)",
      args: [crypto.randomUUID(), id, createdBy, title],
    });
    if (assigned_to) {
      await db.execute({
        sql: "INSERT INTO notifications (id, user_id, message, type) VALUES (?, ?, ?, 'task_assigned')",
        args: [crypto.randomUUID(), assigned_to, `You have been assigned a new task: ${title}`],
      });
    }
    res.status(201).json({ id, message: "Task created" });
  });

  app.get("/api/admin/tasks/:id", adminApiLimiter, requireAdmin, async (req, res) => {
    const taskResult = await db.execute({
      sql: "SELECT t.*, u.name as assignee_name FROM tasks t LEFT JOIN users u ON t.assigned_to = u.id WHERE t.id = ?",
      args: [req.params.id],
    });
    const task = taskResult.rows[0] as any;
    if (!task) return res.status(404).json({ message: "Not found" });
    task.tags = JSON.parse(task.tags || "[]");
    const commentsResult = await db.execute({
      sql: "SELECT tc.*, u.name as author_name FROM task_comments tc JOIN users u ON tc.user_id = u.id WHERE tc.task_id = ? ORDER BY tc.created_at ASC",
      args: [req.params.id],
    });
    const activityResult = await db.execute({
      sql: "SELECT tal.*, u.name as actor_name FROM task_activity_log tal JOIN users u ON tal.user_id = u.id WHERE tal.task_id = ? ORDER BY tal.created_at DESC LIMIT 20",
      args: [req.params.id],
    });
    res.json({ ...task, comments: commentsResult.rows as any[], activity: activityResult.rows as any[] });
  });

  app.patch("/api/admin/tasks/:id", adminApiLimiter, requireAdmin, async (req: any, res: any) => {
    const taskResult = await db.execute({ sql: "SELECT * FROM tasks WHERE id = ?", args: [req.params.id] });
    const task = taskResult.rows[0] as any;
    if (!task) return res.status(404).json({ message: "Not found" });
    const { title, description, status, priority, assigned_to, due_date, estimated_hours, actual_hours, tags } = req.body;
    const userId = req.user.id;
    if (status && status !== task.status) {
      await db.execute({
        sql: "INSERT INTO task_activity_log (id, task_id, user_id, action, old_value, new_value) VALUES (?, ?, ?, 'status_changed', ?, ?)",
        args: [crypto.randomUUID(), req.params.id, userId, task.status, status],
      });
    }
    if (assigned_to !== undefined && assigned_to !== task.assigned_to) {
      await db.execute({
        sql: "INSERT INTO task_activity_log (id, task_id, user_id, action, old_value, new_value) VALUES (?, ?, ?, 'assigned', ?, ?)",
        args: [crypto.randomUUID(), req.params.id, userId, task.assigned_to, assigned_to],
      });
    }
    await db.execute({
      sql: `UPDATE tasks SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        status = COALESCE(?, status),
        priority = COALESCE(?, priority),
        assigned_to = CASE WHEN ? THEN ? ELSE assigned_to END,
        due_date = CASE WHEN ? THEN ? ELSE due_date END,
        estimated_hours = CASE WHEN ? THEN ? ELSE estimated_hours END,
        actual_hours = CASE WHEN ? THEN ? ELSE actual_hours END,
        tags = CASE WHEN ? THEN ? ELSE tags END,
        updated_at = CURRENT_TIMESTAMP,
        completed_at = CASE WHEN ? = 'completed' THEN CURRENT_TIMESTAMP ELSE completed_at END
        WHERE id = ?`,
      args: [
        title || null, description || null, status || null, priority || null,
        assigned_to !== undefined ? 1 : 0, assigned_to !== undefined ? assigned_to : null,
        due_date !== undefined ? 1 : 0, due_date !== undefined ? due_date : null,
        estimated_hours !== undefined ? 1 : 0, estimated_hours !== undefined ? estimated_hours : null,
        actual_hours !== undefined ? 1 : 0, actual_hours !== undefined ? actual_hours : null,
        tags !== undefined ? 1 : 0, tags !== undefined ? JSON.stringify(tags) : null,
        status || null, req.params.id,
      ],
    });
    res.json({ message: "Updated" });
  });

  app.patch("/api/admin/tasks/:id/review", adminApiLimiter, requireAdmin, async (req: any, res: any) => {
    const { feedback, score, decision } = req.body;
    if (decision && !["approve", "decline"].includes(decision)) {
      return res.status(400).json({ message: "Invalid decision" });
    }
    const taskResult = await db.execute({ sql: "SELECT * FROM tasks WHERE id = ?", args: [req.params.id] });
    const task = taskResult.rows[0] as any;
    if (!task) return res.status(404).json({ message: "Not found" });
    const approved = decision !== "decline";
    await db.execute({
      sql: "UPDATE tasks SET admin_feedback = ?, admin_score = ?, status = ?, completed_at = CASE WHEN ? THEN CURRENT_TIMESTAMP ELSE NULL END, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      args: [feedback || null, approved ? score || null : null, approved ? "completed" : "in_progress", approved ? 1 : 0, req.params.id],
    });
    await db.execute({
      sql: "INSERT INTO task_activity_log (id, task_id, user_id, action, new_value) VALUES (?, ?, ?, ?, ?)",
      args: [crypto.randomUUID(), req.params.id, req.user.id, approved ? "approved" : "declined", feedback || null],
    });
    if (task.assigned_to && approved && score) {
      await db.execute({ sql: "UPDATE student_profiles SET points_total = points_total + ? WHERE user_id = ?", args: [score, task.assigned_to] });
      await db.execute({
        sql: "INSERT INTO notifications (id, user_id, message, type) VALUES (?, ?, ?, 'task_reviewed')",
        args: [crypto.randomUUID(), task.assigned_to, `Your task "${task.title}" has been reviewed. Score: ${score}`],
      });
    } else if (task.assigned_to && !approved) {
      await db.execute({
        sql: "INSERT INTO notifications (id, user_id, message, type) VALUES (?, ?, ?, 'task_reviewed')",
        args: [crypto.randomUUID(), task.assigned_to, `Your task "${task.title}" was declined and needs updates.`],
      });
    }
    res.json({ message: approved ? "Task approved" : "Task declined" });
  });

  app.delete("/api/admin/tasks/:id", adminApiLimiter, requireAdmin, async (req, res) => {
    try {
      await db.execute({ sql: "DELETE FROM task_comments WHERE task_id = ?", args: [req.params.id] });
      await db.execute({ sql: "DELETE FROM task_activity_log WHERE task_id = ?", args: [req.params.id] });
      await db.execute({ sql: "DELETE FROM tasks WHERE id = ?", args: [req.params.id] });
      res.json({ message: "Deleted" });
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Failed to delete task" });
    }
  });

  app.post("/api/admin/tasks/:id/comments", adminApiLimiter, requireAdmin, async (req: any, res: any) => {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: "Content required" });
    const id = crypto.randomUUID();
    const userId = req.user.id;
    await db.execute({ sql: "INSERT INTO task_comments (id, task_id, user_id, content) VALUES (?, ?, ?, ?)", args: [id, req.params.id, userId, content] });
    await db.execute({
      sql: "INSERT INTO task_activity_log (id, task_id, user_id, action) VALUES (?, ?, ?, 'commented')",
      args: [crypto.randomUUID(), req.params.id, userId],
    });
    res.status(201).json({ id });
  });

  // ─── Admin Communications ──────────────────────────────────────────────────────
  app.get("/api/admin/contacts", adminApiLimiter, requireAdmin, async (req, res) => {
    const result = await db.execute({ sql: "SELECT * FROM contact_submissions ORDER BY submitted_at DESC", args: [] });
    res.json(result.rows as any[]);
  });

  app.patch("/api/admin/contacts/:id", adminApiLimiter, requireAdmin, async (req, res) => {
    const { status } = req.body;
    if (status) await db.execute({ sql: "UPDATE contact_submissions SET status = ? WHERE id = ?", args: [status, req.params.id] });
    res.json({ message: "Updated" });
  });

  // ─── Admin Analytics ───────────────────────────────────────────────────────────
  app.get("/api/admin/analytics", adminApiLimiter, requireAdmin, async (req, res) => {
    const tasksByStatusResult = await db.execute({ sql: "SELECT status, COUNT(*) as count FROM tasks GROUP BY status", args: [] });
    const tasksByPriorityResult = await db.execute({ sql: "SELECT priority, COUNT(*) as count FROM tasks GROUP BY priority", args: [] });
    const internActivityResult = await db.execute({
      sql: "SELECT u.name, COUNT(t.id) as task_count, SUM(CASE WHEN t.status='completed' THEN 1 ELSE 0 END) as completed FROM users u LEFT JOIN tasks t ON t.assigned_to = u.id WHERE u.role = 'student' GROUP BY u.id ORDER BY task_count DESC LIMIT 10",
      args: [],
    });
    const overdueResult = await db.execute({ sql: "SELECT COUNT(*) as count FROM tasks WHERE due_date < date('now') AND status NOT IN ('completed','blocked')", args: [] });
    res.json({
      tasksByStatus: tasksByStatusResult.rows as any[],
      tasksByPriority: tasksByPriorityResult.rows as any[],
      internActivity: internActivityResult.rows as any[],
      overdueTasks: (overdueResult.rows[0] as any)?.count || 0,
    });
  });

  // ─── Admin Projects ────────────────────────────────────────────────────────────
  app.get("/api/admin/projects", adminApiLimiter, requireAdmin, async (req, res) => {
    try {
      const result = await db.execute({ sql: "SELECT * FROM projects ORDER BY created_at DESC", args: [] });
      res.json((result.rows as any[]).map((p) => {
        let skills: string[] = [];
        try { skills = JSON.parse(p.skills_required || "[]"); } catch { skills = []; }
        return { ...p, skills_required: skills };
      }));
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Failed to load projects" });
    }
  });

  app.post("/api/admin/projects", adminApiLimiter, requireAdmin, async (req: any, res: any) => {
    try {
      const { title, description, skills_required, deadline, compensation, status, target_role } = req.body;
      if (!title || !description) return res.status(400).json({ message: "Title and description required" });
      await db.execute({
        sql: `INSERT INTO projects (id, title, description, employer_id, skills_required, status, deadline, compensation, target_role)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          crypto.randomUUID(),
          title,
          description,
          req.user.id,
          JSON.stringify(skills_required || []),
          status || 'open',
          deadline || null,
          compensation || null,
          target_role || 'all'
        ]
      });
      res.status(201).json({ message: "Project created" });
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Failed to create project" });
    }
  });

  app.patch("/api/admin/projects/:id", adminApiLimiter, requireAdmin, async (req: any, res: any) => {
    try {
      const { title, description, status, skills_required, deadline, compensation, target_role } = req.body;
      if (!title || !description) return res.status(400).json({ message: "Title and description required" });
      await db.execute({
        sql: `UPDATE projects SET
          title = ?,
          description = ?,
          status = ?,
          skills_required = ?,
          deadline = ?,
          compensation = ?,
          target_role = ?
          WHERE id = ?`,
        args: [title, description, status || 'open', JSON.stringify(skills_required || []), deadline || null, compensation || null, target_role || 'all', req.params.id],
      });
      res.json({ message: "Updated" });
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Failed to update project" });
    }
  });

  app.delete("/api/admin/projects/:id", adminApiLimiter, requireAdmin, async (req, res) => {
    try {
      await db.execute({ sql: "DELETE FROM project_assignments WHERE project_id = ?", args: [req.params.id] });
      await db.execute({ sql: "DELETE FROM projects WHERE id = ?", args: [req.params.id] });
      res.json({ message: "Deleted" });
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Failed to delete project" });
    }
  });

  // GET /api/admin/projects/:id/assignments — list user assignments for a project
  app.get("/api/admin/projects/:id/assignments", adminApiLimiter, requireAdmin, async (req: any, res: any) => {
    const result = await db.execute({
      sql: "SELECT pa.*, u.name, u.email FROM project_assignments pa JOIN users u ON pa.user_id = u.id WHERE pa.project_id = ? ORDER BY pa.created_at DESC",
      args: [req.params.id],
    });
    res.json(result.rows as any[]);
  });

  // PATCH /api/admin/projects/:id/assignments/:userId — admin updates an assignment status
  app.patch("/api/admin/projects/:id/assignments/:userId", adminApiLimiter, requireAdmin, async (req: any, res: any) => {
    const { status } = req.body;
    if (!['in_progress', 'in_review', 'completed'].includes(status)) return res.status(400).json({ message: "Invalid status" });
    await db.execute({
      sql: "UPDATE project_assignments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE project_id = ? AND user_id = ?",
      args: [status, req.params.id, req.params.userId],
    });
    res.json({ message: "Updated" });
  });

  // ─── Messaging Routes ─────────────────────────────────────────────────────────
  app.get("/api/messages/inbox", adminApiLimiter, authenticate, async (req: any, res: any) => {
    const result = await db.execute({
      sql: "SELECT m.*, u.name as sender_name, u.role as sender_role FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.recipient_id = ? ORDER BY m.created_at DESC",
      args: [req.user.id],
    });
    res.json(result.rows as any[]);
  });

  app.get("/api/messages/sent", adminApiLimiter, authenticate, async (req: any, res: any) => {
    const result = await db.execute({
      sql: "SELECT m.*, u.name as recipient_name, u.role as recipient_role FROM messages m JOIN users u ON m.recipient_id = u.id WHERE m.sender_id = ? ORDER BY m.created_at DESC",
      args: [req.user.id],
    });
    res.json(result.rows as any[]);
  });

  app.get("/api/messages/thread/:userId", adminApiLimiter, authenticate, async (req: any, res: any) => {
    const result = await db.execute({
      sql: "SELECT m.*, u.name as sender_name FROM messages m JOIN users u ON m.sender_id = u.id WHERE (m.sender_id = ? AND m.recipient_id = ?) OR (m.sender_id = ? AND m.recipient_id = ?) ORDER BY m.created_at ASC",
      args: [req.user.id, req.params.userId, req.params.userId, req.user.id],
    });
    res.json(result.rows as any[]);
  });

  app.post("/api/messages/send", adminApiLimiter, authenticate, async (req: any, res: any) => {
    const { recipient_id, subject, body } = req.body;
    if (!recipient_id || !body) return res.status(400).json({ message: "recipient_id and body required" });
    if (recipient_id === req.user.id) return res.status(400).json({ message: "Cannot message yourself" });

    // Check intern-to-intern restriction
    if (req.user.role === "student") {
      const recipientResult = await db.execute({ sql: "SELECT role FROM users WHERE id = ?", args: [recipient_id] });
      const recipient = recipientResult.rows[0] as any;
      if (!recipient) return res.status(404).json({ message: "Recipient not found" });
      if (recipient.role === "student") {
        const settingResult = await db.execute({ sql: "SELECT value FROM platform_settings WHERE key = 'allow_intern_to_intern_messaging'", args: [] });
        const setting = settingResult.rows[0] as any;
        if (!setting || setting.value !== "true") {
          return res.status(403).json({ message: "Intern-to-intern messaging is not enabled" });
        }
      }
    }

    const id = crypto.randomUUID();
    try {
      // Check if thread exists first, then use db.batch() for atomic insert + thread upsert
      const threadResult = await db.execute({
        sql: "SELECT id FROM message_threads WHERE (participant_one = ? AND participant_two = ?) OR (participant_one = ? AND participant_two = ?)",
        args: [req.user.id, recipient_id, recipient_id, req.user.id],
      });
      const threadId = threadResult.rows.length > 0 ? (threadResult.rows[0] as any).id : crypto.randomUUID();
      const threadSql = threadResult.rows.length > 0
        ? { sql: "UPDATE message_threads SET last_message_at = CURRENT_TIMESTAMP WHERE id = ?", args: [threadId] as any[] }
        : { sql: "INSERT INTO message_threads (id, participant_one, participant_two) VALUES (?, ?, ?)", args: [threadId, req.user.id, recipient_id] as any[] };
      await db.batch([
        { sql: "INSERT INTO messages (id, sender_id, recipient_id, subject, body) VALUES (?, ?, ?, ?, ?)", args: [id, req.user.id, recipient_id, subject || null, body] },
        threadSql,
      ]);
    } catch (err: any) {
      return res.status(500).json({ message: err.message || "Failed to send message" });
    }

    res.status(201).json({ id });
  });

  app.patch("/api/messages/:id/read", adminApiLimiter, authenticate, async (req: any, res: any) => {
    await db.execute({ sql: "UPDATE messages SET read = 1 WHERE id = ? AND recipient_id = ?", args: [req.params.id, req.user.id] });
    res.json({ message: "Marked as read" });
  });

  app.delete("/api/messages/:id", adminApiLimiter, authenticate, async (req: any, res: any) => {
    const result = await db.execute({ sql: "SELECT * FROM messages WHERE id = ?", args: [req.params.id] });
    const msg = result.rows[0] as any;
    if (!msg) return res.status(404).json({ message: "Not found" });
    if (msg.sender_id !== req.user.id && msg.recipient_id !== req.user.id) return res.status(403).json({ message: "Forbidden" });
    await db.execute({ sql: "DELETE FROM messages WHERE id = ?", args: [req.params.id] });
    res.json({ message: "Deleted" });
  });

  app.get("/api/messages/unread/count", adminApiLimiter, authenticate, async (req: any, res: any) => {
    const dmResult = await db.execute({ sql: "SELECT COUNT(*) as count FROM messages WHERE recipient_id = ? AND read = 0", args: [req.user.id] });
    const dmCount = Number((dmResult.rows[0] as any)?.count || 0);
    const groupResult = await db.execute({
      sql: `SELECT COUNT(*) as count FROM group_messages gm
        JOIN message_group_members mgm ON gm.group_id = mgm.group_id
        WHERE mgm.user_id = ? AND gm.sender_id != ?
        AND gm.created_at > COALESCE(
          (SELECT last_read_at FROM group_message_reads WHERE group_id = gm.group_id AND user_id = ?),
          '1970-01-01'
        )`,
      args: [req.user.id, req.user.id, req.user.id],
    });
    const groupCount = Number((groupResult.rows[0] as any)?.count || 0);
    res.json({ count: dmCount + groupCount });
  });

  app.get("/api/messages/contacts", adminApiLimiter, authenticate, async (req: any, res: any) => {
    let sql: string;
    const args: any[] = [];
    if (req.user.role === "admin" || req.user.role === "superadmin") {
      // Admins can message everyone except themselves
      sql = "SELECT id, name, email, role FROM users WHERE is_active = 1 AND id != ? ORDER BY name ASC";
      args.push(req.user.id);
    } else {
      // Check intern-to-intern setting
      const settingResult = await db.execute({ sql: "SELECT value FROM platform_settings WHERE key = 'allow_intern_to_intern_messaging'", args: [] });
      const setting = settingResult.rows[0] as any;
      const internToIntern = setting?.value === "true";
      if (internToIntern) {
        sql = "SELECT id, name, email, role FROM users WHERE is_active = 1 AND id != ? ORDER BY name ASC";
        args.push(req.user.id);
      } else {
        // Interns can only message admins
        sql = "SELECT id, name, email, role FROM users WHERE is_active = 1 AND id != ? AND role IN ('admin', 'superadmin') ORDER BY name ASC";
        args.push(req.user.id);
      }
    }
    const result = await db.execute({ sql, args });
    res.json(result.rows as any[]);
  });

  app.get("/api/messages/conversations", adminApiLimiter, authenticate, async (req: any, res: any) => {
    // Get all unique conversation partners with last message preview
    const result = await db.execute({
      sql: `SELECT
        CASE WHEN mt.participant_one = ? THEN mt.participant_two ELSE mt.participant_one END as other_user_id,
        u.name as other_user_name, u.role as other_user_role,
        mt.last_message_at,
        (SELECT COUNT(*) FROM messages WHERE sender_id = CASE WHEN mt.participant_one = ? THEN mt.participant_two ELSE mt.participant_one END AND recipient_id = ? AND read = 0) as unread_count,
        (SELECT body FROM messages WHERE (sender_id = ? AND recipient_id = CASE WHEN mt.participant_one = ? THEN mt.participant_two ELSE mt.participant_one END) OR (recipient_id = ? AND sender_id = CASE WHEN mt.participant_one = ? THEN mt.participant_two ELSE mt.participant_one END) ORDER BY created_at DESC LIMIT 1) as last_message
        FROM message_threads mt
        JOIN users u ON u.id = CASE WHEN mt.participant_one = ? THEN mt.participant_two ELSE mt.participant_one END
        WHERE mt.participant_one = ? OR mt.participant_two = ?
        ORDER BY mt.last_message_at DESC`,
      args: [req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id],
    });
    res.json(result.rows as any[]);
  });

  app.post("/api/messages/broadcast", adminApiLimiter, requireAdmin, async (req: any, res: any) => {
    const { subject, body } = req.body;
    if (!body) return res.status(400).json({ message: "body required" });
    const internsResult = await db.execute({ sql: "SELECT id FROM users WHERE role = 'student' AND is_active = 1", args: [] });
    const interns = internsResult.rows as any[];
    for (const intern of interns) {
      const id = crypto.randomUUID();
      await db.execute({
        sql: "INSERT INTO messages (id, sender_id, recipient_id, subject, body) VALUES (?, ?, ?, ?, ?)",
        args: [id, req.user.id, intern.id, subject || null, body],
      });
    }
    res.json({ message: `Broadcast sent to ${interns.length} intern(s)` });
  });

  // ─── Group Chats ──────────────────────────────────────────────────────────────
  // GET /api/messages/groups — list groups the current user is a member of
  app.get("/api/messages/groups", adminApiLimiter, authenticate, async (req: any, res: any) => {
    const result = await db.execute({
      sql: `SELECT mg.id, mg.name, mg.description, mg.role_filter,
        (SELECT COUNT(*) FROM message_group_members WHERE group_id = mg.id) as member_count,
        (SELECT body FROM group_messages WHERE group_id = mg.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM group_messages WHERE group_id = mg.id ORDER BY created_at DESC LIMIT 1) as last_message_at,
        COALESCE((SELECT COUNT(*) FROM group_messages gm2 WHERE gm2.group_id = mg.id
          AND gm2.sender_id != ?
          AND gm2.created_at > COALESCE(
            (SELECT last_read_at FROM group_message_reads WHERE group_id = mg.id AND user_id = ?),
            '1970-01-01'
          )), 0) as unread_count
        FROM message_groups mg
        JOIN message_group_members mgm ON mg.id = mgm.group_id
        WHERE mgm.user_id = ?
        ORDER BY last_message_at DESC, mg.created_at DESC`,
      args: [req.user.id, req.user.id, req.user.id],
    });
    res.json(result.rows as any[]);
  });

  // GET /api/messages/groups/:id — get messages in a group (must be a member)
  app.get("/api/messages/groups/:id", adminApiLimiter, authenticate, async (req: any, res: any) => {
    const memberCheck = await db.execute({
      sql: "SELECT 1 FROM message_group_members WHERE group_id = ? AND user_id = ?",
      args: [req.params.id, req.user.id],
    });
    if (memberCheck.rows.length === 0) return res.status(403).json({ message: "Not a member of this group" });
    const result = await db.execute({
      sql: "SELECT gm.*, u.name as sender_name FROM group_messages gm JOIN users u ON gm.sender_id = u.id WHERE gm.group_id = ? ORDER BY gm.created_at ASC",
      args: [req.params.id],
    });
    res.json(result.rows as any[]);
  });

  // POST /api/messages/groups/:id/send — send a message to a group
  app.post("/api/messages/groups/:id/send", adminApiLimiter, authenticate, async (req: any, res: any) => {
    const { body } = req.body;
    if (!body) return res.status(400).json({ message: "body required" });
    const memberCheck = await db.execute({
      sql: "SELECT 1 FROM message_group_members WHERE group_id = ? AND user_id = ?",
      args: [req.params.id, req.user.id],
    });
    if (memberCheck.rows.length === 0) return res.status(403).json({ message: "Not a member of this group" });
    const id = crypto.randomUUID();
    await db.execute({
      sql: "INSERT INTO group_messages (id, group_id, sender_id, body) VALUES (?, ?, ?, ?)",
      args: [id, req.params.id, req.user.id, body],
    });
    res.status(201).json({ id });
  });

  // PATCH /api/messages/groups/:id/read — mark group as read for current user
  app.patch("/api/messages/groups/:id/read", adminApiLimiter, authenticate, async (req: any, res: any) => {
    await db.execute({
      sql: "INSERT INTO group_message_reads (group_id, user_id, last_read_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(group_id, user_id) DO UPDATE SET last_read_at = CURRENT_TIMESTAMP",
      args: [req.params.id, req.user.id],
    });
    res.json({ message: "Marked as read" });
  });

  // GET /api/messages/groups/:id/members — list members (must be a group member)
  app.get("/api/messages/groups/:id/members", adminApiLimiter, authenticate, async (req: any, res: any) => {
    const memberCheck = await db.execute({
      sql: "SELECT 1 FROM message_group_members WHERE group_id = ? AND user_id = ?",
      args: [req.params.id, req.user.id],
    });
    if (!memberCheck.rows.length) return res.status(403).json({ message: "Not a member of this group" });
    const result = await db.execute({
      sql: "SELECT u.id, u.name, u.role FROM message_group_members mgm JOIN users u ON mgm.user_id = u.id WHERE mgm.group_id = ? ORDER BY u.name ASC",
      args: [req.params.id],
    });
    res.json(result.rows as any[]);
  });

  // POST /api/admin/messages/groups — create a group (admin only)
  app.post("/api/admin/messages/groups", adminApiLimiter, requireAdmin, async (req: any, res: any) => {
    const { name, description, role_filter } = req.body;
    if (!name) return res.status(400).json({ message: "name required" });
    const id = crypto.randomUUID();
    await db.execute({
      sql: "INSERT INTO message_groups (id, name, description, role_filter, created_by) VALUES (?, ?, ?, ?, ?)",
      args: [id, name, description || null, role_filter || null, req.user.id],
    });
    // Auto-add all active admins
    const adminsResult = await db.execute({ sql: "SELECT id FROM users WHERE role IN ('admin', 'superadmin') AND is_active = 1", args: [] });
    for (const admin of adminsResult.rows as any[]) {
      await db.execute({ sql: "INSERT OR IGNORE INTO message_group_members (group_id, user_id) VALUES (?, ?)", args: [id, admin.id] });
    }
    // Auto-add matching interns by role_filter
    if (role_filter) {
      let internSql: string;
      let internArgs: any[];
      if (role_filter === "all") {
        internSql = "SELECT id FROM users WHERE role = 'student' AND is_active = 1";
        internArgs = [];
      } else {
        internSql = "SELECT u.id FROM users u JOIN student_profiles sp ON u.id = sp.user_id WHERE u.role = 'student' AND u.is_active = 1 AND sp.intern_role = ?";
        internArgs = [role_filter];
      }
      const internsResult = await db.execute({ sql: internSql, args: internArgs });
      for (const intern of internsResult.rows as any[]) {
        await db.execute({ sql: "INSERT OR IGNORE INTO message_group_members (group_id, user_id) VALUES (?, ?)", args: [id, intern.id] });
      }
    }
    res.status(201).json({ id, message: "Group created" });
  });

  // GET /api/admin/messages/groups — list all groups (admin view)
  app.get("/api/admin/messages/groups", adminApiLimiter, requireAdmin, async (req: any, res: any) => {
    const result = await db.execute({
      sql: `SELECT mg.*, (SELECT COUNT(*) FROM message_group_members WHERE group_id = mg.id) as member_count
        FROM message_groups mg ORDER BY mg.created_at DESC`,
      args: [],
    });
    res.json(result.rows as any[]);
  });

  // GET /api/admin/messages/groups/:id/members — list members of a group
  app.get("/api/admin/messages/groups/:id/members", adminApiLimiter, requireAdmin, async (req: any, res: any) => {
    const result = await db.execute({
      sql: "SELECT u.id, u.name, u.email, u.role FROM message_group_members mgm JOIN users u ON mgm.user_id = u.id WHERE mgm.group_id = ? ORDER BY u.name ASC",
      args: [req.params.id],
    });
    res.json(result.rows as any[]);
  });

  // POST /api/admin/messages/groups/:id/members — add a member
  app.post("/api/admin/messages/groups/:id/members", adminApiLimiter, requireAdmin, async (req: any, res: any) => {
    const { user_id } = req.body;
    if (!user_id) return res.status(400).json({ message: "user_id required" });
    await db.execute({ sql: "INSERT OR IGNORE INTO message_group_members (group_id, user_id) VALUES (?, ?)", args: [req.params.id, user_id] });
    res.json({ message: "Member added" });
  });

  // DELETE /api/admin/messages/groups/:id/members/:userId — remove a member
  app.delete("/api/admin/messages/groups/:id/members/:userId", adminApiLimiter, requireAdmin, async (req: any, res: any) => {
    await db.execute({ sql: "DELETE FROM message_group_members WHERE group_id = ? AND user_id = ?", args: [req.params.id, req.params.userId] });
    res.json({ message: "Member removed" });
  });

  // DELETE /api/admin/messages/groups/:id — delete a group
  app.delete("/api/admin/messages/groups/:id", adminApiLimiter, requireAdmin, async (req: any, res: any) => {
    await db.execute({ sql: "DELETE FROM message_group_members WHERE group_id = ?", args: [req.params.id] });
    await db.execute({ sql: "DELETE FROM group_messages WHERE group_id = ?", args: [req.params.id] });
    await db.execute({ sql: "DELETE FROM group_message_reads WHERE group_id = ?", args: [req.params.id] });
    await db.execute({ sql: "DELETE FROM message_groups WHERE id = ?", args: [req.params.id] });
    res.json({ message: "Group deleted" });
  });

  // GET /api/admin/messages/all-conversations — list all DM conversations across the platform (admin monitoring)
  app.get("/api/admin/messages/all-conversations", adminApiLimiter, requireAdmin, async (req: any, res: any) => {
    const result = await db.execute({
      sql: `SELECT
              CASE WHEN m.sender_id < m.recipient_id THEN m.sender_id ELSE m.recipient_id END as user1_id,
              CASE WHEN m.sender_id < m.recipient_id THEN m.recipient_id ELSE m.sender_id END as user2_id,
              u1.name as user1_name, u2.name as user2_name,
              u1.role as user1_role, u2.role as user2_role,
              MAX(m.created_at) as last_message_at,
              COUNT(*) as message_count
            FROM messages m
            JOIN users u1 ON u1.id = (CASE WHEN m.sender_id < m.recipient_id THEN m.sender_id ELSE m.recipient_id END)
            JOIN users u2 ON u2.id = (CASE WHEN m.sender_id < m.recipient_id THEN m.recipient_id ELSE m.sender_id END)
            GROUP BY user1_id, user2_id
            ORDER BY last_message_at DESC`,
      args: [],
    });
    res.json(result.rows as any[]);
  });

  // GET /api/admin/messages/thread/:userId1/:userId2 — view any DM thread (admin monitoring)
  app.get("/api/admin/messages/thread/:userId1/:userId2", adminApiLimiter, requireAdmin, async (req: any, res: any) => {
    const result = await db.execute({
      sql: `SELECT m.*, u.name as sender_name FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE (m.sender_id = ? AND m.recipient_id = ?) OR (m.sender_id = ? AND m.recipient_id = ?)
            ORDER BY m.created_at ASC`,
      args: [req.params.userId1, req.params.userId2, req.params.userId2, req.params.userId1],
    });
    res.json(result.rows as any[]);
  });

  app.get("/api/admin/settings/platform", adminApiLimiter, requireAdmin, async (req, res) => {
    const result = await db.execute({ sql: "SELECT * FROM platform_settings", args: [] });
    const settings: Record<string, string> = {};
    (result.rows as any[]).forEach(r => { settings[r.key] = r.value; });
    res.json(settings);
  });

  app.patch("/api/admin/settings/platform", adminApiLimiter, requireSuperadmin, async (req: any, res: any) => {
    const { key, value } = req.body;
    if (!key || value === undefined) return res.status(400).json({ message: "key and value required" });
    await db.execute({
      sql: "INSERT INTO platform_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP",
      args: [key, value, value],
    });
    res.json({ message: "Setting updated" });
  });

  // ─── Legacy student task routes ────────────────────────────────────────────────
  app.get("/api/tasks/mine", studentApiLimiter, authenticate, async (req: any, res: any) => {
    if (req.user.role !== "student") return res.status(403).json({ message: "Students only" });
    const result = await db.execute({
      sql: "SELECT t.*, u.name as creator_name FROM tasks t LEFT JOIN users u ON t.created_by = u.id WHERE t.assigned_to = ? ORDER BY t.created_at DESC",
      args: [req.user.id],
    });
    res.json((result.rows as any[]).map((t) => ({ ...t, tags: JSON.parse(t.tags || "[]") })));
  });

  app.patch("/api/tasks/:id", studentApiLimiter, authenticate, async (req: any, res: any) => {
    const taskResult = await db.execute({ sql: "SELECT * FROM tasks WHERE id = ?", args: [req.params.id] });
    const task = taskResult.rows[0] as any;
    if (!task) return res.status(404).json({ message: "Not found" });
    if (req.user.role === "student") {
      // Allow update if task is directly assigned OR if it matches the intern's role
      const profileResult = await db.execute({ sql: "SELECT intern_role FROM student_profiles WHERE user_id = ?", args: [req.user.id] });
      const internRole = (profileResult.rows[0] as any)?.intern_role || null;
      const isAssignedToUser = task.assigned_to === req.user.id;
      const isAssignedToRole = internRole && task.assigned_role === internRole;
      if (!isAssignedToUser && !isAssignedToRole) {
        return res.status(403).json({ message: "Not authorized" });
      }
      const { status, actual_hours } = req.body;
      if (status && !["in_progress", "in_review"].includes(status)) {
        return res.status(400).json({ message: "Students can only set in_progress or in_review" });
      }
      if (status) await db.execute({ sql: "UPDATE tasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", args: [status, req.params.id] });
      if (actual_hours !== undefined) await db.execute({ sql: "UPDATE tasks SET actual_hours = ? WHERE id = ?", args: [actual_hours, req.params.id] });
    }
    res.json({ message: "Updated" });
  });

  app.post("/api/tasks/:id/comments", studentApiLimiter, authenticate, async (req: any, res: any) => {
    const taskResult = await db.execute({ sql: "SELECT * FROM tasks WHERE id = ?", args: [req.params.id] });
    const task = taskResult.rows[0] as any;
    if (!task) return res.status(404).json({ message: "Not found" });
    if (req.user.role === "student" && task.assigned_to !== req.user.id) return res.status(403).json({ message: "Not authorized" });
    const { content } = req.body;
    const id = crypto.randomUUID();
    await db.execute({ sql: "INSERT INTO task_comments (id, task_id, user_id, content) VALUES (?, ?, ?, ?)", args: [id, req.params.id, req.user.id, content] });
    res.status(201).json({ id });
  });

  // ─── Workspace Routes ──────────────────────────────────────────────────────────
  app.get("/api/workspace/tasks", studentApiLimiter, authenticate, async (req: any, res: any) => {
    const profileResult = await db.execute({ sql: "SELECT intern_role FROM student_profiles WHERE user_id = ?", args: [req.user.id] });
    const profile = profileResult.rows[0] as any;
    const internRole = profile?.intern_role || null;
    // Hide submission and review fields for role-based tasks not assigned to this specific user
    let sql = `SELECT t.id, t.title, t.description, t.status, t.priority, t.task_type, t.assigned_role, t.due_date, t.estimated_hours, t.tags, t.points, t.created_at, t.updated_at,
      CASE WHEN t.assigned_to = ? THEN t.submission_url ELSE NULL END as submission_url,
      CASE WHEN t.assigned_to = ? THEN t.submission_note ELSE NULL END as submission_note,
      CASE WHEN t.assigned_to = ? THEN t.admin_feedback ELSE NULL END as admin_feedback,
      CASE WHEN t.assigned_to = ? THEN t.admin_score ELSE NULL END as admin_score,
      u.name as creator_name FROM tasks t LEFT JOIN users u ON t.created_by = u.id WHERE (t.assigned_to = ?`;
    const args: any[] = [req.user.id, req.user.id, req.user.id, req.user.id, req.user.id];
    if (internRole) {
      sql += " OR t.assigned_role = ?";
      args.push(internRole);
    }
    sql += ") ORDER BY t.created_at DESC";
    const result = await db.execute({ sql, args });
    res.json((result.rows as any[]).map((t) => ({ ...t, tags: JSON.parse(t.tags || "[]") })));
  });

  app.patch("/api/workspace/tasks/:id/submit", studentApiLimiter, authenticate, async (req: any, res: any) => {
    const { submission_url, submission_note, status } = req.body;
    const taskResult = await db.execute({ sql: "SELECT * FROM tasks WHERE id = ?", args: [req.params.id] });
    const task = taskResult.rows[0] as any;
    if (!task) return res.status(404).json({ message: "Not found" });
    if (task.assigned_to !== req.user.id) return res.status(403).json({ message: "Not authorized" });

    // Allow intern to take back a submitted task (revert to in_progress)
    if (status === 'in_progress') {
      await db.execute({
        sql: "UPDATE tasks SET submission_url = NULL, submission_note = NULL, status = 'in_progress', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        args: [req.params.id],
      });
      return res.json({ message: "Task taken back" });
    }

    await db.execute({
      sql: "UPDATE tasks SET submission_url = ?, submission_note = ?, status = 'in_review', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      args: [submission_url || null, submission_note || null, req.params.id],
    });
    const adminResult = await db.execute({ sql: "SELECT id FROM users WHERE role IN ('admin', 'superadmin') LIMIT 1", args: [] });
    const admin = adminResult.rows[0] as any;
    if (admin) {
      await db.execute({
        sql: "INSERT INTO notifications (id, user_id, message, type) VALUES (?, ?, ?, 'task_reviewed')",
        args: [crypto.randomUUID(), admin.id, `Task submitted for review: ${task.title}`],
      });
    }
    res.json({ message: "Submitted" });
  });

  app.get("/api/workspace/calendar", studentApiLimiter, authenticate, async (req: any, res: any) => {
    const profileResult = await db.execute({ sql: "SELECT intern_role FROM student_profiles WHERE user_id = ?", args: [req.user.id] });
    const profile = profileResult.rows[0] as any;
    const internRole = profile?.intern_role || null;
    let sql = "SELECT * FROM calendar_events WHERE target_role = 'all' OR target_user_id = ?";
    const args: any[] = [req.user.id];
    if (internRole) {
      sql += " OR target_role = ?";
      args.push(internRole);
    }
    sql += " ORDER BY event_date ASC";
    const result = await db.execute({ sql, args });
    res.json(result.rows as any[]);
  });

  app.get("/api/workspace/projects", studentApiLimiter, authenticate, async (req: any, res: any) => {
    const profileResult = await db.execute({ sql: "SELECT intern_role FROM student_profiles WHERE user_id = ?", args: [req.user.id] });
    const profile = profileResult.rows[0] as any;
    const internRole = profile?.intern_role || null;
    let sql = `SELECT p.*, pa.status as my_status, pa.id as assignment_id
               FROM projects p
               LEFT JOIN project_assignments pa ON pa.project_id = p.id AND pa.user_id = ?
               WHERE p.status != 'closed' AND (p.target_role = 'all' OR p.target_role IS NULL`;
    const args: any[] = [req.user.id];
    if (internRole) {
      sql += " OR p.target_role = ?";
      args.push(internRole);
    }
    sql += ") ORDER BY p.created_at DESC";
    const result = await db.execute({ sql, args });
    res.json((result.rows as any[]).map((p) => {
      let skills: string[] = [];
      try { skills = JSON.parse(p.skills_required || "[]"); } catch { skills = []; }
      return { ...p, skills_required: skills };
    }));
  });

  // POST /api/workspace/projects/:id/join — join a project (creates an assignment)
  app.post("/api/workspace/projects/:id/join", studentApiLimiter, authenticate, async (req: any, res: any) => {
    const projectResult = await db.execute({ sql: "SELECT id FROM projects WHERE id = ?", args: [req.params.id] });
    if (!projectResult.rows.length) return res.status(404).json({ message: "Project not found" });
    try {
      await db.execute({
        sql: "INSERT OR IGNORE INTO project_assignments (id, project_id, user_id) VALUES (?, ?, ?)",
        args: [crypto.randomUUID(), req.params.id, req.user.id],
      });
      res.json({ message: "Joined project" });
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Failed to join project" });
    }
  });

  // PATCH /api/workspace/projects/:id/status — update own project assignment status
  app.patch("/api/workspace/projects/:id/status", studentApiLimiter, authenticate, async (req: any, res: any) => {
    const { status } = req.body;
    if (!['in_progress', 'in_review'].includes(status)) return res.status(400).json({ message: "Invalid status" });
    const updated = await db.execute({
      sql: "UPDATE project_assignments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE project_id = ? AND user_id = ?",
      args: [status, req.params.id, req.user.id],
    });
    if (!updated.rowsAffected) return res.status(404).json({ message: "Assignment not found — join the project first" });
    res.json({ message: "Status updated" });
  });

  app.get("/api/workspace/notifications", studentApiLimiter, authenticate, async (req: any, res: any) => {
    const result = await db.execute({ sql: "SELECT * FROM notifications WHERE user_id = ? AND read = 0 ORDER BY created_at DESC", args: [req.user.id] });
    res.json(result.rows as any[]);
  });

  app.patch("/api/workspace/notifications/:id", studentApiLimiter, authenticate, async (req: any, res: any) => {
    await db.execute({ sql: "UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?", args: [req.params.id, req.user.id] });
    res.json({ message: "Marked as read" });
  });

  app.get("/api/workspace/leaderboard", studentApiLimiter, authenticate, async (req: any, res: any) => {
    const { role } = req.query as any;
    let sql = "SELECT u.id, u.name, sp.intern_role, sp.points_total FROM users u JOIN student_profiles sp ON u.id = sp.user_id WHERE u.role = 'student' AND u.is_active = 1";
    const args: any[] = [];
    if (role) { sql += " AND sp.intern_role = ?"; args.push(role); }
    sql += " ORDER BY sp.points_total DESC";
    const result = await db.execute({ sql, args });
    res.json(result.rows as any[]);
  });

  app.get("/api/workspace/profile", studentApiLimiter, authenticate, async (req: any, res: any) => {
    const result = await db.execute({
      sql: "SELECT u.id, u.name, u.email, u.created_at, sp.* FROM users u LEFT JOIN student_profiles sp ON u.id = sp.user_id WHERE u.id = ?",
      args: [req.user.id],
    });
    const profile = result.rows[0] as any;
    if (!profile) return res.status(404).json({ message: "Not found" });
    const taskStatsResult = await db.execute({
      sql: "SELECT COUNT(*) as total, SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) as completed FROM tasks WHERE assigned_to = ?",
      args: [req.user.id],
    });
    const stats = taskStatsResult.rows[0] as any;
    res.json({
      ...profile,
      skills: JSON.parse(profile.skills || "[]"),
      badges_earned: JSON.parse(profile.badges_earned || "[]"),
      task_stats: stats,
    });
  });

  app.patch("/api/workspace/profile", studentApiLimiter, authenticate, async (req: any, res: any) => {
    const { name, university, bio, major, year } = req.body;
    if (name && typeof name === "string" && name.trim()) {
      await db.execute({ sql: "UPDATE users SET name = ? WHERE id = ?", args: [name.trim(), req.user.id] });
    }
    await db.execute({
      sql: `UPDATE student_profiles SET
        university = COALESCE(?, university),
        bio = COALESCE(?, bio),
        major = COALESCE(?, major),
        year = COALESCE(?, year)
        WHERE user_id = ?`,
      args: [university || null, bio || null, major || null, year || null, req.user.id],
    });
    res.json({ message: "Profile updated" });
  });

  app.patch("/api/workspace/password", studentApiLimiter, authenticate, async (req: any, res: any) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: "Current and new password are required" });
    if (newPassword.length < 8) return res.status(400).json({ message: "New password must be at least 8 characters" });
    const result = await db.execute({ sql: "SELECT password, email, role, name FROM users WHERE id = ?", args: [req.user.id] });
    const user = result.rows[0] as any;
    if (!user) return res.status(404).json({ message: "User not found" });
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(401).json({ message: "Current password is incorrect" });
    const hashed = await bcrypt.hash(newPassword, 12);
    await db.execute({ sql: "UPDATE users SET password = ?, token_version = token_version + 1 WHERE id = ?", args: [hashed, req.user.id] });
    evictAuthCache(req.user.id);
    // Re-fetch updated token_version and issue a new JWT so the session stays valid after the password change
    const updated = await db.execute({ sql: "SELECT token_version FROM users WHERE id = ?", args: [req.user.id] });
    const tokenVersion = (updated.rows[0] as any).token_version;
    const newToken = jwt.sign({ id: req.user.id, email: user.email, role: user.role, name: user.name, tokenVersion }, JWT_SECRET, { expiresIn: "24h" });
    res.cookie("token", newToken, getCookieOptions(req));
    res.json({ message: "Password updated successfully" });
  });

  // ─── Global error handler ────────────────────────────────────────────────────
  // Must be registered last, after all routes. Catches any unhandled async
  // error thrown inside a route handler (e.g. a Turso connection failure) and
  // returns a JSON response instead of Express's default HTML error page.
  // Without this, res.json() on the client throws SyntaxError → "Network error".
  app.use((err: any, _req: any, res: any, _next: any) => {
    console.error('[API error]', err?.message || err);
    const status = typeof err?.status === 'number' ? err.status : 500;
    res.status(status).json({ message: err?.message || 'Internal server error. Please try again.' });
  });

  return app;
}

async function startServer() {
  await initDb();
  const app = await buildApp();

  // ─── Vite / Static serving ────────────────────────────────────────────────────
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Frontend is served by GitHub Pages — not from this server.
    // This server is API-only in production.
    app.get("/", (req, res) => {
      res.json({ status: "Peach Stack API is running" });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
