import { useParams } from 'react-router-dom';
import { course } from '@/content';
import { PageHeader } from '@/components/PageHeader';
import { NotFound } from '@/components/NotFound';
import { CourseMarkdown } from '@/components/CourseMarkdown';
import { ReviewStatusBadge } from '@/components/ReviewStatusBadge';
import { Placeholder } from '@/components/Placeholder';

export function LessonPage() {
  const { lessonId = '' } = useParams();
  const lesson = course.lessonsById.get(lessonId);
  if (!lesson) return <NotFound what="lesson" />;
  const unit = course.unitsById.get(lesson.unitId)!;
  return (
    <>
      <PageHeader eyebrow={`Unit ${unit.number} · Lesson ${lesson.number}`} title={lesson.title}>
        <div className="mt-3"><ReviewStatusBadge reviewed={lesson.nativeReviewed} /></div>
      </PageHeader>
      <CourseMarkdown>{lesson.explanationMd}</CourseMarkdown>
      <div className="mt-8"><Placeholder milestone="(c): vocabulary, dialogue and exercises" /></div>
    </>
  );
}
