import bcrypt from "bcryptjs";
import prisma from "../config/database";
import { signToken } from "../utils/jwt";
import { Role, UserStatus } from "@prisma/client";
import { z } from "zod/v4";
import { signupSchema, loginSchema } from "../validators/auth.validator";

// Types derived from Zod schemas
type SignupData = z.infer<typeof signupSchema>;
type LoginData = z.infer<typeof loginSchema>;

export class AuthService {
  /**
   * Register a new user with default role EMPLOYEE
   */
  async signup(data: SignupData) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error("Email already in use");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: Role.EMPLOYEE,
        status: UserStatus.ACTIVE,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        departmentId: true,
        createdAt: true,
      },
    });

    const token = signToken(user.id, user.role);

    return { user, token };
  }

  /**
   * Log in an existing user and verify credentials
   */
  async login(data: LoginData) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    if (user.status === UserStatus.INACTIVE) {
      throw new Error("Account is deactivated");
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      throw new Error("Invalid email or password");
    }

    const token = signToken(user.id, user.role);

    // Omit password from output
    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  /**
   * Fetch current user profile
   */
  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        departmentId: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }
}

export const authService = new AuthService();
