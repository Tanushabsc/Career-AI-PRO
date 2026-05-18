/**
 * PuterService: The bridge between CareerAI Pro and Puter.js distributed intelligence.
 * Handles AI, Auth, and Cloud Storage.
 */

const puter = window.puter;

export const puterService = {
    // Authentication
    isSignedIn: () => puter.auth.isSignedIn(),
    signIn: () => puter.auth.signIn(),
    signOut: () => puter.auth.signOut(),
    getUser: () => puter.auth.getUser(),

    // AI Capabilities
    chat: async (message, context = "") => {
        try {
            const response = await puter.ai.chat(
                `Context: ${context}\n\nUser Question: ${message}`,
                { model: 'claude-3-5-sonnet' } // Puter supports various models
            );
            console.log("Puter AI Response:", response);
            
            if (!response) return "No response from neural core.";
            if (typeof response === 'string') return response;
            
            if (response.message && response.message.content) {
                if (typeof response.message.content === 'string') return response.message.content;
                if (Array.isArray(response.message.content) && response.message.content[0]?.text) {
                    return response.message.content[0].text;
                }
            }
            if (response.text) return response.text;
            if (typeof response.toString === 'function' && response.toString() !== '[object Object]') {
                return response.toString();
            }
            
            return JSON.stringify(response); // Deep fallback to visualize the raw payload
        } catch (error) {
            console.error("Puter AI Error:", error);
            return "I apologize, but my neural link is currently fluctuating. Please try again in a moment.";
        }
    },

    // Cloud Storage (KV Store for Metadata)
    saveMetadata: async (key, value) => {
        return await puter.kv.set(key, JSON.stringify(value));
    },

    getMetadata: async (key) => {
        const val = await puter.kv.get(key);
        return val ? JSON.parse(val) : null;
    },

    // File System (Cloud Storage for Resumes)
    saveFile: async (path, content) => {
        return await puter.fs.write(path, content);
    },

    readFile: async (path) => {
        return await puter.fs.read(path);
    },

    listDir: async (path) => {
        return await puter.fs.list(path);
    }
};
