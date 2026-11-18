// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import 'fake-indexeddb/auto';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { contentFiles } from '@/content/files';
import { loadContent } from '@/content/loader';
import { ExerciseRunner } from '@/features/exercises/ExerciseRunner';

const { course } = loadContent(contentFiles);
const g = course.guidesById.get('prague-transport')!;
const exit = g.practice.flatMap((s) => s.exercises).find((e) => e.id === 'tr-read-exit')!;

describe('A sign-reading question with options', () => {
  it('shows the sign and the choices, with no text box, and explains a wrong pick', async () => {
    render(<MemoryRouter><ExerciseRunner exercises={[exit]} context="guide" retryMissed={false} onAnswer={() => {}} onFinish={() => {}} /></MemoryRouter>);
    expect(screen.getByText('VÝSTUP')).toBeTruthy();
    expect(screen.queryByRole('textbox')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'The entrance' }));
    expect(await screen.findByText(/vstup \(or vchod\)/)).toBeTruthy();
  });
});
