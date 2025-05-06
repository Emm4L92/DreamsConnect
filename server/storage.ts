import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool, db } from "@db";

export interface IStorage {
  db: typeof db;
  getUser: (id: number) => Promise<schema.User>;
  getUserByUsername: (username: string) => Promise<schema.User | null>;
  createUser: (user: schema.InsertUser) => Promise<schema.User>;
  getDreamById: (id: number) => Promise<schema.Dream | null>;
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  db: typeof db;
  sessionStore: session.SessionStore;

  constructor() {
    this.db = db;
    
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({ 
      pool,
      createTableIfMissing: true,
      tableName: 'user_sessions'
    });
  }

  async getUser(id: number): Promise<schema.User> {
    const users = await this.db.select().from(schema.users).where(eq(schema.users.id, id));
    
    if (users.length === 0) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    return users[0];
  }

  async getUserByUsername(username: string): Promise<schema.User | null> {
    const users = await this.db.select().from(schema.users).where(eq(schema.users.username, username));
    
    if (users.length === 0) {
      return null;
    }
    
    return users[0];
  }

  async createUser(user: schema.InsertUser): Promise<schema.User> {
    const [newUser] = await this.db.insert(schema.users).values(user).returning();
    return newUser;
  }

  async getDreamById(id: number): Promise<schema.Dream | null> {
    const dreams = await this.db.select().from(schema.dreams).where(eq(schema.dreams.id, id));
    
    if (dreams.length === 0) {
      return null;
    }
    
    const dream = dreams[0];
    
    // Get dream tags
    const dreamTags = await this.db
      .select()
      .from(schema.dreamTags)
      .where(eq(schema.dreamTags.dreamId, id));
    
    // Get author
    const author = await this.getUser(dream.authorId);
    
    return {
      ...dream,
      tags: dreamTags.map(tag => tag.tag),
      author: {
        id: author.id,
        username: author.username
      }
    };
  }
}

// Use the database storage implementation
export const storage = new DatabaseStorage();
