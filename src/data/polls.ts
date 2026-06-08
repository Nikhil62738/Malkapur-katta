export interface PollOption {
  id: string;
  labelKey: string;
}

export interface Poll {
  id: string;
  category: 'events' | 'civic' | 'general';
  questionKey: string;
  options: PollOption[];
  votes?: Record<string, number>;
}
