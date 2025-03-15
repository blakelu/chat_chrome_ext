import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface ChatMessage {
  id: number;
  role: string;
  content: any;
  timestamp: number;
  sessionId: string;
}

interface MessagesDB extends DBSchema {
  messages: {
    key: number;
    value: ChatMessage;
    indexes: {
      'by-session': string;
      'by-timestamp': number;
    };
  };
}

interface SessionInfo {
  id: string;
  title: string;
  lastUpdated: number;
  messageCount: number;
}

class OfflineStorage {
  private db: Promise<IDBPDatabase<MessagesDB>>;
  private static instance: OfflineStorage;

  private constructor() {
    this.db = openDB<MessagesDB>('chat-messages-store', 1, {
      upgrade(db) {
        const messagesStore = db.createObjectStore('messages', {
          keyPath: 'id',
          autoIncrement: true,
        });
        
        messagesStore.createIndex('by-session', 'sessionId');
        messagesStore.createIndex('by-timestamp', 'timestamp');
      },
    });
  }

  public static getInstance(): OfflineStorage {
    if (!OfflineStorage.instance) {
      OfflineStorage.instance = new OfflineStorage();
    }
    return OfflineStorage.instance;
  }

  // Save a message to IndexedDB
  async saveMessage(message: Omit<ChatMessage, 'id'>): Promise<number> {
    const db = await this.db;
    return db.add('messages', message as ChatMessage);
  }

  // Update an existing message
  async updateMessage(message: ChatMessage): Promise<void> {
    const db = await this.db;
    await db.put('messages', message);
  }

  // Get all messages for a session
  async getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
    const db = await this.db;
    return db.getAllFromIndex('messages', 'by-session', sessionId);
  }

  // Delete messages for a session
  async deleteSessionMessages(sessionId: string): Promise<void> {
    const db = await this.db;
    const tx = db.transaction('messages', 'readwrite');
    const messagesStore = tx.objectStore('messages');
    const sessionMessages = await messagesStore.index('by-session').getAll(sessionId);
    
    // Delete each message in the session
    await Promise.all(sessionMessages.map(message => messagesStore.delete(message.id)));
    
    await tx.done;
  }

  // Get session info (for listing sessions)
  async getSessions(): Promise<SessionInfo[]> {
    const db = await this.db;
    const messages = await db.getAll('messages');
    
    // Group messages by sessionId
    const sessions = new Map<string, {
      lastMessage?: ChatMessage,
      messageCount: number
    }>();
    
    for (const message of messages) {
      const session = sessions.get(message.sessionId);
      
      if (!session) {
        sessions.set(message.sessionId, {
          lastMessage: message,
          messageCount: 1
        });
        continue;
      }
      
      session.messageCount++;
      
      if (!session.lastMessage || message.timestamp > session.lastMessage.timestamp) {
        session.lastMessage = message;
      }
    }
    
    // Convert to array and format
    return Array.from(sessions.entries()).map(([id, info]) => {
      const title = info.lastMessage?.content?.slice?.(0, 50) ?? '未命名会话';
      return {
        id,
        title,
        lastUpdated: info.lastMessage?.timestamp ?? Date.now(),
        messageCount: info.messageCount
      };
    });
  }
  
  // Clear all data
  async clearAll(): Promise<void> {
    const db = await this.db;
    const tx = db.transaction('messages', 'readwrite');
    await tx.objectStore('messages').clear();
    await tx.done;
  }
}

export default OfflineStorage.getInstance();
