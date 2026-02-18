import type { PathStep } from './types';

/**
 * Calculates the turn direction between two vectors
 * Vector A: prev -> curr
 * Vector B: curr -> next
 */
function getTurnDirection(p1: PathStep, p2: PathStep, p3: PathStep): string {
    const v1 = { x: p2.x - p1.x, y: p2.y - p1.y };
    const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };

    const angle1 = Math.atan2(v1.y, v1.x);
    const angle2 = Math.atan2(v2.y, v2.x);

    let diff = angle2 - angle1;
    while (diff > Math.PI) diff -= 2 * Math.PI;
    while (diff < -Math.PI) diff += 2 * Math.PI;

    // Threshold for a turn (roughly 30 degrees)
    const threshold = Math.PI / 6;

    if (diff > threshold) return "Turn Right";
    if (diff < -threshold) return "Turn Left";
    return "Continue Straight";
}

export function generateInstructions(path: PathStep[]): string[] {
    const enhanced = enhancePathWithInstructions(path);
    return enhanced
        .map(step => step.instruction)
        .filter((instr): instr is string => !!instr);
}

export function enhancePathWithInstructions(steps: PathStep[]): PathStep[] {
    if (steps.length === 0) return [];
    if (steps.length === 1) {
        return [{ ...steps[0], instruction: "You are already here." }];
    }

    const enhanced: PathStep[] = steps.map(s => ({ ...s }));

    // 1. Initial Step
    enhanced[0].instruction = "Begin your journey";

    // 2. Intermediate Steps
    for (let i = 1; i < enhanced.length - 1; i++) {
        const prev = enhanced[i - 1];
        const curr = enhanced[i];
        const next = enhanced[i + 1];

        // Floor Transition Logic
        if (curr.floorId !== prev.floorId) {
            const floorDiff = curr.floorId - prev.floorId;
            const direction = floorDiff > 0 ? "Up" : "Down";
            curr.instruction = `Take the elevator/stairs ${direction} to Floor ${curr.floorId}`;
            continue;
        }

        // Turning Logic (only if on same floor)
        if (curr.floorId === next.floorId && curr.floorId === prev.floorId) {
            const turn = getTurnDirection(prev, curr, next);
            if (turn !== "Continue Straight") {
                curr.instruction = `${turn} at the junction`;
                continue;
            }
        }

        // Default or Milestone check (optional)
        if (i % 3 === 0) {
            curr.instruction = "Continue following the hall";
        }
    }

    // 3. Final Step
    enhanced[enhanced.length - 1].instruction = "Arrive at your destination";

    return enhanced;
}
