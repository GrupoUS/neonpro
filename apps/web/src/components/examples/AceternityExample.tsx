import { AceternityButton } from "@/components/ui/aceternity-button";

export function AceternityExample() {
  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Aceternity UI Components</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Button Variants</h3>
          <div className="flex gap-4">
            <AceternityButton variant="default">
              Default Button
            </AceternityButton>
            
            <AceternityButton variant="shimmer">
              Shimmer Button
            </AceternityButton>
            
            <AceternityButton variant="glow">
              Glow Button
            </AceternityButton>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Custom Styling</h3>
          <AceternityButton 
            variant="shimmer" 
            className="px-8 py-3 text-lg"
          >
            Large Shimmer Button
          </AceternityButton>
        </div>
      </div>
    </div>
  );
}
