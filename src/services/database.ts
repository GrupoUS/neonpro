
import { supabase } from '../lib/supabase';

export const databaseService = {
  // Generic function to fetch all records from a table
  getAll: async (tableName: string) => {
    const { data, error } = await supabase.from(tableName).select('*');
    if (error) throw error;
    return data;
  },

  // Generic function to fetch a single record by ID
  getById: async (tableName: string, id: string) => {
    const { data, error } = await supabase.from(tableName).select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  // Generic function to insert a new record
  insert: async (tableName: string, record: any) => {
    const { data, error } = await supabase.from(tableName).insert(record).select();
    if (error) throw error;
    return data?.[0];
  },

  // Generic function to update an existing record
  update: async (tableName: string, id: string, updates: any) => {
    const { data, error } = await supabase.from(tableName).update(updates).eq('id', id).select();
    if (error) throw error;
    return data?.[0];
  },

  // Generic function to delete a record
  delete: async (tableName: string, id: string) => {
    const { error } = await supabase.from(tableName).delete().eq('id', id);
    if (error) throw error;
    return true;
  },
};
