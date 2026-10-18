import { PracticeApp } from "@/components/PracticeApp";
import { getFilterOptions } from "@/lib/question-bank";

export default function Home() {
  return <PracticeApp filters={getFilterOptions()} />;
}
