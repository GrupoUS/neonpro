"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DuplicateManagerHookMinimal;
var button_1 = require("@/components/ui/button");
var react_1 = require("react");
function DuplicateManagerHookMinimal(_a) {
    var duplicates = _a.duplicates;
    // Test minimal hook usage
    var _b = react_1.default.useState(null), selectedId = _b[0], setSelectedId = _b[1];
    return (<div className="space-y-4">
      <h2 className="text-xl font-semibold">Hook Minimal Duplicate Manager</h2>

      {duplicates.map(function (duplicate) { return (<div key={duplicate.id} className="border p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-muted-foreground">
              Confidence: {Math.round(duplicate.confidence * 100)}%
            </span>
            <button_1.Button variant={selectedId === duplicate.id ? "default" : "outline"} onClick={function () { return setSelectedId(duplicate.id); }}>
              {selectedId === duplicate.id ? "Selected" : "Select"}
            </button_1.Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="border p-3 rounded">
              <h4 className="font-medium">{duplicate.patient1.name}</h4>
              <p className="text-sm text-muted-foreground">
                {duplicate.patient1.email}
              </p>
            </div>
            <div className="border p-3 rounded">
              <h4 className="font-medium">{duplicate.patient2.name}</h4>
              <p className="text-sm text-muted-foreground">
                {duplicate.patient2.email}
              </p>
            </div>
          </div>
        </div>); })}
    </div>);
}
