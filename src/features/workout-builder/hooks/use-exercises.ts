"use client";

import { useQuery } from "@tanstack/react-query";
import { ExerciseAttributeValueEnum } from "@prisma/client";

import { getExercisesAction } from "../actions/get-exercises.action";

interface UseExercisesProps {
  equipment: ExerciseAttributeValueEnum[];
  muscles: ExerciseAttributeValueEnum[];
  enabled?: boolean;
}

export function useExercises({ equipment, muscles, enabled = true }: UseExercisesProps) {
  return useQuery({
    queryKey: ["exercises", equipment.sort(), muscles.sort()],
    queryFn: async () => {
      if (equipment.length === 0) {
        return [];
      }

      // If only equipment is selected, use getExercisesByMuscleAction
      if (muscles.length === 0) {
        const { getExercisesByMuscleAction } = await import("../actions/get-exercises-by-muscle.action");
        const result = await getExercisesByMuscleAction({
          equipment,
        });
        if (result?.serverError) {
          throw new Error(result.serverError);
        }
        return result?.data || [];
      }

      // If both equipment and muscles are selected, use regular action
      const result = await getExercisesAction({
        equipment,
        muscles,
        limit: 3,
      });

      if (result?.serverError) {
        throw new Error(result.serverError);
      }

      return result?.data || [];
    },
    enabled: enabled && equipment.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
