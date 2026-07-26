// Curated writing-topic suggestions for when a writer isn't sure what to write about.
// Kept client-side and static so a suggestion is instant and always available —
// no API call, no waiting.

export interface Topic {
  category: "IELTS" | "General";
  prompt: string;
}

export const TOPICS: Topic[] = [
  // --- IELTS Task 2 style prompts ---
  {
    category: "IELTS",
    prompt:
      "Some people believe technology has made our lives easier, while others think it has made us too dependent. Discuss both views and give your own opinion.",
  },
  {
    category: "IELTS",
    prompt:
      "Many students today study abroad. Do the advantages of studying in another country outweigh the disadvantages?",
  },
  {
    category: "IELTS",
    prompt:
      "Some people think governments should spend money on public transport rather than building new roads. To what extent do you agree or disagree?",
  },
  {
    category: "IELTS",
    prompt:
      "In many countries, people are working longer hours than before. What are the causes of this, and how does it affect individuals and society?",
  },
  {
    category: "IELTS",
    prompt:
      "Some believe children should start learning a foreign language at primary school rather than secondary school. Discuss the advantages and disadvantages.",
  },
  {
    category: "IELTS",
    prompt:
      "Online shopping is becoming more popular than shopping in stores. Do the benefits of this trend outweigh the drawbacks?",
  },
  {
    category: "IELTS",
    prompt:
      "Some people think that protecting the environment is the responsibility of individuals, while others believe it is the job of governments. Discuss both views.",
  },
  {
    category: "IELTS",
    prompt:
      "Many people believe that social media does more harm than good. To what extent do you agree or disagree?",
  },

  // --- General everyday themes ---
  {
    category: "General",
    prompt:
      "Technology: describe one piece of technology you could not live without, and explain how it changed your daily routine.",
  },
  {
    category: "General",
    prompt:
      "Friendship: write about a friend who influenced you, and what you learned from them.",
  },
  {
    category: "General",
    prompt:
      "Travel: describe a place you would love to visit and explain why it appeals to you.",
  },
  {
    category: "General",
    prompt:
      "Health: explain the habits you follow to stay healthy, and which one matters most to you.",
  },
  {
    category: "General",
    prompt:
      "Education: describe a subject you enjoyed at school and how it shaped the way you think.",
  },
  {
    category: "General",
    prompt:
      "Work: describe your ideal job and the qualities you think you need to do it well.",
  },
  {
    category: "General",
    prompt:
      "City life: compare living in a big city with living in a small town, and say which you prefer.",
  },
  {
    category: "General",
    prompt:
      "Reading: write about a book that stayed with you and the ideas it gave you.",
  },
  {
    category: "General",
    prompt:
      "Family: describe a family tradition that is important to you and why it matters.",
  },
  {
    category: "General",
    prompt:
      "Environment: describe one change people could make to protect the planet, and why it would help.",
  },
  {
    category: "General",
    prompt:
      "Food: describe a dish from your culture and explain what makes it special to you.",
  },
  {
    category: "General",
    prompt:
      "Goals: write about something you hope to achieve in the next five years and your plan to get there.",
  },
];

/** Pick a random topic, avoiding the one currently shown when possible. */
export function nextTopicIndex(current: number): number {
  if (TOPICS.length <= 1) return 0;
  let i = current;
  while (i === current) {
    i = Math.floor(Math.random() * TOPICS.length);
  }
  return i;
}
