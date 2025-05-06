import { db } from "./index";
import * as schema from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { generateTags } from "../server/nlp";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seed() {
  try {
    console.log("Starting seed process...");

    // Create test users if they don't exist
    const testUsers = [
      { username: "DreamWalker", password: "password123" },
      { username: "NightWanderer", password: "password123" },
      { username: "LucidDreamer", password: "password123" },
      { username: "SleepWalker", password: "password123" },
      { username: "DreamSeeker", password: "password123" },
      { username: "CloudSurfer", password: "password123" }
    ];

    for (const userData of testUsers) {
      const existingUser = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.username, userData.username)
      });

      if (!existingUser) {
        const hashedPassword = await hashPassword(userData.password);
        await db.insert(schema.users).values({
          username: userData.username,
          password: hashedPassword
        });

        console.log(`Created user: ${userData.username}`);
      } else {
        console.log(`User ${userData.username} already exists`);
      }
    }

    // Get users for reference
    const users = await db.select().from(schema.users);
    const userMap = new Map(users.map(user => [user.username, user]));

    // Create dreams if they don't exist
    const dreams = [
      {
        title: "Flying Over Crystal Mountains",
        content: "Last night I dreamed I was soaring over mountains made of crystal. The light refracted through them creating rainbows everywhere. I could control my flight with just my thoughts, diving between crystal peaks and valleys.",
        language: "en",
        visibility: "public",
        authorName: "NightWanderer",
        imageUrl: "https://images.unsplash.com/photo-1611605645802-c21be743c321?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300"
      },
      {
        title: "Lost in an Ancient Library",
        content: "Mi sono perso in una biblioteca antica dove i libri volavano da soli. Ogni volta che aprivo un libro, le parole si trasformavano in creature viventi che mi raccontavano storie. Ho cercato per ore l'uscita, ma ogni porta mi portava a nuove sale piene di libri misteriosi.",
        language: "it",
        visibility: "public",
        authorName: "DreamSeeker"
      },
      {
        title: "Underwater City",
        content: "I discovered a city beneath the ocean where people had gills and buildings were made of coral. They welcomed me as if I'd always been one of them. The most strange part was that I could breathe underwater too.",
        language: "en",
        visibility: "public",
        authorName: "LucidDreamer",
        imageUrl: "https://pixabay.com/get/g6979fe3b7643e5db844f3f22af1672ce01a5159e44c3121c7b9fa4dc86ff6c4eea28d6e3fbecb020f4e00e883f72ba9aa12f65b4a4f529fa75aa6282ce43ee96_1280.jpg"
      },
      {
        title: "Time Loop in Tokyo",
        content: "Each night this week, I've been dreaming of the same Tokyo street. The same events unfold, but I can make small changes that affect the outcome. I'm trying to prevent something, but I'm not sure what.",
        language: "en",
        visibility: "public",
        authorName: "SleepWalker"
      },
      {
        title: "Flying with Birds",
        content: "I dreamt I was flying alongside a flock of colorful birds. We soared high above forests and lakes, and I could feel the wind against my face. The sense of freedom was incredible.",
        language: "en",
        visibility: "public",
        authorName: "CloudSurfer"
      },
      {
        title: "Desert Oasis",
        content: "I was lost in a vast desert, the sun scorching my skin. Just when I thought I couldn't go on, I discovered a hidden oasis with palm trees and a crystal-clear pool. As I drank from the water, I could feel myself becoming one with the desert.",
        language: "en",
        visibility: "public",
        authorName: "DreamWalker"
      }
    ];

    for (const dreamData of dreams) {
      const author = userMap.get(dreamData.authorName);
      if (!author) {
        console.log(`Author ${dreamData.authorName} not found, skipping dream`);
        continue;
      }

      // Check if dream already exists
      const existingDreams = await db.query.dreams.findMany({
        where: (dreams, { eq, and }) => 
          and(
            eq(dreams.title, dreamData.title),
            eq(dreams.authorId, author.id)
          )
      });

      if (existingDreams.length === 0) {
        // Create dream
        const [newDream] = await db.insert(schema.dreams).values({
          title: dreamData.title,
          content: dreamData.content,
          language: dreamData.language,
          visibility: dreamData.visibility,
          authorId: author.id,
          imageUrl: dreamData.imageUrl || null,
          createdAt: new Date()
        }).returning();

        console.log(`Created dream: ${dreamData.title}`);

        // Generate tags
        const tags = await generateTags(dreamData.content, dreamData.language);
        
        // Add tags
        for (const tag of tags) {
          await db.insert(schema.dreamTags).values({
            dreamId: newDream.id,
            tag
          });
        }

        console.log(`Added tags for dream: ${dreamData.title}`, tags);
      } else {
        console.log(`Dream "${dreamData.title}" by ${dreamData.authorName} already exists`);
      }
    }

    // Create likes for dreams
    const allDreams = await db.select().from(schema.dreams);
    
    for (const dream of allDreams) {
      // For each dream, some users will like it (except the author)
      for (const user of users) {
        if (user.id !== dream.authorId && Math.random() > 0.5) {
          const existingLike = await db.query.dreamLikes.findFirst({
            where: (likes, { eq, and }) => 
              and(
                eq(likes.dreamId, dream.id),
                eq(likes.userId, user.id)
              )
          });

          if (!existingLike) {
            await db.insert(schema.dreamLikes).values({
              dreamId: dream.id,
              userId: user.id,
              createdAt: new Date()
            });

            console.log(`Created like: User ${user.username} liked dream "${dream.title}"`);
          }
        }
      }
    }

    // Create some comments
    const comments = [
      {
        dreamTitle: "Flying Over Crystal Mountains",
        commenterName: "LucidDreamer",
        content: "That sounds amazing! I've had similar flying dreams but never with crystal mountains."
      },
      {
        dreamTitle: "Flying Over Crystal Mountains",
        commenterName: "SleepWalker",
        content: "I wonder what the crystals symbolize in your subconscious."
      },
      {
        dreamTitle: "Lost in an Ancient Library",
        commenterName: "NightWanderer",
        content: "Libraries in dreams often represent knowledge or memories. Very interesting!"
      },
      {
        dreamTitle: "Underwater City",
        commenterName: "DreamWalker",
        content: "I've had underwater breathing dreams too! They're so freeing."
      },
      {
        dreamTitle: "Time Loop in Tokyo",
        commenterName: "DreamSeeker",
        content: "Recurring dreams can be your mind trying to solve a problem. Have you been stressed lately?"
      },
      {
        dreamTitle: "Flying with Birds",
        commenterName: "NightWanderer",
        content: "Flying dreams are the best! I always wake up feeling energized after them."
      }
    ];

    for (const commentData of comments) {
      const commenter = userMap.get(commentData.commenterName);
      const dream = allDreams.find(d => d.title === commentData.dreamTitle);

      if (!commenter || !dream) {
        console.log("Commenter or dream not found, skipping comment");
        continue;
      }

      const existingComment = await db.query.dreamComments.findFirst({
        where: (comments, { eq, and }) => 
          and(
            eq(comments.dreamId, dream.id),
            eq(comments.userId, commenter.id),
            eq(comments.content, commentData.content)
          )
      });

      if (!existingComment) {
        await db.insert(schema.dreamComments).values({
          dreamId: dream.id,
          userId: commenter.id,
          content: commentData.content,
          createdAt: new Date()
        });

        console.log(`Created comment by ${commentData.commenterName} on "${commentData.dreamTitle}"`);
      }
    }

    // Create dream matches
    const allTags = await db.select().from(schema.dreamTags);
    
    // Group tags by dream
    const dreamTagsMap = new Map<number, string[]>();
    for (const tagRecord of allTags) {
      if (!dreamTagsMap.has(tagRecord.dreamId)) {
        dreamTagsMap.set(tagRecord.dreamId, []);
      }
      dreamTagsMap.get(tagRecord.dreamId)!.push(tagRecord.tag);
    }

    // Find matches based on common tags
    for (let i = 0; i < allDreams.length; i++) {
      for (let j = i + 1; j < allDreams.length; j++) {
        const dream1 = allDreams[i];
        const dream2 = allDreams[j];

        // Don't match dreams by the same author
        if (dream1.authorId === dream2.authorId) {
          continue;
        }

        const tags1 = dreamTagsMap.get(dream1.id) || [];
        const tags2 = dreamTagsMap.get(dream2.id) || [];

        if (tags1.length === 0 || tags2.length === 0) {
          continue;
        }

        // Count common tags
        const commonTags = tags1.filter(tag => tags2.includes(tag));
        if (commonTags.length > 0) {
          // Calculate match score (percentage of common tags)
          const score = Math.round((commonTags.length / Math.max(tags1.length, tags2.length)) * 100);
          
          if (score >= 60) { // Only create matches with good scores
            const existingMatch = await db.query.dreamMatches.findFirst({
              where: (matches, { eq, and }) => 
                and(
                  eq(matches.dreamId, dream1.id),
                  eq(matches.matchedDreamId, dream2.id)
                )
            });

            if (!existingMatch) {
              await db.insert(schema.dreamMatches).values({
                dreamId: dream1.id,
                matchedDreamId: dream2.id,
                score,
                createdAt: new Date()
              });

              console.log(`Created match between dreams "${dream1.title}" and "${dream2.title}" with score ${score}%`);

              // Create the reverse match too
              await db.insert(schema.dreamMatches).values({
                dreamId: dream2.id,
                matchedDreamId: dream1.id,
                score,
                createdAt: new Date()
              });
            }
          }
        }
      }
    }

    // Create some chat messages for matches
    const matches = await db.select().from(schema.dreamMatches);
    
    // Pick a few random matches to add messages to
    const matchesForChats = matches.filter((_, index) => index % 4 === 0);

    for (const match of matchesForChats) {
      const dream1 = allDreams.find(d => d.id === match.dreamId);
      const dream2 = allDreams.find(d => d.id === match.matchedDreamId);

      if (!dream1 || !dream2) {
        continue;
      }

      const user1 = users.find(u => u.id === dream1.authorId);
      const user2 = users.find(u => u.id === dream2.authorId);

      if (!user1 || !user2) {
        continue;
      }

      const existingMessages = await db.query.chatMessages.findMany({
        where: (messages, { eq }) => eq(messages.matchId, match.id)
      });

      if (existingMessages.length === 0) {
        // Create a conversation
        const messages = [
          {
            sender: user1,
            content: `Hi, I saw we both had dreams about ${Math.random() > 0.5 ? 'flying' : 'water'}. That's cool!`
          },
          {
            sender: user2,
            content: "Yeah, that's interesting! I've been having these kinds of dreams for a while now."
          },
          {
            sender: user1,
            content: "Same here. Do you think dreams have hidden meanings?"
          },
          {
            sender: user2,
            content: "I believe they might reflect our subconscious thoughts and feelings."
          }
        ];

        let messageDate = new Date();
        messageDate.setHours(messageDate.getHours() - messages.length);

        for (const messageData of messages) {
          await db.insert(schema.chatMessages).values({
            matchId: match.id,
            senderId: messageData.sender.id,
            content: messageData.content,
            createdAt: new Date(messageDate)
          });

          messageDate = new Date(messageDate.getTime() + 15 * 60000); // Add 15 minutes for each message
        }

        console.log(`Created chat between ${user1.username} and ${user2.username}`);
      }
    }

    console.log("Seed process completed successfully");
  } catch (error) {
    console.error("Error in seed process:", error);
  }
}

seed();
