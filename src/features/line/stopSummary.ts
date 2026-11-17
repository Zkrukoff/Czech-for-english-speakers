import { course } from '@/content';
import type { Stop } from '@/content/loader';

/** What happens at a stop, in English: "Unit 2 · Coffee and lunch near the office". */
export function stopSummary(stop: Stop): { kicker: string; title: string } {
  switch (stop.kind) {
    case 'unit': {
      const u = course.unitsById.get(stop.unit)!;
      return { kicker: `Unit ${u.number}`, title: u.title };
    }
    case 'pronunciation':
      return { kicker: 'Start here', title: 'Pronunciation and the alphabet' };
    case 'milestone': {
      const m = course.milestones.find((x) => x.id === stop.milestone.id);
      return { kicker: `Milestone · ${m?.name ?? ''}`, title: stop.milestone.part === 'review' ? 'Review of everything so far' : `${stop.milestone.level} can-do check` };
    }
    default:
      return { kicker: 'Výluka', title: 'Still being written' };
  }
}
