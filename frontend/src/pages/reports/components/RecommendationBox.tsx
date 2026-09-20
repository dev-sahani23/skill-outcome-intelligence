import { Lightbulb } from "lucide-react";

interface RecommendationBoxProps {
  text: string;
}

export function RecommendationBox({ text }: RecommendationBoxProps) {
  if (!text) return null;

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mt-6 flex gap-3 items-start shadow-[inset_0_2px_10px_rgba(255,71,87,0.05)]">
      <div className="bg-primary/20 p-2 rounded-full text-primary">
        <Lightbulb className="w-5 h-5" />
      </div>
      <div>
        <h4 className="text-primary font-semibold text-sm mb-1 uppercase tracking-wide">Recommendation</h4>
        <p className="text-sm text-foreground leading-relaxed">
          {text}
        </p>
      </div>
    </div>
  );
}
