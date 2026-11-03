import type { Exercise } from '../../content/types';
import { ChoiceQuestionView } from './ChoiceQuestionView';
import { MatchExerciseView } from './MatchExerciseView';
import { OrderExerciseView } from './OrderExerciseView';

interface Props {
  exercise: Exercise;
  onFirstAnswer?: (correct: boolean) => void;
  onDone?: () => void;
  doneLabel?: string;
  learnLink?: { href: string; label: string };
}

/** Sceglie il componente adatto al tipo di esercizio (modalità pratica). */
export function ExerciseView({ exercise, ...rest }: Props) {
  if (exercise.kind === 'order') return <OrderExerciseView exercise={exercise} {...rest} />;
  if (exercise.kind === 'match') return <MatchExerciseView exercise={exercise} {...rest} />;
  return <ChoiceQuestionView question={exercise} mode="practice" {...rest} onFirstAnswer={(c) => rest.onFirstAnswer?.(c)} />;
}
