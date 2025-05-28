
import { getDatabase, ref, remove, onValue, query, orderByChild } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";
import { app } from './firebase.js';

const realtimeDb = getDatabase(app);

// Forum management functions
export const forumFunctions = {
  // Get all forum posts
  getAllForumPosts: (callback) => {
    const foroRef = ref(realtimeDb, 'foro');
    const foroQuery = query(foroRef, orderByChild('timestamp'));
    
    return onValue(foroQuery, (snapshot) => {
      const posts = [];
      snapshot.forEach((childSnapshot) => {
        posts.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      
      // Sort by timestamp (newest first)
      posts.sort((a, b) => b.timestamp - a.timestamp);
      callback(posts);
    });
  },

  // Delete forum post
  deleteForumPost: async (postId) => {
    try {
      const postRef = ref(realtimeDb, `foro/${postId}`);
      await remove(postRef);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Search forum posts
  searchForumPosts: (allPosts, searchQuery) => {
    if (!searchQuery.trim()) {
      return [];
    }

    return allPosts.filter(post => 
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
};
