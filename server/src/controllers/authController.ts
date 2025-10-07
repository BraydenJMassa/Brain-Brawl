import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sql } from "../database/dbConfig";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export const register = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ message: "All fields required" });

  try {
    const [existingUser] =
      await sql`SELECT username, email FROM users WHERE username=${username} OR email=${email}`;
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hash = await bcrypt.hash(password, 10);
    const [user] = await sql`
      INSERT INTO users (username, email, password_hash)
      VALUES (${username}, ${email}, ${hash})
      RETURNING id, username, email
    `;
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { usernameOrEmail, password } = req.body;
  try {
    const [user] =
      await sql`SELECT * FROM users WHERE email=${usernameOrEmail} OR username=${usernameOrEmail}`;
    if (!user) return res.status(404).json({ message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });
    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
