/**
 * Cleanup Engine Contract
 * Defines the interface for the cleanup service
 */
import { CleanupAction, CleanupExecution, ProgressUpdate, CodeAsset } from '../../src/models/types.js';
export interface CleanupEngineContract {
    /**
     * Plans cleanup actions for unused assets
     */
    planCleanup(assets: CodeAsset[]): Promise<CleanupAction[]>;
    /**
     * Executes cleanup actions
     */
    executeCleanup(actions: CleanupAction[], progressCallback?: (update: ProgressUpdate) => void): Promise<CleanupExecution>;
    /**
     * Creates backup before cleanup
     */
    createBackup(filePaths: string[]): Promise<string>;
    /**
     * Rolls back cleanup actions
     */
    rollback(executionId: string): Promise<boolean>;
}
export interface CleanupOptions {
    dryRun: boolean;
    createBackup: boolean;
    interactive: boolean;
    force: boolean;
}
export interface CleanupStats {
    filesDeleted: number;
    spaceSaved: number;
    backupCreated: boolean;
    errors: string[];
}
//# sourceMappingURL=cleanup-engine.contract.d.ts.map