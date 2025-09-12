import { AceternityButton } from "@/components/ui/aceternity-button";

export function AceternityExample() {
  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Aceternity UI Components</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Button Variants</h3>
          <div className="flex gap-4">
            <AceternityButton duration={1} clockwise={true}>
              Default Button
            </AceternityButton>
            
            <AceternityButton duration={2} clockwise={false}>
              Slow Animation
            </AceternityButton>
            
            <AceternityButton duration={0.5} clockwise={true}>
              Fast Animation
            </AceternityButton>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Custom Styling</h3>
          <AceternityButton 
            duration={1.5} 
            clockwise={false}
            className="px-8 py-3 text-lg"
          >
            Large Hover Button
          </AceternityButton>
        </div>
      </div>
    </div>
  );
}
