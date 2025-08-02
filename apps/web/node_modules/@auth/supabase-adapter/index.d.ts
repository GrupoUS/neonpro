import { type Adapter } from "@auth/core/adapters";
export declare function format<T>(obj: Record<string, any>): T;
/**
 * This is the interface of the Supabase adapter options.
 **/
export interface SupabaseAdapterOptions {
    /**
     * The URL of your Supabase database
     **/
    url: string;
    /**
     * The secret to grant access to the database
     **/
    secret: string;
}
export declare function SupabaseAdapter(options: SupabaseAdapterOptions): Adapter;
//# sourceMappingURL=index.d.ts.map