// NeonPro - Offline Status Indicator Component
// VIBECODE V1.0 - Healthcare PWA Excellence Standards
// Purpose: Visual indicators for network status and sync queue
'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfflineStatus = OfflineStatus;
exports.SyncQueueDetails = SyncQueueDetails;
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var useNetworkStatus_1 = require("@/hooks/useNetworkStatus");
var utils_1 = require("@/lib/utils");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
function OfflineStatus(_a) {
    var className = _a.className, _b = _a.variant, variant = _b === void 0 ? 'badge' : _b, _c = _a.showSyncQueue, showSyncQueue = _c === void 0 ? true : _c;
    var _d = (0, useNetworkStatus_1.useNetworkStatus)(), isOnline = _d.isOnline, isOffline = _d.isOffline, syncQueueCount = _d.syncQueueCount, isSyncing = _d.isSyncing, processSyncQueue = _d.processSyncQueue, clearSyncQueue = _d.clearSyncQueue;
    var _e = (0, react_1.useState)(false), showToast = _e[0], setShowToast = _e[1];
    var _f = (0, react_1.useState)(true), lastStatus = _f[0], setLastStatus = _f[1];
    // Show toast when status changes
    (0, react_1.useEffect)(function () {
        if (lastStatus !== isOnline) {
            setShowToast(true);
            setLastStatus(isOnline);
            // Auto hide toast after 5 seconds
            var timer_1 = setTimeout(function () { return setShowToast(false); }, 5000);
            return function () { return clearTimeout(timer_1); };
        }
    }, [isOnline, lastStatus]);
    // Minimal variant - small icon only
    if (variant === 'minimal') {
        return (<div className={(0, utils_1.cn)('flex items-center gap-1', className)}>
        {isOnline ? (<lucide_react_1.Wifi className="w-4 h-4 text-green-600"/>) : (<lucide_react_1.WifiOff className="w-4 h-4 text-red-600"/>)}
        {syncQueueCount > 0 && (<badge_1.Badge variant="secondary" className="text-xs">
            {syncQueueCount}
          </badge_1.Badge>)}
      </div>);
    }
    // Badge variant - compact status
    if (variant === 'badge') {
        return (<div className={(0, utils_1.cn)('flex items-center gap-2', className)}>
        <badge_1.Badge variant={isOnline ? 'default' : 'destructive'} className="flex items-center gap-1">
          {isOnline ? (<>
              <lucide_react_1.Wifi className="w-3 h-3"/>
              Online
            </>) : (<>
              <lucide_react_1.WifiOff className="w-3 h-3"/>
              Offline
            </>)}
        </badge_1.Badge>
        
        {showSyncQueue && syncQueueCount > 0 && (<badge_1.Badge variant="outline" className="flex items-center gap-1">
            {isSyncing ? (<>
                <lucide_react_1.Loader2 className="w-3 h-3 animate-spin"/>
                Sincronizando
              </>) : (<>
                <lucide_react_1.Cloud className="w-3 h-3"/>
                {syncQueueCount} pendentes
              </>)}
          </badge_1.Badge>)}
      </div>);
    }
    // Banner variant - full width notification
    if (variant === 'banner') {
        if (isOnline && syncQueueCount === 0)
            return null;
        return (<div className={(0, utils_1.cn)('w-full p-3 border-b flex items-center justify-between', isOffline ? 'bg-destructive/10 border-destructive/20' : 'bg-blue-50 border-blue-200', className)}>
        <div className="flex items-center gap-3">
          {isOffline ? (<lucide_react_1.WifiOff className="w-4 h-4 text-destructive"/>) : (<lucide_react_1.Cloud className="w-4 h-4 text-blue-600"/>)}
          
          <div>
            {isOffline ? (<>
                <p className="font-medium text-destructive">Você está offline</p>
                <p className="text-sm text-destructive/80">
                  Suas ações serão sincronizadas quando a conexão for restaurada
                </p>
              </>) : syncQueueCount > 0 ? (<>
                <p className="font-medium text-blue-900">Sincronizando dados</p>
                <p className="text-sm text-blue-700">
                  {isSyncing ? 'Enviando...' : "".concat(syncQueueCount, " a\u00E7\u00F5es pendentes")}
                </p>
              </>) : null}
          </div>
        </div>

        {syncQueueCount > 0 && (<div className="flex items-center gap-2">
            {!isSyncing && isOnline && (<button_1.Button size="sm" variant="outline" onClick={function () { return processSyncQueue(); }} className="text-xs">
                Sincronizar agora
              </button_1.Button>)}
            
            <button_1.Button size="sm" variant="ghost" onClick={function () { return clearSyncQueue(); }} className="text-xs text-muted-foreground hover:text-destructive">
              <lucide_react_1.X className="w-3 h-3"/>
            </button_1.Button>
          </div>)}
      </div>);
    }
    // Toast variant - floating notification
    if (variant === 'toast' && showToast) {
        return (<div className={(0, utils_1.cn)('fixed top-4 right-4 z-50 transition-all duration-300', showToast ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0', className)}>
        <card_1.Card className="w-80">
          <card_1.CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <card_1.CardTitle className="text-sm flex items-center gap-2">
                {isOnline ? (<>
                    <lucide_react_1.CheckCircle2 className="w-4 h-4 text-green-600"/>
                    Conexão restaurada
                  </>) : (<>
                    <lucide_react_1.AlertCircle className="w-4 h-4 text-red-600"/>
                    Conexão perdida
                  </>)}
              </card_1.CardTitle>
              
              <button_1.Button size="sm" variant="ghost" onClick={function () { return setShowToast(false); }} className="h-6 w-6 p-0">
                <lucide_react_1.X className="w-3 h-3"/>
              </button_1.Button>
            </div>
          </card_1.CardHeader>
          
          <card_1.CardContent className="pt-0">
            <card_1.CardDescription>
              {isOnline ? (syncQueueCount > 0 ? ("Sincronizando ".concat(syncQueueCount, " a\u00E7\u00F5es pendentes...")) : ('Todas as funcionalidades estão disponíveis.')) : ('Algumas funcionalidades podem estar limitadas.')}
            </card_1.CardDescription>
          </card_1.CardContent>
        </card_1.Card>
      </div>);
    }
    return null;
}
// Sync Queue Details Component
function SyncQueueDetails(_a) {
    var className = _a.className;
    var _b = (0, useNetworkStatus_1.useNetworkStatus)(), syncQueue = _b.syncQueue, isSyncing = _b.isSyncing, processSyncQueue = _b.processSyncQueue, clearSyncQueue = _b.clearSyncQueue;
    if (syncQueue.length === 0) {
        return (<div className={(0, utils_1.cn)('text-center p-4', className)}>
        <lucide_react_1.CloudOff className="w-8 h-8 text-muted-foreground mx-auto mb-2"/>
        <p className="text-sm text-muted-foreground">Nenhuma ação pendente</p>
      </div>);
    }
    return (<div className={(0, utils_1.cn)('space-y-2', className)}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium">Ações pendentes ({syncQueue.length})</h4>
        
        <div className="flex gap-2">
          <button_1.Button size="sm" variant="outline" onClick={function () { return processSyncQueue(); }} disabled={isSyncing}>
            {isSyncing ? (<>
                <lucide_react_1.Loader2 className="w-3 h-3 mr-1 animate-spin"/>
                Sincronizando...
              </>) : ('Sincronizar')}
          </button_1.Button>
          
          <button_1.Button size="sm" variant="destructive" onClick={function () { return clearSyncQueue(); }} disabled={isSyncing}>
            Limpar
          </button_1.Button>
        </div>
      </div>

      {syncQueue.map(function (item, index) { return (<div key={item.id} className="flex items-center gap-3 p-2 border rounded-lg">
          <badge_1.Badge variant="outline" className="text-xs">
            {item.method}
          </badge_1.Badge>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {item.url}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(item.timestamp).toLocaleString('pt-BR')}
              {item.retryCount > 0 && " \u2022 ".concat(item.retryCount, " tentativas")}
            </p>
          </div>

          {item.retryCount > 0 && (<lucide_react_1.AlertCircle className="w-4 h-4 text-amber-500"/>)}
        </div>); })}
    </div>);
}
