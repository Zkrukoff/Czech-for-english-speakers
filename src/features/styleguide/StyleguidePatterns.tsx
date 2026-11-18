import { course } from '@/content';
import { CzechText } from '@/components/CzechText';
import { GenderMark } from '@/components/GenderMark';
import { LineStrip } from '@/features/home/LineStrip';
import { Today } from '@/features/home/Today';
import { FeedbackPanel } from '@/features/exercises/FeedbackPanel';
import { ChoiceInput } from '@/features/exercises/types/ChoiceInput';
import { RealiaCard } from '@/features/exercises/types/RealiaCard';
import { UnitComplete } from '@/features/lessons/UnitComplete';
import { lensInfo } from '@/features/lens/lensInfo';
import { LensExplanation } from '@/features/lens/LensExplanation';
import { parseLens } from '@/lib/lens';
import type { CheckResult } from '@/lib/answers/check';
import type { Stop } from '@/content/loader';
import { IdiomPlate } from '@/features/idioms/IdiomPlate';
import { StreakTicket } from '@/features/ticket/StreakTicket';
import { WallBlockSvg } from '@/features/wall/WallBlockSvg';
import { computeTicket } from '@/lib/streak';
import { buildWall } from '@/lib/wall';

const Demo = ({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) => (
  <div className="border-t-2 border-ink pt-4">
    <h3 className="label-board text-ink-3">{title}</h3>
    {note && <p className="mt-1 max-w-2xl text-sm text-ink-2">{note}</p>}
    <div className="mt-4">{children}</div>
  </div>
);

/** Phase 4 screen patterns, rendered from the real components with fixed sample data. */
export function StyleguidePatterns() {
  const lineA = course.lines[0]!;
  const sample = (s: Stop) => (s.kind === 'planned' ? 'vyluka' : s.position < 3 ? 'done' : s.position === 3 ? 'current' : 'open');
  const ex = course.exercisesById.get('u02-l01-e1')?.exercise;
  const base: Omit<CheckResult, 'status' | 'accepted'> = { expected: 'kávu', hintMatched: false, diacriticsOnly: false };
  const token = parseLens('[[kávu|káva|acc|object]]').segments.find((s) => s.type === 'lens');
  const unit = course.units[0]!;
  return (
    <div className="space-y-12">
      <Demo title="Strip map (home)" note="One straight line, angled names, the current station in line-B yellow with a pin, výluka stations dashed, milestones double-ringed, transfers as small line badges. Scrolls sideways on phones, starting where you are.">
        <div className="border-2 border-ink bg-surface pt-2">
          <LineStrip line={lineA} stateOf={sample} homeKey="A/flora" />
        </div>
      </Demo>

      <Demo
        title="Case lens"
        note="Annotated endings are underlined in their case colour. Tap one: a bottom sheet on phones (always reachable, never off-screen), a popover from 640px. It always shows the case number and name, why (the function) and the pattern."
      >
        <p className="text-2xl" lang="cs">
          <CzechText text="Dám si [[kávu|káva|acc|object]] s [[mlékem|mléko|ins|with-s]]. Jsem z [[Anglie|Anglie|gen|after-z]]." />
        </p>
        {token && token.type === 'lens' && (
          <div className="mt-5 max-w-sm border-2 border-ink bg-surface p-5 shadow-offset">
            <LensExplanation info={lensInfo(token)} />
          </div>
        )}
      </Demo>

      <Demo title="Gender marker" note="The same mono marker on every noun; animacy is part of the masculine marker because it changes endings.">
        <div className="flex flex-wrap gap-3">
          {(['m-anim', 'm-inan', 'f', 'n'] as const).map((g) => <GenderMark key={g} gender={g} />)}
        </div>
      </Demo>

      {ex && (
        <Demo title="Feedback states" note="Right: the validator stamp. Wrong: an ink (wavy) underline on the part that's wrong, the right ending in Vltava, then the lens explanation. Never green and red.">
          <div className="grid gap-5 md:grid-cols-2">
            <FeedbackPanel exercise={ex} answer="u" result={{ ...base, status: 'correct', accepted: true }} />
            <FeedbackPanel exercise={ex} answer="a" result={{ ...base, status: 'incorrect', accepted: false, explanation: ex.why }} />
          </div>
        </Demo>
      )}

      <Demo title="Choices and real texts">
        <div className="grid gap-5 md:grid-cols-2">
          <ChoiceInput options={['a', 'u', 'y']} chosen="a" correct={['u']} onChoose={() => {}} render={(o) => <>–{o}</>} />
          <RealiaCard realia={{ kind: 'announcement', title: 'Linka A', lines: ['Příští stanice: Můstek.', 'Přestup na linku B.'] }} />
        </div>
      </Demo>

      <Demo title="Today (home): holiday, name day, countdown" note="On a public holiday the ticket-stock band shows what it is, whether shops are open and what to say. The countdown uses the number rule: za 2 dny, za 5 dní.">
        <div className="grid max-w-3xl gap-5 sm:grid-cols-2">
          <Today date={new Date(2026, 11, 24)} />
          <Today date={new Date(2026, 2, 10)} />
        </div>
      </Demo>

      <Demo title="Round 2: wall, ticket, idiom plate" note="The station wall fills one circle per lesson (done = raised or sunken circle, started = dashed ring) and frames a stamped station in red. The day ticket grows through real PID products and expires without guilt. The idiom sits on a blue enamel plate; all three keep fixed colours in both themes.">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="grid grid-cols-3 content-start gap-2 self-start">
            {buildWall(course, { lessons: new Map([['u01-l01', { completedAt: 1, stepsDone: [] }], ['u01-l02', { completedAt: 1, stepsDone: [] }], ['u02-l01', { stepsDone: ['explanation'] }]]), stamps: new Set(['unit:u01']), alphabetPractised: true })
              .slice(0, 6)
              .map((b) => <span key={b.slug} className="block border-2 border-ink"><WallBlockSvg block={b} /></span>)}
          </div>
          <StreakTicket t={{ ...computeTicket(['2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13'], [], '2026-11-13'), today: '2026-11-13' }} />
          {course.idioms[0] && <IdiomPlate idiom={course.idioms[0]} week={47} />}
        </div>
      </Demo>

      <Demo title="Unit complete: the validator moment" note="The ticket rises in and the stamp punches it, each within 250ms; both are static with reduced motion.">
        <UnitComplete unit={unit} at={new Date(2026, 10, 17).getTime()} />
      </Demo>
    </div>
  );
}
