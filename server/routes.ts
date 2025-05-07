import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { setupWebSockets } from "./socket";
import { generateTags } from "./nlp";
import { translateText } from "./translation";
import { eq, ne, and, like, desc, sql } from "drizzle-orm";
import { dreams, dreamTags, dreamLikes, dreamComments, dreamMatches, chatMessages, users } from "@shared/schema";
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
      
      // Fetch author information for all dreams
      const authorIds = [...dreamMap.values()].map(dream => dream.authorId);
      if (authorIds.length > 0) {
        // Utilizziamo un approccio diverso senza parametrizzazione IN
        const authorsQuery = await storage.db
          .select({ id: users.id, username: users.username })
          .from(users);
        
        const authors = authorsQuery.filter(author => authorIds.includes(author.id));
        
        const authorsMap = new Map(authors.map(author => [author.id, author]));
        
        for (const dream of dreamMap.values()) {
          const author = authorsMap.get(dream.authorId);
          if (author) {
            dream.author = {
              id: author.id,
              username: author.username
            };
          }
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
      
      // Get tags
      const tagsResult = await storage.db
        .select()
        .from(dreamTags)
        .where(eq(dreamTags.dreamId, dreamId));
      
      const tags = tagsResult.map(t => t.tag);
      
      // Get author info
      const authorResult = await storage.db
        .select({ id: users.id, username: users.username })
        .from(users)
        .where(eq(users.id, dream.authorId))
        .limit(1);
      
      const author = authorResult.length > 0 ? {
        id: authorResult[0].id,
        username: authorResult[0].username
      } : null;
      
      // Get comments
      const commentsResult = await storage.db
        .select({
          comment: dreamComments,
          user: { id: users.id, username: users.username }
        })
        .from(dreamComments)
        .innerJoin(users, eq(dreamComments.userId, users.id))
        .where(eq(dreamComments.dreamId, dreamId))
        .orderBy(dreamComments.createdAt);
      
      const comments = commentsResult.map(row => ({
        ...row.comment,
        user: row.user
      }));
      
      // Get like count
      const likeCountResult = await storage.db
        .select({ count: sql<number>`count(*)` })
        .from(dreamLikes)
        .where(eq(dreamLikes.dreamId, dreamId));
      
      const likeCount = likeCountResult[0]?.count || 0;
      
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
        tags,
        author,
        comments,
        likeCount,
        commentCount: comments.length,
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

  app.delete("/api/dreams/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to delete dreams" });
      }
      
      const dreamId = parseInt(req.params.id);
      
      // Verify the dream exists and belongs to the user
      const dreamResult = await storage.db
        .select()
        .from(dreams)
        .where(eq(dreams.id, dreamId))
        .limit(1);
      
      if (dreamResult.length === 0) {
        return res.status(404).json({ message: "Dream not found" });
      }
      
      if (dreamResult[0].authorId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to delete this dream" });
      }
      
      // Delete related records first to avoid foreign key constraint issues
      // Delete comments
      await storage.db
        .delete(dreamComments)
        .where(eq(dreamComments.dreamId, dreamId));
      
      // Delete likes
      await storage.db
        .delete(dreamLikes)
        .where(eq(dreamLikes.dreamId, dreamId));
      
      // Delete tags
      await storage.db
        .delete(dreamTags)
        .where(eq(dreamTags.dreamId, dreamId));
      
      // Delete matches where this dream is part of
      await storage.db
        .delete(dreamMatches)
        .where(
          eq(dreamMatches.dreamId, dreamId)
        );
      
      await storage.db
        .delete(dreamMatches)
        .where(
          eq(dreamMatches.matchedDreamId, dreamId)
        );
      
      // Finally delete the dream itself
      await storage.db
        .delete(dreams)
        .where(eq(dreams.id, dreamId));
      
      res.json({ message: "Dream deleted successfully" });
    } catch (error) {
      console.error("Error deleting dream:", error);
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
        .leftJoin(dreamTags, eq(dreams.id, dreamTags.dreamId))
        .where(eq(dreams.authorId, userId));
      
      // If not the authenticated user, only show public dreams
      if (!req.isAuthenticated() || req.user.id !== userId) {
        query = query.where(eq(dreams.visibility, "public"));
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
            isLikedByUser: false,
            likeCount: 0,
            commentCount: 0
          });
        } else if (row.dream_tags) {
          dreamMap.get(dream.id).tags.push(row.dream_tags.tag);
        }
      }
      
      // Get author information
      if (dreamMap.size > 0) {
        const authorResult = await storage.db
          .select({ id: users.id, username: users.username })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);
          
        if (authorResult.length > 0) {
          for (const dream of dreamMap.values()) {
            dream.author = {
              id: authorResult[0].id,
              username: authorResult[0].username
            };
          }
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
        const currentUserId = req.user.id;
        const userLikes = await storage.db
          .select()
          .from(dreamLikes)
          .where(eq(dreamLikes.userId, currentUserId));
        
        for (const like of userLikes) {
          if (dreamMap.has(like.dreamId)) {
            dreamMap.get(like.dreamId).isLikedByUser = true;
          }
        }
      }
      
      const userDreams = Array.from(dreamMap.values());
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
      
      // Otteniamo i sogni dell'utente corrente
      const userDreamsResult = await storage.db
        .select()
        .from(dreams)
        .where(eq(dreams.authorId, userId));
      
      const userDreamIds = userDreamsResult.map(dream => dream.id);
      
      // Se l'utente non ha sogni, restituiamo un array vuoto
      if (userDreamIds.length === 0) {
        return res.json({ matches: [] });
      }
      
      // Ora otteniamo i match per i sogni dell'utente
      const userMatches = await storage.db
        .select()
        .from(dreamMatches)
        .where(
          userDreamIds.length === 1
            ? eq(dreamMatches.dreamId, userDreamIds[0])
            : sql`${dreamMatches.dreamId} IN (${sql.join(userDreamIds)})`
        );
      
      // Get user info and dream info for each match
      const matches = await Promise.all(userMatches.map(async (match) => {
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
      // Get the dream
      const dream = await storage.getDreamById(dreamId);
      if (!dream) {
        console.log(`[Match] Dream ${dreamId} not found`);
        return;
      }
      
      // Get the dream's tags from storage - manually for 100% reliability
      const allTags = await storage.db.select().from(dreamTags);
      const dreamTags1 = allTags.filter(tag => tag.dreamId === dreamId);
      
      const tags = dreamTags1.map(t => t.tag);
      if (tags.length === 0) {
        console.log(`[Match] Dream ${dreamId} has no tags, skipping match finding`);
        return;
      }
      
      console.log(`[Match] Processing dream ${dreamId} with tags: ${tags.join(', ')}`);
      
      // Trovo tutti i sogni e i loro tag per un confronto manuale
      const allDreams = await storage.db.select().from(dreams);
      
      // Trova potenziali match (sogni di altri utenti)
      const potentialMatches = [];
      
      for (const otherDream of allDreams) {
        // Non confrontare con se stesso o con sogni dello stesso utente
        if (otherDream.id === dreamId || otherDream.authorId === dream.authorId) {
          continue;
        }
        
        // Trova i tag di questo sogno
        const otherDreamTags = allTags
          .filter(tag => tag.dreamId === otherDream.id)
          .map(t => t.tag);
        
        if (otherDreamTags.length === 0) continue;
        
        // Conta quanti tag corrispondono
        const matchingTags = tags.filter(tag => otherDreamTags.includes(tag));
        const matchCount = matchingTags.length;
        
        // Applica soglia minima (almeno 30% dei tag devono corrispondere)
        if (matchCount >= Math.ceil(tags.length * 0.3)) {
          // Calcola il punteggio per i tag
          const tagScore = (matchCount * 100.0) / tags.length;
          
          if (tagScore >= 50) {
            // Calcola la similitudine di contenuto
            let contentScore = 0;
            try {
              const { calculateSimilarity } = await import('./nlp');
              contentScore = calculateSimilarity(dream.content, otherDream.content);
              console.log(`[Match] Content similarity between dreams ${dreamId} and ${otherDream.id}: ${contentScore}`);
            } catch (err) {
              console.error(`[Match] Error calculating content similarity:`, err);
            }
            
            // Punteggio finale: media pesata di tag (60%) e contenuto (40%)
            const finalScore = (tagScore * 0.6) + (contentScore * 0.4);
            console.log(`[Match] Final score: tag=${tagScore}, content=${contentScore}, final=${finalScore}`);
            
            // Crea match solo con similarità significativa
            if (finalScore >= 60) {
              potentialMatches.push({
                dreamId: otherDream.id,
                score: finalScore,
                matchingTags: matchingTags
              });
            } else {
              console.log(`[Match] Score too low (${finalScore}), skipping match`);
            }
          }
        }
      }
      
      console.log(`[Match] Found ${potentialMatches.length} valid matches for dream ${dreamId}`);
      
      // Salva i match nel database
      for (const match of potentialMatches) {
        // Crea record di match
        try {
          // Assicura che lo score sia un intero
          // Converte il numero a stringa, poi a numero intero e infine verifica che sia un valore valido
          let intScore = parseInt(String(Math.round(match.score)));
          if (isNaN(intScore)) intScore = 0; // Fallback per evitare NaN
          
          // Limitiamo anche il punteggio all'intervallo 0-100
          intScore = Math.max(0, Math.min(100, intScore));
          
          await storage.db.insert(dreamMatches).values({
            dreamId,
            matchedDreamId: match.dreamId,
            score: intScore,
            createdAt: new Date()
          }).onConflictDoNothing();
          
          // Crea anche il match inverso
          await storage.db.insert(dreamMatches).values({
            dreamId: match.dreamId,
            matchedDreamId: dreamId, 
            score: intScore,
            createdAt: new Date()
          }).onConflictDoNothing();
          
          console.log(`[Match] Created match between dreams ${dreamId} and ${match.dreamId} with score ${intScore}`);
        } catch (err) {
          console.error(`[Match] Error creating match record:`, err);
        }
      }
    } catch (error) {
      console.error("Error finding dream matches:", error);
    }
  }

  // Endpoint per ricalcolare tutti i match (solo per sviluppo/test)
  app.post("/api/admin/recalculate-matches", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      // Otteniamo tutti i sogni
      const allDreams = await storage.db.select().from(dreams);
      
      // Eliminiamo tutti i match esistenti
      await storage.db.delete(dreamMatches);
      
      console.log(`[Match Admin] Deleted all existing matches`);
      console.log(`[Match Admin] Processing ${allDreams.length} dreams for matches`);
      
      // Elaboriamo ogni sogno per trovare match
      for (const dream of allDreams) {
        await findDreamMatches(dream.id);
      }
      
      const matchCount = await storage.db.select({ count: sql`count(*)` }).from(dreamMatches);
      
      res.json({ 
        success: true, 
        message: `Processed ${allDreams.length} dreams and created ${matchCount[0].count} matches` 
      });
    } catch (error) {
      next(error);
    }
  });
  
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
      const matchPromises = matchesResult.map(async (match) => {
        try {
          // Gestione degli errori e valori nulli
          const matchedDream = await storage.getDreamById(match.matchedDreamId);
          if (!matchedDream) {
            console.log(`[Match Notification] Matched dream ${match.matchedDreamId} not found, skipping`);
            return null;
          }
          
          const matchedUser = await storage.getUser(matchedDream.authorId);
          if (!matchedUser) {
            console.log(`[Match Notification] User ${matchedDream.authorId} not found, skipping`);
            return null;
          }
          
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
          
          // Assicuriamoci che matchPercentage sia un numero intero valido
          let matchPercentage = typeof match.score === 'number' ? match.score : 0;
          
          return {
            id: match.id,
            userId: matchedUser.id,
            username: matchedUser.username,
            dreamId: matchedDream.id,
            dreamTitle: matchedDream.title,
            matchPercentage: matchPercentage,
            tag: commonTags.length > 0 ? commonTags[0] : 'dreams'
          };
        } catch (error) {
          console.error(`[Match Notification] Error processing match ${match.id}:`, error);
          return null;
        }
      });
      
      const newMatchesWithNulls = await Promise.all(matchPromises);
      // Filtra null e undefined
      const newMatches = newMatchesWithNulls.filter(Boolean);
      
      res.json(newMatches);
    } catch (error) {
      next(error);
    }
  });

  return httpServer;
}
