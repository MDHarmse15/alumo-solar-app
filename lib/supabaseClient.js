import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

const supabaseUrl = "https://ppukydptrmevsqtxlhfp.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwdWt5ZHB0cm1ldnNxdHhsaGZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4MzAyOTMsImV4cCI6MjA2MTQwNjI5M30.iw_YXVCZgU7SoA6wyXrdTEZNfazXl6a7KxLQ05LbOp4";

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        persistSession: true,
        detectSessionInUrl: false,
    },
    global: {
        headers: {
            "Cache-Control": "no-cache",
        },
    },
});

const QUEUE_STORAGE_KEY = "supabase_offline_queue";

const queueChange = async (operation, table, values, filter = null) => {
    const existingQueue = JSON.parse(await AsyncStorage.getItem(QUEUE_STORAGE_KEY)) || [];
    existingQueue.push({ operation, table, values, filter });
    await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(existingQueue));
};

const syncOfflineChanges = async () => {
    const isConnected = (await NetInfo.fetch()).isConnected;
    if (!isConnected) return;

    const existingQueue = JSON.parse(await AsyncStorage.getItem(QUEUE_STORAGE_KEY)) || [];
    if (existingQueue.length === 0) return;

    for (const change of existingQueue) {
        try {
            if (change.operation === "insert") {
                await supabase.from(change.table).insert(change.values);
            } else if (change.operation === "update") {
                await supabase.from(change.table).update(change.values).match(change.filter);
            } else if (change.operation === "delete") {
                await supabase.from(change.table).delete().match(change.filter);
            }
        } catch (error) {
            console.error("Failed to sync change:", change, error);
        }
    }

    // Clear queue after successful sync
    await AsyncStorage.removeItem(QUEUE_STORAGE_KEY);
};

// Listen for network changes and trigger sync when online
NetInfo.addEventListener((state) => {
    if (state.isConnected) {
        syncOfflineChanges();
    }
});

const cachedSupabaseClient = {
    auth: supabase.auth,
    storage: supabase.storage,

    from: (table) => supabase.from(table), // Ensure the query object supports .eq() and other filters
};

export default cachedSupabaseClient;