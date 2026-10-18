import { PracticeApp } from "@/components/PracticeApp";
import { getFilterOptions } from "@/lib/question-bank";

export default function PracticePage() {
  return <PracticeApp filters={getFilterOptions()} />;
}
