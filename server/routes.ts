import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { setupWebSockets } from "./socket";
import { generateTags } from "./nlp";
import { translateText } from "./translation";
import { eq, and, like, desc, sql } from "drizzle-orm";
import { dreams, dreamTags, dreamLikes, dreamComments, dreamMatches, chatMessages } from "@shared/schema";
import { WebSocket } from "ws";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  const httpServer = createServer(app);
  
  // Setup WebSockets for real-time chat
  setupWebSockets(httpServer);

  // Dreams API
  app.get("/api/dreams", async (req, res, next) => {
    try {
      const language = req.query.language as string | undefined;
      const tag = req.query.tag as string | undefined;
      
      let query = storage.db.select().from(dreams)
        .leftJoin(dreamTags, eq(dreams.id, dreamTags.dreamId))
        .where(eq(dreams.visibility, "public"));
      
      if (language && language !== "all") {
        query = query.where(eq(dreams.language, language));
      }
      
      if (tag) {
        query = query.where(eq(dreamTags.tag, tag));
      }
      
      const result = await query.orderBy(desc(dreams.createdAt));
      
      // Group by dream ID to handle multiple tags per dream
      const dreamMap = new Map();
      
      for (const row of result) {
        const dream = row.dreams;
        if (!dreamMap.has(dream.id)) {
          dreamMap.set(dream.id, {
            ...dream,
            tags: row.dream_tags ? [row.dream_tags.tag] : [],
            isLikedByUser: false, // Will be set below
            likeCount: 0,
            commentCount: 0,
            matchPercentage: Math.floor(Math.random() * 100) // Placeholder for demo
          });
        } else if (row.dream_tags) {
          dreamMap.get(dream.id).tags.push(row.dream_tags.tag);
        }
      }
      
      // Get like counts
      const likeCounts = await storage.db
        .select({ dreamId: dreamLikes.dreamId, count: sql<number>`count(*)` })
        .from(dreamLikes)
        .groupBy(dreamLikes.dreamId);
      
      for (const count of likeCounts) {
        if (dreamMap.has(count.dreamId)) {
          dreamMap.get(count.dreamId).likeCount = count.count;
        }
      }
      
      // Get comment counts
      const commentCounts = await storage.db
        .select({ dreamId: dreamComments.dreamId, count: sql<number>`count(*)` })
        .from(dreamComments)
        .groupBy(dreamComments.dreamId);
      
      for (const count of commentCounts) {
        if (dreamMap.has(count.dreamId)) {
          dreamMap.get(count.dreamId).commentCount = count.count;
        }
      }
      
      // Check if the current user has liked each dream
      if (req.isAuthenticated()) {
        const userId = req.user.id;
        const userLikes = await storage.db
          .select()
          .from(dreamLikes)
          .where(eq(dreamLikes.userId, userId));
        
        for (const like of userLikes) {
          if (dreamMap.has(like.dreamId)) {
            dreamMap.get(like.dreamId).isLikedByUser = true;
          }
        }
      }
      
      const dreamsArray = Array.from(dreamMap.values());
      res.json(dreamsArray);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/dreams", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to share dreams" });
      }
      
      const { title, content, language, visibility, imageUrl } = req.body;
      
      // Generate tags using NLP
      const tags = await generateTags(content, language);
      
      // Create the dream
      const [newDream] = await storage.db.insert(dreams).values({
        title,
        content,
        language,
        visibility,
        imageUrl: imageUrl || null,
        authorId: req.user.id,
        createdAt: new Date()
      }).returning();
      
      // Add tags
      if (tags.length > 0) {
        await storage.db.insert(dreamTags)
          .values(tags.map(tag => ({
            dreamId: newDream.id,
            tag
          })));
      }
      
      // Find potential matches
      await findDreamMatches(newDream.id);
      
      res.status(201).json({ ...newDream, tags });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/dreams/:id", async (req, res, next) => {
    try {
      const dreamId = parseInt(req.params.id);
      const dream = await storage.getDreamById(dreamId);
      
      if (!dream) {
        return res.status(404).json({ message: "Dream not found" });
      }
      
      // Check if dream is private and if the user is not the author
      if (dream.visibility === "private" && 
          (!req.isAuthenticated() || req.user.id !== dream.authorId)) {
        return res.status(403).json({ message: "You don't have permission to view this dream" });
      }
      
      // Get comments
      const comments = await storage.db
        .select()
        .from(dreamComments)
        .where(eq(dreamComments.dreamId, dreamId))
        .orderBy(dreamComments.createdAt);
      
      // Check if the user has liked this dream
      let isLikedByUser = false;
      if (req.isAuthenticated()) {
        const userLike = await storage.db
          .select()
          .from(dreamLikes)
          .where(and(
            eq(dreamLikes.dreamId, dreamId),
            eq(dreamLikes.userId, req.user.id)
          ));
        isLikedByUser = userLike.length > 0;
      }
      
      res.json({
        ...dream,
        comments,
        isLikedByUser
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/dreams/:id/like", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to like dreams" });
      }
      
      const dreamId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check if already liked
      const existingLike = await storage.db
        .select()
        .from(dreamLikes)
        .where(and(
          eq(dreamLikes.dreamId, dreamId),
          eq(dreamLikes.userId, userId)
        ));
      
      if (existingLike.length > 0) {
        return res.status(400).json({ message: "You have already liked this dream" });
      }
      
      await storage.db.insert(dreamLikes).values({
        dreamId,
        userId,
        createdAt: new Date()
      });
      
      res.status(201).json({ message: "Dream liked successfully" });
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/dreams/:id/like", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to unlike dreams" });
      }
      
      const dreamId = parseInt(req.params.id);
      const userId = req.user.id;
      
      await storage.db
        .delete(dreamLikes)
        .where(and(
          eq(dreamLikes.dreamId, dreamId),
          eq(dreamLikes.userId, userId)
        ));
      
      res.json({ message: "Dream unliked successfully" });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/dreams/:id/comments", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to comment" });
      }
      
      const dreamId = parseInt(req.params.id);
      const { content } = req.body;
      
      const [newComment] = await storage.db.insert(dreamComments).values({
        dreamId,
        userId: req.user.id,
        content,
        createdAt: new Date()
      }).returning();
      
      res.status(201).json(newComment);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/dreams/:id/translate", async (req, res, next) => {
    try {
      const dreamId = parseInt(req.params.id);
      const targetLang = req.query.targetLang as string || 'en';
      
      const dream = await storage.getDreamById(dreamId);
      
      if (!dream) {
        return res.status(404).json({ message: "Dream not found" });
      }
      
      // Translate content
      const translatedContent = await translateText(dream.content, dream.language, targetLang);
      
      res.json({
        original: dream.content,
        translatedContent,
        sourceLanguage: dream.language,
        targetLanguage: targetLang
      });
    } catch (error) {
      next(error);
    }
  });

  // User dreams
  app.get("/api/users/:id/dreams", async (req, res, next) => {
    try {
      const userId = parseInt(req.params.id);
      
      let query = storage.db.select().from(dreams)
        .where(eq(dreams.authorId, userId));
      
      // If not the authenticated user, only show public dreams
      if (!req.isAuthenticated() || req.user.id !== userId) {
        query = query.where(eq(dreams.visibility, "public"));
      }
      
      const userDreams = await query.orderBy(desc(dreams.createdAt));
      
      res.json(userDreams);
    } catch (error) {
      next(error);
    }
  });

  // Matches
  app.get("/api/matches", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to view matches" });
      }
      
      const userId = req.user.id;
      
      const matchesResult = await storage.db
        .select({
          id: dreamMatches.id,
          dreamId: dreamMatches.dreamId,
          matchedDreamId: dreamMatches.matchedDreamId,
          score: dreamMatches.score,
          createdAt: dreamMatches.createdAt
        })
        .from(dreamMatches)
        .innerJoin(dreams, eq(dreamMatches.dreamId, dreams.id))
        .innerJoin(dreams, eq(dreamMatches.matchedDreamId, dreams.id))
        .where(eq(dreams.authorId, userId));
      
      // Get user info and dream info for each match
      const matches = await Promise.all(matchesResult.map(async (match) => {
        const matchedDream = await storage.getDreamById(match.matchedDreamId);
        const matchedUser = await storage.getUser(matchedDream.authorId);
        
        return {
          id: match.id,
          user: {
            id: matchedUser.id,
            username: matchedUser.username,
            avatarId: matchedUser.id % 6 // Simple way to get consistent avatar
          },
          dreamId: matchedDream.id,
          dreamTitle: matchedDream.title,
          score: match.score,
          createdAt: match.createdAt
        };
      }));
      
      res.json({ matches });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/matches/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to view match details" });
      }
      
      const matchId = parseInt(req.params.id);
      
      const match = await storage.db
        .select()
        .from(dreamMatches)
        .where(eq(dreamMatches.id, matchId))
        .limit(1);
      
      if (match.length === 0) {
        return res.status(404).json({ message: "Match not found" });
      }
      
      const matchData = match[0];
      
      const userDream = await storage.getDreamById(matchData.dreamId);
      const matchedDream = await storage.getDreamById(matchData.matchedDreamId);
      
      // Check if the authenticated user is part of this match
      if (req.user.id !== userDream.authorId && req.user.id !== matchedDream.authorId) {
        return res.status(403).json({ message: "You don't have permission to view this match" });
      }
      
      // Determine which user to show info for (the other person in the match)
      const isUserDreamAuthor = req.user.id === userDream.authorId;
      const otherDream = isUserDreamAuthor ? matchedDream : userDream;
      const otherUser = await storage.getUser(otherDream.authorId);
      
      res.json({
        id: matchData.id,
        user: {
          id: otherUser.id,
          username: otherUser.username,
          avatarId: otherUser.id % 6
        },
        dreamId: otherDream.id,
        dreamTitle: otherDream.title,
        score: matchData.score,
        createdAt: matchData.createdAt
      });
    } catch (error) {
      next(error);
    }
  });

  // Chat messages
  app.get("/api/matches/:id/messages", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to view messages" });
      }
      
      const matchId = parseInt(req.params.id);
      
      // Verify user is part of this match
      const match = await storage.db
        .select()
        .from(dreamMatches)
        .where(eq(dreamMatches.id, matchId))
        .limit(1);
      
      if (match.length === 0) {
        return res.status(404).json({ message: "Match not found" });
      }
      
      const matchData = match[0];
      
      const userDream = await storage.getDreamById(matchData.dreamId);
      const matchedDream = await storage.getDreamById(matchData.matchedDreamId);
      
      if (req.user.id !== userDream.authorId && req.user.id !== matchedDream.authorId) {
        return res.status(403).json({ message: "You don't have permission to view these messages" });
      }
      
      // Get messages
      const messages = await storage.db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.matchId, matchId))
        .orderBy(chatMessages.createdAt);
      
      res.json(messages);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/matches/:id/messages", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to send messages" });
      }
      
      const matchId = parseInt(req.params.id);
      const { content } = req.body;
      
      // Verify user is part of this match
      const match = await storage.db
        .select()
        .from(dreamMatches)
        .where(eq(dreamMatches.id, matchId))
        .limit(1);
      
      if (match.length === 0) {
        return res.status(404).json({ message: "Match not found" });
      }
      
      const matchData = match[0];
      
      const userDream = await storage.getDreamById(matchData.dreamId);
      const matchedDream = await storage.getDreamById(matchData.matchedDreamId);
      
      if (req.user.id !== userDream.authorId && req.user.id !== matchedDream.authorId) {
        return res.status(403).json({ message: "You don't have permission to send messages in this chat" });
      }
      
      // Create message
      const [message] = await storage.db.insert(chatMessages).values({
        matchId,
        senderId: req.user.id,
        content,
        createdAt: new Date()
      }).returning();
      
      // Broadcast message through WebSocket
      const clients = Array.from(global.wsClients.values());
      
      // Find the other user's ID
      const otherUserId = req.user.id === userDream.authorId ? matchedDream.authorId : userDream.authorId;
      
      // Send to both users
      for (const client of clients) {
        if ((client.userId === req.user.id || client.userId === otherUserId) && 
            client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'chat_message',
            matchId,
            message
          }));
        }
      }
      
      res.status(201).json(message);
    } catch (error) {
      next(error);
    }
  });

  // Helper function to find dream matches
  async function findDreamMatches(dreamId: number) {
    try {
      const dream = await storage.getDreamById(dreamId);
      
      if (!dream) {
        console.log(`[Match] Dream with ID ${dreamId} not found`);
        return;
      }
      
      // Get tags for this dream
      const dreamTagsResult = await storage.db
        .select()
        .from(dreamTags)
        .where(eq(dreamTags.dreamId, dreamId));
      
      const tags = dreamTagsResult.map(t => t.tag);
      
      if (tags.length === 0) {
        console.log(`[Match] No tags found for dream ${dreamId}`);
        return;
      }
      
      console.log(`[Match] Processing dream ${dreamId} with tags: ${tags.join(', ')}`);
      
      // Find all dreams with at least one matching tag
      // We'll use SQL directly for this query since we had issues with tag.in
      const potentialMatchesResult = await storage.db.execute(sql`
        SELECT 
          dream_tags.dream_id as "dreamId", 
          COUNT(*) as "tagCount",
          COUNT(*) * 100.0 / ${tags.length} as "score"
        FROM dream_tags
        WHERE dream_tags.tag IN (${sql.join(tags)})
          AND dream_tags.dream_id != ${dreamId}
        GROUP BY dream_tags.dream_id
        HAVING COUNT(*) >= ${Math.ceil(tags.length * 0.3)} 
      `);
      
      const potentialMatches = potentialMatchesResult.rows;
      console.log(`[Match] Found ${potentialMatches.length} potential matches`);
      
      // Process matches with enhanced content-based similarity
      for (const match of potentialMatches) {
        // Parse the score as it might be a string from SQL
        const tagScore = parseFloat(match.score as any) || 0;
        
        if (tagScore >= 50) {
          const matchedDream = await storage.getDreamById(match.dreamId);
          
          if (!matchedDream) {
            console.log(`[Match] Matched dream ${match.dreamId} not found, skipping`);
            continue;
          }
          
          // Don't match dreams from the same user
          if (matchedDream.authorId === dream.authorId) {
            console.log(`[Match] Skipping match with same author: ${matchedDream.authorId}`);
            continue;
          }
          
          // Calculate content similarity for better matching
          let contentScore = 0;
          try {
            const { calculateSimilarity } = await import('./nlp');
            contentScore = calculateSimilarity(dream.content, matchedDream.content);
            console.log(`[Match] Content similarity between dreams ${dreamId} and ${match.dreamId}: ${contentScore}`);
          } catch (err) {
            console.error(`[Match] Error calculating content similarity:`, err);
          }
          
          // Final score is weighted average of tag-based and content-based similarity
          const finalScore = (tagScore * 0.6) + (contentScore * 0.4);
          console.log(`[Match] Final score: tag=${tagScore}, content=${contentScore}, final=${finalScore}`);
          
          // Only create matches with significant similarity
          if (finalScore < 60) {
            console.log(`[Match] Score too low (${finalScore}), skipping match`);
            continue;
          }
          
          // Create match record
          await storage.db.insert(dreamMatches).values({
            dreamId,
            matchedDreamId: match.dreamId,
            score: finalScore,
            createdAt: new Date()
          }).onConflictDoNothing();
          
          // Create the reverse match too
          await storage.db.insert(dreamMatches).values({
            dreamId: match.dreamId,
            matchedDreamId: dreamId,
            score: match.score,
            createdAt: new Date()
          }).onConflictDoNothing();
        }
      }
    } catch (error) {
      console.error("Error finding dream matches:", error);
    }
  }

  // New matches (for notification)
  app.get("/api/matches/new", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to view new matches" });
      }
      
      const userId = req.user.id;
      
      // Get recent matches (last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const matchesResult = await storage.db
        .select({
          id: dreamMatches.id,
          dreamId: dreamMatches.dreamId,
          matchedDreamId: dreamMatches.matchedDreamId,
          score: dreamMatches.score,
          createdAt: dreamMatches.createdAt
        })
        .from(dreamMatches)
        .innerJoin(dreams, eq(dreamMatches.dreamId, dreams.id))
        .where(and(
          eq(dreams.authorId, userId),
          sql`${dreamMatches.createdAt} > ${yesterday}`
        ));
      
      // Get match details
      const newMatches = await Promise.all(matchesResult.map(async (match) => {
        const matchedDream = await storage.getDreamById(match.matchedDreamId);
        const matchedUser = await storage.getUser(matchedDream.authorId);
        
        // Get common tags
        const dreamTags1 = await storage.db
          .select()
          .from(dreamTags)
          .where(eq(dreamTags.dreamId, match.dreamId));
        
        const dreamTags2 = await storage.db
          .select()
          .from(dreamTags)
          .where(eq(dreamTags.dreamId, match.matchedDreamId));
        
        const tags1 = new Set(dreamTags1.map(t => t.tag));
        const commonTags = dreamTags2
          .map(t => t.tag)
          .filter(tag => tags1.has(tag));
        
        return {
          id: match.id,
          userId: matchedUser.id,
          username: matchedUser.username,
          dreamId: matchedDream.id,
          dreamTitle: matchedDream.title,
          matchPercentage: match.score,
          tag: commonTags.length > 0 ? commonTags[0] : 'dreams'
        };
      }));
      
      res.json(newMatches);
    } catch (error) {
      next(error);
    }
  });

  return httpServer;
}
