import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';

type Tables = Database['public']['Tables'];

export const databaseService = {
  // Generic function to fetch all records from a table
  getAll: async <T extends keyof Tables>(tableName: T) => {
    const { data, error } = await supabase.from(tableName).select('*');
    if (error) throw error;
    return data as Tables[T]['Row'][];
  },

  // Generic function to fetch a single record by ID
  getById: async <T extends keyof Tables>(tableName: T, id: Tables[T]['Row']['id']) => {
    const { data, error } = await supabase.from(tableName).select('*').eq('id', id).single();
    if (error) throw error;
    return data as Tables[T]['Row'];
  },

  // Generic function to insert a new record
  insert: async <T extends keyof Tables>(tableName: T, record: Tables[T]['Insert']) => {
    const { data, error } = await supabase.from(tableName).insert(record).select();
    if (error) throw error;
    return data[0] as Tables[T]['Row'];
  },

  // Generic function to update an existing record
  update: async <T extends keyof Tables>(tableName: T, id: Tables[T]['Row']['id'], updates: Tables[T]['Update']) => {
    const { data, error } = await supabase.from(tableName).update(updates).eq('id', id).select();
    if (error) throw error;
    return data[0] as Tables[T]['Row'];
  },

  // Generic function to delete a record
  delete: async <T extends keyof Tables>(tableName: T, id: Tables[T]['Row']['id']) => {
    const { error } = await supabase.from(tableName).delete().eq('id', id);
    if (error) throw error;
    return true;
  },
};
