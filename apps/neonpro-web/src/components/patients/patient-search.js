'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PatientSearch;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var input_1 = require("@/components/ui/input");
var button_1 = require("@/components/ui/button");
var label_1 = require("@/components/ui/label");
var badge_1 = require("@/components/ui/badge");
function PatientSearch(_a) {
    var searchTerm = _a.searchTerm, onSearchChange = _a.onSearchChange;
    var _b = (0, react_1.useState)('name'), searchType = _b[0], setSearchType = _b[1];
    var _c = (0, react_1.useState)(searchTerm), localSearchTerm = _c[0], setLocalSearchTerm = _c[1];
    // Optimized debounce search to avoid excessive API calls
    (0, react_1.useEffect)(function () {
        // Only search if term has minimum length or is empty (for reset)
        if (localSearchTerm.length === 0 || localSearchTerm.length >= 2) {
            var timer_1 = setTimeout(function () {
                onSearchChange(localSearchTerm);
            }, 500); // Increased debounce time for better performance
            return function () { return clearTimeout(timer_1); };
        }
    }, [localSearchTerm, onSearchChange]);
    var handleClearSearch = function () {
        setLocalSearchTerm('');
        onSearchChange('');
    };
    var getSearchPlaceholder = function () {
        switch (searchType) {
            case 'name':
                return 'Digite o nome do paciente...';
            case 'phone':
                return 'Digite o telefone (ex: 11999999999)...';
            case 'email':
                return 'Digite o email do paciente...';
            case 'cpf':
                return 'Digite o CPF (ex: 123.456.789-00)...';
            default:
                return 'Digite para buscar...';
        }
    };
    var getSearchIcon = function () {
        switch (searchType) {
            case 'name':
                return <lucide_react_1.User className="h-4 w-4"/>;
            case 'phone':
                return <lucide_react_1.Phone className="h-4 w-4"/>;
            case 'email':
                return <lucide_react_1.Mail className="h-4 w-4"/>;
            case 'cpf':
                return <lucide_react_1.FileText className="h-4 w-4"/>;
            default:
                return <lucide_react_1.Search className="h-4 w-4"/>;
        }
    };
    var formatSearchInput = function (value) {
        switch (searchType) {
            case 'cpf':
                // Format CPF as user types
                return value
                    .replace(/\D/g, '')
                    .replace(/(\d{3})(\d)/, '$1.$2')
                    .replace(/(\d{3})(\d)/, '$1.$2')
                    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
                    .replace(/(-\d{2})\d+?$/, '$1');
            case 'phone':
                // Format phone as user types
                return value
                    .replace(/\D/g, '')
                    .replace(/(\d{2})(\d)/, '($1) $2')
                    .replace(/(\d{4})(\d)/, '$1-$2')
                    .replace(/(\d{4})-(\d)(\d{4})/, '$1$2-$3')
                    .replace(/(-\d{4})\d+?$/, '$1');
            default:
                return value;
        }
    };
    var handleInputChange = function (e) {
        var rawValue = e.target.value;
        var formattedValue = formatSearchInput(rawValue);
        setLocalSearchTerm(formattedValue);
    };
    return (<div className="space-y-4">
      {/* Search Type Selector */}
      <div className="flex flex-wrap gap-2">
        <label_1.Label className="text-sm font-medium flex items-center">
          Buscar por:
        </label_1.Label>
        <div className="flex flex-wrap gap-2">
          <button_1.Button variant={searchType === 'name' ? 'default' : 'outline'} size="sm" onClick={function () { return setSearchType('name'); }} className="h-8">
            <lucide_react_1.User className="h-3 w-3 mr-1"/>
            Nome
          </button_1.Button>
          <button_1.Button variant={searchType === 'phone' ? 'default' : 'outline'} size="sm" onClick={function () { return setSearchType('phone'); }} className="h-8">
            <lucide_react_1.Phone className="h-3 w-3 mr-1"/>
            Telefone
          </button_1.Button>
          <button_1.Button variant={searchType === 'email' ? 'default' : 'outline'} size="sm" onClick={function () { return setSearchType('email'); }} className="h-8">
            <lucide_react_1.Mail className="h-3 w-3 mr-1"/>
            Email
          </button_1.Button>
          <button_1.Button variant={searchType === 'cpf' ? 'default' : 'outline'} size="sm" onClick={function () { return setSearchType('cpf'); }} className="h-8">
            <lucide_react_1.FileText className="h-3 w-3 mr-1"/>
            CPF
          </button_1.Button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
          {getSearchIcon()}
        </div>
        <input_1.Input type="text" placeholder={getSearchPlaceholder()} value={localSearchTerm} onChange={handleInputChange} className="pl-10 pr-10" maxLength={searchType === 'cpf' ? 14 : searchType === 'phone' ? 15 : undefined}/>
        {localSearchTerm && (<button_1.Button variant="ghost" size="sm" onClick={handleClearSearch} className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted">
            <lucide_react_1.X className="h-4 w-4"/>
          </button_1.Button>)}
      </div>

      {/* Search Tips */}
      <div className="text-xs text-muted-foreground space-y-1">
        <div>
          <strong>Dicas de busca:</strong>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>• Nome: busca por nome completo ou parcial</div>
          <div>• Telefone: aceita formato (11) 99999-9999</div>
          <div>• Email: busca por endereço de email</div>
          <div>• CPF: aceita formato 123.456.789-00</div>
        </div>
      </div>

      {/* Active Search Indicator */}
      {localSearchTerm && (<div className="flex items-center gap-2">
          <badge_1.Badge variant="secondary" className="flex items-center gap-1">
            <lucide_react_1.Search className="h-3 w-3"/>
            Buscando por {searchType === 'name' ? 'nome' :
                searchType === 'phone' ? 'telefone' :
                    searchType === 'email' ? 'email' : 'CPF'}: 
            <span className="font-medium ml-1">{localSearchTerm}</span>
          </badge_1.Badge>
          <button_1.Button variant="ghost" size="sm" onClick={handleClearSearch} className="h-6 px-2 text-xs">
            Limpar
          </button_1.Button>
        </div>)}
    </div>);
}
